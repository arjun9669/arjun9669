# GroundedDesk AI — independently runnable, evidence-cited document Q&A

**No-API-key client-side reference implementation.** Open [index.html](./index.html) through a local server to load sample documents, ask natural-language questions and view source citations. No account or API key is required. This is a retrieval and evidence-demonstration project, not a generative LLM or production document management service.

## Features

- BM25-style keyword passage ranking (default), plus optional browser-only MiniLM and hybrid reciprocal-rank fusion, and optional local Qwen WebGPU-generated drafts
- Extractive passages **copied from** indexed source documents; nonmatching queries refuse instead of inventing an answer
- Exact source filename, excerpt, relevant terms and score for each citation
- Drag-and-drop and file picker for `.txt`, `.md`, and `.pdf` (max 5 MB per file, max 180,000 characters in extracted text)
- Optional PDF.js dynamic browser import from a **pinned third-party CDN**. Loading PDF support requires internet access to that CDN, but parsing remains local in the browser. Text files work with zero network calls.
- Built-in illustrative documents; visitor uploads stay in browser memory, never intentionally sent to a server
- Responsive UI, source search, keyboard-accessible citation buttons, and **downloadable Markdown evidence reports** with source excerpts
- Local report generator refuses to export a citation if its quoted passage is not a literal substring of the cited excerpt; long extracts remain verbatim
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
node --check report.mjs
node --check hybrid.mjs
node --check semantic.mjs
node --check generation.mjs
node --check app.mjs
node eval/run.mjs --strict
node eval/run.mjs --json > evaluation.json
```

No npm package installation is needed for text retrieval.

## Local evidence export (no paid API)

After a search, choose **Copy report** or **Download .md**. The downloaded file includes your question, extractive answer, ranked source filenames, literal excerpts and ranking scores; it is generated entirely in browser memory using [`report.mjs`](./report.mjs). Unsupported questions export a refusal instead of fabricated evidence.

**Privacy:** exporting a report writes a local file on your own device. It does not upload anything, but the saved file may contain confidential passages. Do not share such reports without reviewing their contents. Clipboard copying also puts the report into the device clipboard, where other software may have access.

**Evidence guarantee:** the exporter checks that each quote is an exact substring of its displayed source excerpt and rejects a corrupted citation. That checks provenance, not whether a quote fully answers the question or whether a source is trustworthy. The app remains a **deterministic, keyword-based demonstration**; no LLM or embeddings are added.

## GroundedDesk AI 3.0 — optional generative answers on the device

The same **[free GitHub Pages app](https://arjun9669.github.io/arjun9669/)** now offers a third, explicitly opt-in capability: **Local AI · cited draft**. It uses [Hugging Face Transformers.js 3.0.0](https://huggingface.co/blog/transformersjs-v3) and the publicly hosted [onnx-community/Qwen2.5-0.5B-Instruct](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct) model in **WebGPU** with four-bit quantization. The model's q4 ONNX weights alone are approximately **786 MB**, so use Wi-Fi and a device with sufficient GPU memory. Some browsers, especially on mobile, will not support the required WebGPU setup. The first load needs public model/library downloads; it does **not** require a key, payment, server-side inference or Lovable credits.

**How to use:** open the app, optionally enable MiniLM hybrid retrieval (recommended for paraphrase queries), then click **Load free local Qwen model (WebGPU)**. When the model is ready, choose **Local AI · cited draft** in Answer mode and ask questions. The existing keyword and hybrid retrieval engines choose source passages; Qwen drafts at most a few short sentences from retrieved excerpts and is prompted to cite each sentence as `[1]`, `[2]`, etc. Source buttons open the corresponding literal source excerpt. **All source text is passed to the model running on your device, not to a hosted inference API.**

**Important limits:**
- A generated answer is a **draft**. We validate that citation IDs exist and that every sentence has a citation. This does **not prove factual entailment**, and a fabricated claim could still cite a real passage. Read the source excerpts before trusting or sharing generated claims.
- Retrieval with **no supporting excerpts** never invokes the language model; it returns the original refusal. Model failure, invalid citation structure, unavailable WebGPU or document edits during inference revert to **working extractive search**. The default is still extractive, not paid generative inference.
- **Session-only recent questions:** the last eight question/answer turns are kept in browser memory and erased on refresh, clear, or document-index changes. No user accounts, persistent conversations or cross-device sync.
- Optional Markdown exports include the AI draft **and separately quoted source evidence** with a factuality disclaimer. Saving or copying a report places contents on your device; don't share reports containing private documents.
- The **Check local AI drafts on 3 sample questions** control runs the real browser-loaded model, recording citation-format acceptance, expected first-source match and elapsed time on the device. It's only a **tiny, fictional-document smoke test, not an accuracy or hallucination benchmark**, and no numbers are hard-coded.
- Offline Node.js tests exercise prompts, citation numbering, output parsing, corrupted source handling, WebGPU detection and mock model responses. They **cannot validate that downloaded model weights execute on all browsers**, nor can they measure real-world correctness. Use the opt-in browser model smoke test and check individual outputs.

The project now contains [`generation.mjs`](./generation.mjs) (WebGPU model loader plus source-ID safeguards), [`tests/generation.test.mjs`](./tests/generation.test.mjs) (no-download deterministic tests), and the original independent retrieval evaluation. This is a free **local LLM-assisted retrieval application**, but not an audited/production knowledge system.

## GroundedDesk 2.0 — free opt-in semantic + hybrid retrieval

The **[public GitHub Pages app](https://arjun9669.github.io/arjun9669/)** now supports two explicit search methods:

- **Keyword (default):** the original offline BM25-style lexical search; starts immediately and does not download an embedding model.
- **Hybrid (opt-in):** selects **Enable free semantic model**, then dynamically downloads [Hugging Face Transformers.js v3](https://huggingface.co/blog/transformersjs-v3) and the Apache-2.0-licensed [Xenova/all-MiniLM-L6-v2 model](https://huggingface.co/Xenova/all-MiniLM-L6-v2). Browser-side WASM computes mean-pooled normalized embeddings, cosine similarity, and weighted reciprocal-rank fusion of lexical + semantic passage ranks. The result is still a **verbatim source excerpt with citations** — not a generated answer.

There are **no API keys, paid model calls, databases or document-upload endpoints**. Transformers.js, model weights and optional PDF.js are **downloaded from public third-party servers**, so this is **not fully offline on first use**; these servers can observe ordinary file-download requests and network metadata, but this app does not send user document content to model APIs. Remote dependency availability, browser support and connection speeds may vary. Model downloads can use considerable mobile data and CPU/RAM, so semantic mode is opt-in. The pipeline is pinned to the documented Transformers.js v3.0.0 CDN import, with q8/WASM inference and a limit of **72 indexed chunks** per session. Larger document collections remain searchable in keyword mode. Removing or adding documents invalidates semantic vectors until the user re-enables indexing.

**Real local-model comparison:** After loading the model with the three original sample documents, click **Compare modes on sample questions** to compute actual keyword-vs-hybrid top-1 source matches, out-of-domain refusals and elapsed local inference time against the same labeled toy fixture. No fixed or fabricated semantic benchmark numbers are committed. This evaluation deliberately works only with the included sample corpus, not uploaded/private documents. It can give different results or fail to load depending on browser/network hardware. The [Node tests](./tests/hybrid.test.mjs) use **test-double vectors** only to validate cosine scoring and fusion mathematics; those vectors are never presented as a measured semantic model benchmark.

**Fallback:** If the library/model download, WASM inference, indexing or query embedding fails, the app retains usable keyword search. Semantic-only matches have a heuristic cosine threshold (0.36), so the mode can still miss paraphrases or retrieve irrelevant passages. These retrieval confidence thresholds are **not calibrated probabilities** and this is not a production or generative LLM RAG system.

## Labeled evaluation and validation

Run `node eval/run.mjs` from this directory to measure **this exact source code** against [the labeled fixture](./eval/queries.json) and the three bundled demonstration documents. The **offline CLI evaluator measures keyword mode only** (no model/network needed) and reports:

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

## Free GitHub Pages deployment — published

**GitHub reported a successful live deployment on October 9, 2026 (UTC).**

- **[Public GitHub Pages URL](https://arjun9669.github.io/arjun9669/)**
- [Successful Pages deployment workflow](https://github.com/arjun9669/arjun9669/actions/runs/37999849145) — build and deploy jobs both successful
- [Publishing branch (`gh-pages`)](https://github.com/arjun9669/arjun9669/tree/gh-pages)

This uses a standalone static site in the `gh-pages` branch, separate from the GitHub profile source in `main`. GitHub supplied the page URL in the deployment logs; automatic server checks may be unable to open public Pages sites from some environments, so test uploads, sample retrieval and citation navigation in your own browser before claiming full end-to-end verification.

**Updating this site:** changing the app source in `main/projects/groundeddesk-ai` does not automatically update the published `gh-pages` branch. Copy changed static files into `gh-pages` and allow GitHub's Pages build/deployment to complete. Keep the [manually triggered Actions deployment workflow](../../.github/workflows/deploy-groundeddesk-pages.yml) as an alternative only if the Pages publishing source is changed to GitHub Actions; do not mix publishing methods.

No Lovable credits, API keys, hosted LLM or server-side database are required. Text files are read locally in browser memory. Optional PDF parsing downloads a pinned PDF.js library from a third-party CDN.

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
