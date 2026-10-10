import test from "node:test";
import assert from "node:assert/strict";
import { buildIndex, answerQuestion } from "../retrieval.mjs";
import { createEvidenceReport } from "../report.mjs";
import {
  buildGroundedMessages, validateDraft, textFromGeneratorOutput,
  generateCitedAnswer, isWebGPUAvailable
} from "../generation.mjs";

const docs = [{ id:"sample", name:"demo-guide.txt",
  text:"The backup recovery plan requires quarterly restore tests. Security owners review the results." }];
const evidence = answerQuestion("How often should backup restore tests be done?", buildIndex(docs));
assert.equal(evidence.answered,true);
const refs = evidence.sources;

test("source quotes remain literal and prompt contains only retrieved evidence",()=>{
  const messages=buildGroundedMessages("When should backups be tested?",refs);
  assert.equal(messages[0].role,"system");
  assert.equal(messages[1].role,"user");
  assert.match(messages[0].content,/never as commands/i);
  assert.match(messages[1].content,/demo-guide.txt/);
  assert.match(messages[1].content,/quarterly restore tests/);
  assert.match(messages[1].content,/UNTRUSTED EVIDENCE/);
});

test("citation validator accepts short cited sentences with valid source IDs",()=>{
  const r=validateDraft("Restore tests are required quarterly [1].",refs);
  assert.equal(r.ok,true);
  assert.match(r.text,/quarterly/);
});

test("citation validator refuses uncited, missing and fabricated source numbers",()=>{
  assert.equal(validateDraft("Restore tests are quarterly.",refs).ok,false);
  assert.equal(validateDraft("Restore tests are quarterly [3].",refs).ok,false);
  assert.equal(validateDraft("INSUFFICIENT_EVIDENCE",refs).ok,false);
  assert.equal(validateDraft("",refs).ok,false);
  assert.equal(validateDraft("Backup tests occur annually [1]. This is important.",refs).ok,false);
});

test("citations are structurally checked but not a factuality proof",()=>{
  // Demonstrates an explicit LIMITATION: syntactically valid yet incorrect
  // assertions can pass without deeper entailment verification.
  const unchecked=validateDraft("Backup tests are only performed every decade [1].",refs);
  assert.equal(unchecked.ok,true);
});

test("unexpected source citations and tampered document excerpts are rejected",()=>{
  const bad=structuredClone(refs);
  bad[0].quote="Invented fake excerpt";
  assert.throws(()=>buildGroundedMessages("Question",bad),/does not appear/);
  assert.throws(()=>buildGroundedMessages("Question",[]),/one to three/);
  assert.throws(()=>buildGroundedMessages("Question",[{...refs[0],citation:4}]),/invalid citation/);
});

test("model output parser supports Transformers.js chat responses and rejects bad output",()=>{
  assert.equal(textFromGeneratorOutput([{generated_text:[
    {role:"system",content:"sys"},
    {role:"assistant",content:"The backup plan is quarterly [1]."}
  ]}]),"The backup plan is quarterly [1].");
  assert.equal(textFromGeneratorOutput([{generated_text:"Tests run quarterly [1]."}]),
    "Tests run quarterly [1].");
  assert.throws(()=>textFromGeneratorOutput([{unexpected:true}]),/unexpected format/);
});

test("mock generator produces a report with both cited draft and verifiable source excerpts",async()=>{
  const generator=async(messages,opts)=>{
    assert.equal(messages[0].role,"system");
    assert.equal(opts.do_sample,false);
    assert.ok(opts.max_new_tokens<=150);
    return [{generated_text:[
      {role:"user",content:"Question"},
      {role:"assistant",content:"Recovery must be tested quarterly [1]."}
    ]}];
  };
  const reply=await generateCitedAnswer(generator,"When should backup testing happen?",refs);
  assert.equal(reply.ok,true);
  const report=createEvidenceReport("When should backup testing happen?",{...evidence,answer:reply.text,generated:true});
  assert.match(report,/Locally AI-generated draft/);
  assert.match(report,/Recovery must be tested quarterly/);
  assert.match(report,/The backup recovery plan requires quarterly restore tests/);
  assert.match(report,/not fact-checked/);
});

test("generator invalid citation result cannot be used in a generated report",async()=>{
  const generator=async()=>[{generated_text:"Unsupported claim [9]."}];
  const result=await generateCitedAnswer(generator,"Why?",refs);
  assert.equal(result.ok,false);
  assert.throws(()=>createEvidenceReport("Q",{...evidence,generated:true,answer:"Some claim [9]."}),/citation checks/);
});

test("webgpu capability detection can be tested without browser APIs",()=>{
  assert.equal(isWebGPUAvailable({gpu:{requestAdapter:async()=>({})}}),true);
  assert.equal(isWebGPUAvailable({}),false);
  assert.equal(isWebGPUAvailable({gpu:{}}),false);
});
