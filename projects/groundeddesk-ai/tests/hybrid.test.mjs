import test from "node:test";
import assert from "node:assert/strict";
import { buildIndex, answerQuestion, answerFromCandidates, keywordRank } from "../retrieval.mjs";
import { cosineSimilarity, hybridRank } from "../hybrid.mjs";

test("cosine computes sensible normalized vector similarities and rejects bad dimensions", () => {
  assert.equal(cosineSimilarity([1,0,0],[1,0,0]), 1);
  assert.equal(cosineSimilarity([1,0,0],[0,1,0]), 0);
  assert.equal(cosineSimilarity([1,0],[ -1,0]), -1);
  assert.throws(() => cosineSimilarity([1],[1,2]), /dimension/);
  assert.throws(() => cosineSimilarity([0,0],[1,0]), /Zero/);
  assert.throws(() => cosineSimilarity([NaN,0],[1,0]), /Nonfinite/);
});

const docs = [
  {id:"a",name:"roof.txt",text:"Vapor management under the roof prevents moisture accumulation in the attic."},
  {id:"b",name:"garden.txt",text:"Garden irrigation drip valves reduce wasted water around ornamental trees."},
];
const index=buildIndex(docs);

test("keyword ranking is independently reproducible", () => {
  assert.deepEqual(keywordRank("garden irrigation",index),keywordRank("garden irrigation",index));
  const lexical=answerQuestion("garden irrigation",index);
  assert.equal(lexical.sources[0].filename,"garden.txt");
});

test("synthetic fixture vectors exercise semantic-only rank fusion, NOT model accuracy", () => {
  const question="How is condensation handled above the house?";
  const queryVector=[1,0,0];
  // Test doubles: roof document gets high vector similarity even if vocabulary differs.
  const vectors=index.chunks.map(chunk=>chunk.filename==="roof.txt"?[1,0,0]:[0,1,0]);
  const ranking=hybridRank(question,index,queryVector,vectors);
  const answer=answerFromCandidates(question,ranking,3,"Mock-vector hybrid test");
  assert.equal(answer.answered,true);
  assert.equal(answer.sources[0].filename,"roof.txt");
  assert.ok(docs[0].text.includes(answer.sources[0].quote));
  assert.ok(answer.sources[0].semanticScore>0.36);
  assert.equal(answer.mode,"Mock-vector hybrid test");
});

test("RRF deterministically combines lexical and semantic rank lists",()=>{
  const q="garden irrigation valves";
  const vectors=index.chunks.map(chunk=>chunk.filename==="garden.txt"?[1,0]:[0,1]);
  const rank1=hybridRank(q,index,[1,0],vectors);
  const rank2=hybridRank(q,index,[1,0],vectors);
  assert.deepEqual(rank1,rank2);
  assert.equal(rank1[0].filename,"garden.txt");
  assert.ok(rank1[0].lexicalScore>0);
  assert.ok(rank1[0].semanticScore>0.36);
});

test("irrelevant semantic vectors below threshold cannot fabricate supporting evidence",()=>{
  const vectors=index.chunks.map(()=>[0,1,0]);
  const ranked=hybridRank("celestial satellite dances",index,[1,0,0],vectors);
  assert.equal(ranked.length,0);
  assert.equal(answerFromCandidates("celestial satellite dances",ranked).answered,false);
});

test("stale, malformed or nonfinite embeddings are never accepted",()=>{
  assert.throws(()=>hybridRank("hello",index,[1,0],[]),/missing or stale/);
  assert.throws(()=>hybridRank("hello",index,[1,0],[[1,0],[1]]),/dimension/);
  assert.throws(()=>hybridRank("hello",index,[1,0],[[1,0],[Infinity,0]]),/Nonfinite/);
  assert.throws(()=>hybridRank("hello",index,[1,0],[[1,0],[1,0]],{threshold:2}),/Invalid/);
});
