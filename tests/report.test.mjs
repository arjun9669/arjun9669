import test from "node:test";
import assert from "node:assert/strict";
import { buildIndex, answerQuestion } from "../retrieval.mjs";
import { createEvidenceReport } from "../report.mjs";

const documents = [
  { id: "a", name: "cloud-architecture.txt", text:
    "PostgreSQL stores document metadata. Redis caches temporary results. The retrieval service cites each source passage." },
  { id: "b", name: "governance.txt", text:
    "Human reviewers evaluate risky AI uses and inspect evidence before deployment." },
];

test("Markdown report preserves question, literal evidence, and filenames", () => {
  const answer = answerQuestion("Where does PostgreSQL store document metadata?", buildIndex(documents));
  assert.equal(answer.answered, true);
  const report = createEvidenceReport("Where does PostgreSQL store document metadata?", answer);
  assert.match(report, /# GroundedDesk — evidence report/);
  assert.match(report, /> Where does PostgreSQL store document metadata\?/);
  assert.match(report, /cloud\\-architecture\\.txt/);
  assert.match(report, /PostgreSQL stores document metadata/);
  assert.match(report, /Retrieval rank score/);
  assert.equal(report, createEvidenceReport("Where does PostgreSQL store document metadata?", answer));
});

test("refusal exports honestly with no invented citations", () => {
  const answer = answerQuestion("Where can I find Martian elephant recipes?", buildIndex(documents));
  assert.equal(answer.answered, false);
  const report = createEvidenceReport("Where can I find Martian elephant recipes?", answer);
  assert.match(report, /I can't find this in the provided documents/);
  assert.ok(!report.includes("## Source evidence"));
});

test("grounding check rejects fabricated or mismatched quotes", () => {
  const answer = answerQuestion("Where does PostgreSQL store document metadata?", buildIndex(documents));
  assert.equal(answer.answered, true);
  const fake = structuredClone(answer);
  fake.sources[0].quote = "An unsupported claim never found in the document";
  assert.throws(() => createEvidenceReport("Question", fake), /Evidence check failed/);
});

test("Markdown export neutralizes untrusted filename formatting", () => {
  const answer = answerQuestion("Where does PostgreSQL store document metadata?", buildIndex(documents));
  const forged = structuredClone(answer);
  forged.sources[0].filename = "evil]([payload].md";
  const report = createEvidenceReport("Question", forged);
  assert.match(report, /evil\\\]/);
});

test("long unpunctuated passage quotes remain literal source substrings", () => {
  const text = "Background context ".repeat(28)
    + "quantum sensing calibration happens on Tuesday under supervision "
    + "Additional context ".repeat(7);
  const index = buildIndex([{ id:"long", name:"long.txt", text }]);
  const result = answerQuestion("When does quantum sensing calibration happen?", index);
  assert.equal(result.answered, true);
  assert.ok(result.sources[0].quote.length <= 420);
  assert.ok(result.sources[0].excerpt.includes(result.sources[0].quote));
  assert.match(result.sources[0].quote, /quantum sensing calibration/);
  assert.doesNotThrow(() => createEvidenceReport("When?", result));
});
