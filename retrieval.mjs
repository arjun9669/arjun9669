/** GroundedDesk's deterministic extractive retrieval engine. No network calls. */
const STOP = new Set(("a an and are as at be been but by can could do does for from had has have how i if in into is it its of on or our that the their there these this to was were what when where which who why will with would you your").split(" "));

export function tokenize(value) {
  return (String(value).normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter(word => word.length > 1 && !STOP.has(word));
}

export function chunkText(text, size = 760, overlap = 100) {
  if (!Number.isInteger(size) || size < 100 || overlap < 0 || overlap >= size) {
    throw new Error("Invalid chunk settings");
  }
  const clean = String(text).replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
  const parts = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const split = clean.lastIndexOf(" ", end);
      if (split > start + Math.floor(size / 2)) end = split;
    }
    const content = clean.slice(start, end).trim();
    if (content) parts.push({ start, end, content });
    if (end >= clean.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return parts;
}

export function buildIndex(documents) {
  const chunks = [];
  for (const document of documents) {
    if (!document || typeof document.text !== "string" || document.text.length > 180000) {
      throw new Error("Invalid document or document exceeds 180,000 characters");
    }
    for (const part of chunkText(document.text)) {
      const words = tokenize(part.content);
      if (!words.length) continue;
      const tf = new Map();
      for (const word of words) tf.set(word, (tf.get(word) || 0) + 1);
      chunks.push({ id: `${document.id}:${part.start}`, documentId: document.id,
        filename: document.name, content: part.content, start: part.start,
        tokens: words, tf });
    }
  }
  const df = new Map();
  for (const chunk of chunks) {
    for (const term of chunk.tf.keys()) df.set(term, (df.get(term) || 0) + 1);
  }
  const avgLength = chunks.length ? chunks.reduce((sum, c) => sum + c.tokens.length, 0) / chunks.length : 1;
  return { chunks, df, avgLength };
}

function bestSentence(content, terms) {
  const sentences = content.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  let best = content;
  let bestScore = -1;
  for (const sentence of sentences) {
    const words = new Set(tokenize(sentence));
    const score = terms.reduce((n, term) => n + Number(words.has(term)), 0);
    if (score > bestScore) { best = sentence; bestScore = score; }
  }
  return best.length > 420 ? best.slice(0, 417) + "…" : best;
}

export function answerQuestion(question, index, maxSources = 3) {
  const unique = [...new Set(tokenize(question))];
  if (!unique.length || !index.chunks.length) {
    return { answered: false, answer: "I can't find this in the provided documents.", sources: [] };
  }
  const n = index.chunks.length;
  const candidates = [];
  for (const chunk of index.chunks) {
    let score = 0, matched = 0;
    for (const term of unique) {
      const count = chunk.tf.get(term) ?? 0;
      if (!count) continue;
      matched++;
      const freq = index.df.get(term) ?? 0;
      const idf = Math.log(1 + (n - freq + 0.5) / (freq + 0.5));
      score += idf * (count * 2.2) / (count + 1.2 * (0.25 + 0.75 * chunk.tokens.length / index.avgLength));
    }
    const fraction = matched / unique.length;
    if (score > 0 && fraction >= (unique.length <= 2 ? 0.5 : 0.34)) {
      candidates.push({ ...chunk, score, matched, fraction });
    }
  }
  candidates.sort((a,b) => b.score - a.score || b.matched - a.matched || a.filename.localeCompare(b.filename));
  const picked = [];
  const seen = new Set();
  for (const candidate of candidates) {
    if (seen.has(candidate.documentId)) continue;
    seen.add(candidate.documentId);
    picked.push(candidate);
    if (picked.length >= maxSources) break;
  }
  if (!picked.length) return { answered: false, answer: "I can't find this in the provided documents.", sources: [] };
  const sources = picked.map((candidate, i) => ({
    citation: i + 1, id: candidate.id, documentId: candidate.documentId,
    filename: candidate.filename, excerpt: candidate.content,
    quote: bestSentence(candidate.content, unique),
    score: Math.round(candidate.score * 100) / 100,
    matchedTerms: unique.filter(term => candidate.tf.has(term)),
  }));
  return {
    answered: true,
    answer: sources.map(s => `[${s.citation}] ${s.quote}`).join("\n\n"),
    sources,
    mode: "Deterministic extractive retrieval (BM25-style, no LLM)",
    note: "Relevance scores rank passages; they are not probabilities or verified answer accuracy."
  };
}
