#!/usr/bin/env node
/**
 * Reproducible, deliberately small offline evaluation over included sample docs.
 * Never treat its scores as external validation or model accuracy.
 * Usage: node eval/run.mjs [--json] [--strict]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { performance } from "node:perf_hooks";
import { buildIndex, answerQuestion } from "../retrieval.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = JSON.parse(readFileSync(resolve(root, "eval/queries.json"), "utf8"));
const samples = [
  ["AI Governance Playbook", "samples/ai-governance.txt"],
  ["Cloud Architecture Guide", "samples/cloud-architecture.txt"],
  ["Sustainability Operations Brief", "samples/sustainability.txt"],
].map(([name, path], i) => ({
  id: "sample-" + i, name, text: readFileSync(resolve(root, path), "utf8"),
}));
const index = buildIndex(samples);
const supported = fixture.cases.filter(item => item.expected_source !== null);
const unsupported = fixture.cases.filter(item => item.expected_source === null);
if (supported.length < 10 || unsupported.length < 5) {
  throw new Error("Evaluation must have at least 10 supported and 5 unsupported questions.");
}
const seenIds = new Set();
let topOneHits = 0;
let supportedAnswered = 0;
let correctRefusals = 0;
let falseAccepts = 0;
let invalidCitations = 0;
const times = [];
const cases = fixture.cases.map(item => {
  if (!item.id || !item.question || seenIds.has(item.id)) throw new Error("Duplicate or invalid fixture");
  seenIds.add(item.id);
  const t0 = performance.now();
  const answer = answerQuestion(item.question, index);
  const latencyMs = performance.now() - t0;
  times.push(latencyMs);
  for (const source of answer.sources) {
    const doc = samples.find(d => d.name === source.filename);
    if (!doc || !doc.text.includes(source.quote) || !doc.text.includes(source.excerpt)) {
      invalidCitations++;
    }
  }
  const relevant = item.expected_source !== null;
  if (relevant) {
    if (answer.answered) supportedAnswered++;
    if (answer.answered && answer.sources[0]?.filename === item.expected_source) topOneHits++;
  } else if (!answer.answered) {
    correctRefusals++;
  } else {
    falseAccepts++;
  }
  return {
    id: item.id, expected_source: item.expected_source, answered: answer.answered,
    top_source: answer.sources[0]?.filename ?? null,
    valid: relevant ? answer.sources[0]?.filename === item.expected_source : !answer.answered,
    latency_ms: Number(latencyMs.toFixed(3)),
  };
});
const rate = (n,d) => d ? Number((n / d).toFixed(4)) : null;
const sorted = [...times].sort((a,b)=>a-b);
const report = {
  description: "Tiny labeled offline sample evaluation — NOT an external benchmark.",
  corpus_documents: samples.length,
  corpus_chunks: index.chunks.length,
  supported_questions: supported.length,
  out_of_domain_questions: unsupported.length,
  top1_source_accuracy_on_supported: rate(topOneHits, supported.length),
  supported_question_answer_rate: rate(supportedAnswered, supported.length),
  out_of_domain_refusal_rate: rate(correctRefusals, unsupported.length),
  false_accept_count: falseAccepts,
  citation_provenance_errors: invalidCitations,
  median_latency_ms: Number(sorted[Math.floor(sorted.length/2)].toFixed(3)),
  p95_latency_ms: Number(sorted[Math.ceil(0.95 * sorted.length)-1].toFixed(3)),
  cases,
};
if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
} else {
  for (const [k,v] of Object.entries(report)) if(k !== "cases") console.log(k + ": " + v);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  const summary = [
    "### GroundedDesk offline retrieval evaluation",
    "",
    "| Metric | Actual result |",
    "|---|---:|",
    "| Supported Qs | " + supported.length + " |",
    "| Out-of-domain Qs | " + unsupported.length + " |",
    "| Top-1 source accuracy | " + (100 * report.top1_source_accuracy_on_supported).toFixed(1) + "% |",
    "| Supported-question answer rate | " + (100 * report.supported_question_answer_rate).toFixed(1) + "% |",
    "| Out-of-domain refusal rate | " + (100 * report.out_of_domain_refusal_rate).toFixed(1) + "% |",
    "| Invalid citation provenance | " + invalidCitations + " |",
    "",
    "Small synthetic questions against the included fictional sample documents. Not a production benchmark.",
  ].join("\n");
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n", {flag:"a"});
}
// --strict only enforces citation provenance, not arbitrary target metrics.
if (process.argv.includes("--strict") && invalidCitations > 0) process.exitCode = 1;
