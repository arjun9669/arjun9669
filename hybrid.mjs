/**
 * Pure retrieval fusion. No network, no fake embeddings: callers must supply
 * actual model-generated vectors. Stable sorting permits reproducible tests.
 */
import { keywordRank } from "./retrieval.mjs";

export const SEMANTIC_THRESHOLD = 0.36;

export function cosineSimilarity(a, b) {
  if (!a || !b || typeof a.length !== "number" || a.length === 0 || a.length !== b.length) {
    throw new Error("Embedding dimension mismatch");
  }
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = Number(a[i]), y = Number(b[i]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("Nonfinite embedding values");
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (!na || !nb) throw new Error("Zero-length embedding vector");
  return Math.max(-1, Math.min(1, dot / Math.sqrt(na * nb)));
}

/**
 * Reciprocal rank fusion combines the whole lexical ranking with a thresholded
 * semantic ranking. RRF scores are NOT BM25 scores or confidence probabilities.
 * Pass embeddings in the same order as index.chunks.
 */
export function hybridRank(question, index, queryEmbedding, documentEmbeddings, opts = {}) {
  if (!Array.isArray(documentEmbeddings) || documentEmbeddings.length !== index.chunks.length) {
    throw new Error("Semantic index is missing or stale");
  }
  const { threshold = SEMANTIC_THRESHOLD, lexicalWeight = 0.45, semanticWeight = 0.55, k = 20 } = opts;
  if (!Number.isFinite(threshold) || threshold < -1 || threshold > 1 ||
      lexicalWeight < 0 || semanticWeight < 0 || lexicalWeight + semanticWeight === 0 ||
      !Number.isFinite(k) || k <= 0) {
    throw new Error("Invalid hybrid ranking options");
  }
  const lexical = keywordRank(question, index);
  const semantic = index.chunks.map((chunk, i) => ({
    chunk, semanticScore: cosineSimilarity(queryEmbedding, documentEmbeddings[i])
  }))
    .filter(item => item.semanticScore >= threshold)
    .sort((a, b) => b.semanticScore - a.semanticScore || a.chunk.id.localeCompare(b.chunk.id));

  const combined = new Map();
  for (const [i, candidate] of lexical.entries()) {
    combined.set(candidate.id, {
      ...candidate, lexicalScore: candidate.score, semanticScore: null,
      score: lexicalWeight / (k + i + 1)
    });
  }
  for (const [i, item] of semantic.entries()) {
    const value = combined.get(item.chunk.id);
    if (value) {
      value.score += semanticWeight / (k + i + 1);
      value.semanticScore = item.semanticScore;
    } else {
      combined.set(item.chunk.id, {
        ...item.chunk, lexicalScore: null, semanticScore: item.semanticScore,
        score: semanticWeight / (k + i + 1)
      });
    }
  }
  return [...combined.values()].sort((a,b) =>
    b.score - a.score || a.id.localeCompare(b.id));
}
