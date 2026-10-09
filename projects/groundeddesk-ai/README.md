# GroundedDesk AI — private, extractive document Q&A

**Working client-side browser demo.** Open [index.html](./index.html) through a local server to load sample documents, ask natural-language questions and view source citations. No account or API key is required. This is a retrieval and evidence-demonstration project, not a generative LLM or production document management service.

## Features

- BM25-style passage ranking with stopword filtering and document-aware top results
- Extractive passages **copied from** indexed source documents; nonmatching queries refuse instead of inventing an answer
- Exact source filename, excerpt, relevant terms and score for each citation
- Drag-and-drop and file picker for `.txt`, `.md`, and `.pdf` (max 5 MB per file, max 180,000 characters in extracted text)
- Optional PDF.js dynamic browser import from a **pinned third-party CDN**. Loading PDF support requires internet access to that CDN, but parsing remains local in the browser. Text files work with zero network calls.
- Built-in illustrative documents; visitor uploads stay in browser memory, never intentionally sent to a server
- Responsive UI, source search, interactive citations and copy-answer button
- Node.js standard-library test suite and GitHub Actions CI

## Run

From this directory:

```bash
python -m http.server 8765
```

Open `http://localhost:8765`. Browsers block some ES module behaviors on `file://`, so use a local web server.

For automated checks (Node.js 20+):

```bash
node --test tests/retrieval.test.mjs
node --check retrieval.mjs
node --check app.mjs
```

No npm package installation is needed for text retrieval.

## Demo questions

- "How do we review AI systems before launch?"
- "Where should document metadata be stored?"
- "How can an office reduce wasted electricity?"
- "What is the capital of Mars?" — should refuse if no source evidence

## Architecture

```text
Browser files / included samples
       |
       v
Text extraction (PDF.js for PDFs)
       |
       v
Overlapping character chunks
       |
       v
Tokenization + BM25-style ranking
       |
       v
Verbatim sentence selection + citation provenance
       |
       v
Answer workbench with clickable evidence
```

## Honest limitations

This is **not** true LLM-based RAG: it uses no embedding model, external vector database or answer-generating LLM. It is a deterministic, inspectable retrieval-and-citation baseline. Keyword overlap can miss paraphrases and can surface semantically irrelevant matches. Scores are uncalibrated ranking values, not accuracy probabilities. The no-data-persistence claim applies to app code: browser extensions, device management and hosting infrastructure are outside its control. PDF.js is loaded from a public CDN; users who need strict offline operation should bundle dependencies locally.

A future backend implementation could add embeddings, hybrid retrieval, evaluation datasets, rate limiting, authenticated storage, queueing and monitored inference. No production service levels or fabricated benchmark results are claimed.

## Author

[Arjun Kumar — GitHub](https://github.com/arjun9669). Created for a public AI Engineering portfolio using example materials, not employer files.
