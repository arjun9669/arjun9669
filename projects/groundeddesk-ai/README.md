# GroundedDesk AI — independently runnable, evidence-cited document Q&A

**No-API-key client-side reference implementation.** Open [index.html](./index.html) through a local server to load sample documents, ask natural-language questions and view source citations. No account or API key is required. This is a retrieval and evidence-demonstration project, not a generative LLM or production document management service.

## Features

- BM25-style passage ranking with stopword filtering and document-aware top results
- Extractive passages **copied from** indexed source documents; nonmatching queries refuse instead of inventing an answer
- Exact source filename, excerpt, relevant terms and score for each citation
- Drag-and-drop and file picker for `.txt`, `.md`, and `.pdf` (max 5 MB per file, max 180,000 characters in extracted text)
- Optional PDF.js dynamic browser import from a **pinned third-party CDN**. Loading PDF support requires internet access to that CDN, but parsing remains local in the browser. Text files work with zero network calls.
- Built-in illustrative documents; visitor uploads stay in browser memory, never intentionally sent to a server
- Responsive UI, source search, keyboard-accessible citation buttons that jump to actual source excerpts, and copy-answer button
- Reproducible labeled offline corpus evaluation with honest metrics for source ranking, unsupported-query refusals and citation provenance
- Node.js standard-library test suite and GitHub Actions CI

## Run

From this directory:

```bash
python -m http.server 8765
```

Open `http://localhost:8765`. Browsers block some ES module behaviors on `file://`, so use a local web server.

For automated checks (Node.js 20+):

```bash
node --test tests/*.test.mjs
node --check retrieval.mjs
node --check app.mjs
node eval/run.mjs --strict
node eval/run.mjs --json > evaluation.json
```

No npm package installation is needed for text retrieval.

## Labeled evaluation and validation

Run `node eval/run.mjs` from this directory to measure **this exact source code** against [the labeled fixture](./eval/queries.json) and the three bundled demonstration documents. The evaluator reports:

- **Top-1 source accuracy** for supported questions: fraction whose first citation comes from the expected document.
- **Supported-question answer rate**: percentage for which retrieval returned a cited result. An answered result is not necessarily correct.
- **Out-of-domain refusal rate**: percentage of intentionally unrelated questions with no returned sources.
- **Citation provenance**: whether returned excerpts and quoted sentences occur verbatim in one of the original documents.
- **Median and p95 processing time** on the machine executing the harness.

A `--json` option emits machine-readable per-question outcomes. A `--strict` option fails on fabricated/mismatched citation excerpts. The [GitHub CI workflow](../../.github/workflows/groundeddesk-ci.yml) runs these checks automatically and attaches a JSON evaluation artifact to each run. No dependency installation or LLM credentials are required for this test suite.

These are **in-sample toy-document metrics** on manually written, small questions: not independently validated accuracy, robustness, semantic retrieval quality or production latency.

**Verified initial run:** [GitHub Actions #37999445547](https://github.com/arjun9669/arjun9669/actions/runs/37999445547) executed the fixture on October 9, 2026 (UTC) with **18/18 first-source matches**, **18/18 supported questions answered**, **10/10 unrelated questions refused**, **0 source provenance errors**, and **9 automated tests passing**. The tiny curated dataset was constructed using the included fictional documents, so scores this high are expected to be easier than on real documents. **Do not cite these as real-world model accuracy.** Re-run `node eval/run.mjs` after changes and inspect individual failures; measured processing timings are hardware- and workload-dependent.

## Related live showcase

[**Doc Genius Local — open the live Lovable app**](https://doc-genius-local.lovable.app/) is a **separate hosted React/TypeScript implementation** of browser-side document QA. This GitHub folder contains a reproducible vanilla-JavaScript reference implementation, **not the deployed Lovable source code**. Editing this repository does not automatically deploy to Lovable. For the exact hosted project, see [Lovable editor](https://lovable.dev/projects/fd559d48-e6da-4a1e-86c3-13dc30ca15ef).

## Publish to GitHub Pages

This repository includes an **opt-in** [GitHub Actions Pages deployment workflow](../../.github/workflows/deploy-groundeddesk-pages.yml). To publish the static app:

1. In the `arjun9669/arjun9669` repository, open **Settings → Pages** and select **GitHub Actions** as the build/deployment source.
2. Open **Actions → Deploy GroundedDesk to GitHub Pages → Run workflow** on `main`.
3. Use the URL returned by the deployment job. The deployment workflow is intentionally manual so it won't overwrite or interfere with an existing Pages site without approval.

This produces a static public demo. It does not deploy any Python backend, vector database or LLM service. A preview URL is **not** assumed valid until the deployment job succeeds.

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
