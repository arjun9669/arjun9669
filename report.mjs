/**
 * Portable evidence reports for the browser-only document Q&A demo.
 * No external libraries, requests or persistence; every quote is verified.
 */

function clean(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim();
}

function blockquote(value) {
  return clean(value).split("\n").map(line => "> " + line).join("\n");
}

function inline(value) {
  return clean(value).replace(/([\\\x60*_{}\[\]()#+.!>|-])/g, "\\$1").replace(/\n/g, " ");
}

/**
 * A self-contained Markdown evidence report. Refuses to create one if any
 * displayed quotation is not an actual substring of the cited excerpt.
 */
export function createEvidenceReport(question, result) {
  if (!result || typeof result !== "object" || !Array.isArray(result.sources)) {
    throw new TypeError("Invalid retrieval result");
  }
  const sources = result.sources;
  if (result.answered && !sources.length) throw new Error("Answered result has no cited sources");

  const sections = [
    "# GroundedDesk — evidence report",
    "",
    "## Question",
    "",
    blockquote(question),
    "",
    "## Answer",
    "",
    result.answered ? "" : blockquote(result.answer || "No supporting evidence found."),
  ];

  if (result.answered) {
    for (const [index, source] of sources.entries()) {
      if (source.citation !== index + 1) throw new Error("Invalid citation numbering");
      if (typeof source.excerpt !== "string" || typeof source.quote !== "string"
          || !source.quote || !source.excerpt.includes(source.quote)) {
        throw new Error("Evidence check failed: quotation not present in cited excerpt");
      }
      sections.push(blockquote("[" + source.citation + "] " + source.quote), "");
    }
    sections.push("## Source evidence", "");
    for (const source of sources) {
      sections.push(
        "### [" + source.citation + "] " + inline(source.filename),
        "",
        "**File:** " + inline(source.filename),
        "",
        "**BM25-style rank score:** " + (Number.isFinite(source.score) ? source.score.toFixed(2) : "not recorded"),
        "",
        "**Quoted sentence / passage:**",
        "",
        blockquote(source.quote),
        "",
        "**Retrieved excerpt:**",
        "",
        blockquote(source.excerpt),
        "",
      );
    }
  }

  sections.push(
    "---",
    "",
    "*Locally generated extractive retrieval report. Source passages are quotes, not an AI-generated explanation. BM25-style scores are uncalibrated ranking values, not reliability probabilities. Do not distribute reports containing confidential uploaded documents.*",
    "",
  );
  return sections.join("\n");
}
