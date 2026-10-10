/**
 * GroundedDesk 4.0: scripted, auditable document research.
 * Offline/no LLM/no external search. Does not obey instructions inside documents.
 * Its "agent" is a deterministic retrieve -> cross-check -> report workflow,
 * not an autonomous AI agent or a fact-entailment verifier.
 */
import { buildIndex, keywordRank, answerFromCandidates, tokenize } from "./retrieval.mjs";

const MAX_QUERY = 600;
const FLAG_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions/i,
  /(?:system|developer)\s*:\s*(?:ignore|override|reveal|send)/i,
  /(?:send|upload|exfiltrate)\s+(?:the\s+)?(?:document|file|secrets?|api\s*keys?)\s+to\b/i,
  /(?:disregard|override)\s+(?:the\s+)?(?:safety|system|developer)\s+(?:rules|instructions|prompt)/i,
];

export function hasInstructionRisk(value) {
  return FLAG_PATTERNS.some(pattern => pattern.test(String(value)));
}

export function planResearch(question) {
  const query = String(question ?? "").trim().replace(/\s+/g, " ");
  if (!query || query.length > MAX_QUERY) throw new Error("Research question must be 1–600 characters.");
  return {
    query,
    steps: [
      { id:"retrieve", title:"Retrieve", detail:"Rank matching passages from the loaded documents" },
      { id:"cross-check", title:"Cross-check", detail:"Inspect distinct documents and highlight source coverage" },
      { id:"report", title:"Report", detail:"Quote verified excerpts, flag suspicious instructions, and identify evidence gaps" },
    ],
  };
}

function assertSources(sources, documents) {
  const byId = new Map(documents.map(d => [d.id, d]));
  // The shared chunker normalizes repeated spaces/tabs before retrieval.
  // Check provenance against that *normalized* original text rather than
  // treating whitespace normalization as an invented passage.
  for (const source of sources) {
    const document = byId.get(source.documentId);
    if (!document || document.name !== source.filename ||
        !document.text.replace(/\r\n?/g,"\n").replace(/[ \t]+/g," ").trim().includes(source.excerpt) ||
        !source.excerpt.includes(source.quote)) {
      throw new Error("Source provenance verification failed");
    }
  }
}

function safeExcerpt(candidate, query) {
  const picked = answerFromCandidates(query, [candidate], 1);
  return picked.sources[0] || null;
}

export function buildResearchResult(question, documents, index = buildIndex(documents), ranked = keywordRank(question, index)) {
  const plan = planResearch(question);
  if (!Array.isArray(documents) || !Array.isArray(ranked)) throw new TypeError("Invalid research input");
  const candidates = [];
  const seen = new Set();
  // Include one distinct best-matching passage per document. Limit to 6 so
  // browser reports stay legible and avoid exposing excessive private content.
  for (const candidate of ranked) {
    if (!seen.has(candidate.documentId)) {
      const doc = documents.find(d => d.id === candidate.documentId);
      if (!doc || doc.name !== candidate.filename) throw new Error("Document index is out of sync");
      seen.add(candidate.documentId);
      candidates.push(candidate);
    }
    if (candidates.length === 6) break;
  }
  const sources = candidates.map((candidate, i) => {
    const extracted = safeExcerpt(candidate, plan.query);
    if (!extracted) throw new Error("Unable to construct cited excerpt");
    return { ...extracted, citation: i + 1, warning: hasInstructionRisk(candidate.content) };
  });
  assertSources(sources, documents);
  const uncovered = documents.filter(d => !seen.has(d.id)).map(d => d.name);
  return {
    kind: "research", plan, question:plan.query,
    sources, matchedDocuments: sources.length,
    availableDocuments: documents.length, uncovered,
    flaggedSources: sources.filter(s => s.warning).length,
    answered: sources.length > 0,
    mode: "Scripted extractive multi-document research — no autonomous agent or factuality guarantee",
  };
}

/** Pairs exact source quotations. These are not inferred agreements or contradictions. */
export function compareDocuments(documentA, documentB, question = "") {
  if (!documentA || !documentB || documentA.id === documentB.id) {
    throw new Error("Choose two distinct documents.");
  }
  if (typeof documentA.text !== "string" || typeof documentB.text !== "string") {
    throw new Error("Both documents must contain text.");
  }
  const topic = String(question ?? "").trim();
  if (topic.length > MAX_QUERY) throw new Error("Comparison topic exceeds 600 characters.");
  const docs = [documentA, documentB];
  const sources = docs.map((doc, i) => {
    let excerpt = "";
    if (topic) {
      const index = buildIndex([doc]);
      const candidates = keywordRank(topic, index);
      if (candidates.length) {
        const result = answerFromCandidates(topic, candidates, 1);
        excerpt = result.sources[0]?.quote ?? "";
      }
    } else {
      // Overview mode picks literal opening text. Never invent an interpretation.
      const plain = doc.text.trim();
      excerpt = plain.slice(0, 360);
    }
    if (excerpt && !doc.text.replace(/\r\n?/g,"\n").replace(/[ \t]+/g," ").trim().includes(excerpt)) throw new Error("Comparison evidence is not from source");
    return { citation:i+1, documentId:doc.id, filename:doc.name,
      excerpt, warning:hasInstructionRisk(excerpt), supported:Boolean(excerpt) };
  });
  const left = new Set(tokenize(documentA.text).filter(x => x.length > 3));
  const right = new Set(tokenize(documentB.text).filter(x => x.length > 3));
  // Shared words do not imply semantically shared claims.
  const sharedTerms = [...left].filter(term => right.has(term)).sort().slice(0, 12);
  const result = {
    kind: "comparison", question:topic, sources, sharedTerms,
    answered:sources.some(s => s.supported),
    note:"Shared terms indicate word overlap only. These excerpts do not establish agreement, contradiction, or missing facts.",
  };
  return result;
}

const cleanLine = value => String(value ?? "").replace(/\r\n?/g,"\n").replace(/[\u0000-\u001f]/g," ").trim();
const quote = text => cleanLine(text).split("\n").map(line => "> " + line).join("\n");
const safeTitle = text => cleanLine(text).replace(/[\\\x60*_{}\[\]()#+.!>|-]/g,"\\$&");

export function formatResearchMarkdown(result) {
  if (!result || !["research","comparison"].includes(result.kind)) throw new TypeError("Invalid report");
  const lines = ["# GroundedDesk AI 4.0 — evidence report", "",
    "**Method:** Local deterministic retrieval and source quotation. Not factual verification or autonomous web research.", ""];
  if (result.question) lines.push("**Question/topic:** " + safeTitle(result.question), "");
  if (result.kind === "research") {
    lines.push("## Research workflow", "");
    for (const step of result.plan.steps) lines.push("- " + step.title + ": " + step.detail);
    lines.push("", "## Cross-document evidence", "");
    if (!result.answered) lines.push("No matching source evidence found. Do not infer an answer.", "");
    for (const source of result.sources) {
      lines.push("### [" + source.citation + "] " + safeTitle(source.filename), "",
        quote(source.quote), "",
        source.warning ? "**Review flag:** Possible instruction-shaped content was detected; treated as untrusted document data." : "",
        "");
    }
    lines.push("## Coverage and gaps", "",
      result.matchedDocuments + " of " + result.availableDocuments + " loaded documents had keyword-matching evidence.", "");
    if (result.uncovered.length) lines.push("No keyword match found for: " + result.uncovered.map(safeTitle).join("; ") + ".", "");
  } else {
    lines.push("## Side-by-side excerpts", "");
    for (const source of result.sources) {
      lines.push("### [" + source.citation + "] " + safeTitle(source.filename), "",
        source.supported ? quote(source.excerpt) : "No matching passage was found using lexical retrieval for this topic.", "",
        source.warning ? "**Review flag:** Possible instruction-shaped content detected; treated as data." : "", "");
    }
    lines.push("## Shared vocabulary (not agreement)", "",
      result.sharedTerms.length ? result.sharedTerms.map(safeTitle).join(", ") : "No shared long terms in the selected documents.", "");
  }
  lines.push("---", "", "*For research assistance only. Keyword matches can miss paraphrases; absence of a match does not prove absence of a fact. Do not redistribute private document text without permission.*", "");
  return lines.join("\n");
}
