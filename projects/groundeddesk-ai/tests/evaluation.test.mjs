import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex, answerQuestion } from "../retrieval.mjs";

const home = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docs = [
  ["ai-governance.txt", "AI Governance Playbook"],
  ["cloud-architecture.txt", "Cloud Architecture Guide"],
  ["sustainability.txt", "Sustainability Operations Brief"],
].map(([file,name], id) => ({ id:String(id), name, text:readFileSync(resolve(home,"samples",file),"utf8") }));
const index=buildIndex(docs);
const fixture=JSON.parse(readFileSync(resolve(home,"eval/queries.json"),"utf8"));

test("all supported queries are deterministic and cited to actual source substrings",()=>{
 for(const q of fixture.cases.filter(c=>c.expected_source!==null)){
   const a=answerQuestion(q.question,index);
   assert.deepEqual(a,answerQuestion(q.question,index),q.id);
   if(a.answered) {
     assert.ok(a.sources.length>=1,q.id);
     a.sources.forEach((s,i)=>{
       assert.equal(s.citation,i+1,q.id);
       const d=docs.find(doc=>doc.name===s.filename);
       assert.ok(d?.text.includes(s.quote),q.id+" quote not grounded");
       assert.ok(d?.text.includes(s.excerpt),q.id+" excerpt not grounded");
     });
   }
 }
});

test("out-of-domain examples are refused without invented citations",()=>{
 const unsupported=fixture.cases.filter(c=>c.expected_source===null);
 assert.ok(unsupported.length>=5);
 for(const q of unsupported) {
   const result=answerQuestion(q.question,index);
   assert.equal(result.answered,false,q.id+": "+q.question);
   assert.deepEqual(result.sources,[],q.id);
 }
});
