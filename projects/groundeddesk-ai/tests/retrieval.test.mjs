import test from "node:test";
import assert from "node:assert/strict";
import { tokenize, chunkText, buildIndex, answerQuestion } from "../retrieval.mjs";

const documents = [
  { id: "one", name: "governance.txt", text: "Every AI use case requires a named owner. Document grounded answers provide source citations. Human reviewers evaluate refusal behavior." },
  { id: "two", name: "cloud.txt", text: "Redis stores short-lived cached results. PostgreSQL stores document metadata. An API requires authentication and health checks." },
];

test("tokenization filters common stopwords and normalizes case", () => {
  assert.deepEqual(tokenize("What is the REDIS cache?"), ["redis", "cache"]);
});

test("chunking preserves long material within bounds", () => {
  const chunks = chunkText("sample ".repeat(750));
  assert.ok(chunks.length > 3);
  assert.ok(chunks.every(chunk => chunk.content.length <= 760));
});

test("relevant question returns actual cited text", () => {
  const result = answerQuestion("How do we store Redis cache results?", buildIndex(documents));
  assert.equal(result.answered, true);
  assert.equal(result.sources[0].filename, "cloud.txt");
  assert.match(result.answer, /Redis stores short-lived cached results/);
  assert.ok(result.sources[0].excerpt.includes(result.sources[0].quote));
});

test("unsupported topic explicitly refuses", () => {
  const result = answerQuestion("How many elephants live in Nairobi?", buildIndex(documents));
  assert.equal(result.answered, false);
  assert.equal(result.sources.length, 0);
});

test("empty input and documents refuse", () => {
  assert.equal(answerQuestion("", buildIndex(documents)).answered, false);
  assert.equal(answerQuestion("cloud", buildIndex([])).answered, false);
});

test("oversized document is rejected", () => {
  assert.throws(() => buildIndex([{ id: "x", name: "oversized", text: "a".repeat(180001) }]));
});

test("citation numbering is stable", () => {
  const result = answerQuestion("What is document metadata and why does retrieval need source citations?", buildIndex(documents));
  assert.equal(result.answered, true);
  assert.deepEqual(result.sources.map(source => source.citation), result.sources.map((_, i) => i + 1));
});
