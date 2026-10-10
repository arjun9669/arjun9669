# GroundedDesk AI

**Free, browser-first document intelligence portfolio project.** Upload text, Markdown or text-based PDF documents, inspect source-backed answers, optionally enable local semantic embeddings and a local small language model, and create multi-document research reports.

**[Try the currently hosted demo](https://arjun9669.github.io/arjun9669/)** · [Original development history and pull requests](https://github.com/arjun9669/arjun9669/pulls) · [Project author](https://github.com/arjun9669)

> The live GitHub Pages URL currently belongs to the author's **profile repository**. This standalone repository snapshot does not automatically control that deployment. To host directly from the standalone repository, enable the bundled Pages workflow through GitHub Settings → Pages → GitHub Actions. No paid plan or API is necessary.

## Features

| Milestone | Capability | Execution |
| --- | --- | --- |
| 1.0 | Browser file intake, BM25-style passage ranking, verbatim citations, Markdown evidence reports | Local JavaScript |
| 2.0 | Optional MiniLM q8 semantic embeddings, cosine similarity and reciprocal-rank hybrid retrieval | Local WASM via Transformers.js |
| 3.0 | Optional small Qwen2.5 0.5B WebGPU generative drafts with structurally verified source IDs, fallback extracts and session conversation | Local WebGPU; device support required |
| 4.0 | Multi-document keyword research, comparison, source-coverage gaps, basic instruction-shaped-text warnings and export | Local deterministic research workflow |

No paid model inference, authentication, cloud database or backend is part of this educational reference implementation. Public model/CDN files must be downloaded when enabling semantic, local generation or PDF parsing; those downloads are not entirely offline. The app does not intentionally upload user document contents to a backend.

## Quick start

The app is a static ES-module website. From the repository root:

```bash
python -m http.server 8765
```

Visit **http://localhost:8765**. Sample documents are included; uploaded files stay in the current browser session's memory. Supported file types: `.txt`, `.md`, `.markdown`, and text-based `.pdf` (PDF.js from a pinned public CDN). Scanned PDFs without selectable text require separate OCR, which is not included. The app limits file and extracted-text size; mobile browsers may struggle with the large optional model.

### Demo questions

- How are AI use cases reviewed before launch?
- Where is document metadata stored?
- How can an office reduce electricity use?
- What is the capital of Mars? *(should refuse when no source covers it)*

In **Research workspace**, try research across all sample documents or compare the **AI Governance Playbook** against **Cloud Architecture Guide**.

## Tests and evaluation

Install **Node.js 22+** for checks (no npm dependencies needed for the local retrieval test suite):

```bash
node --test tests/*.test.mjs
node --check app.mjs
node --check retrieval.mjs
node --check semantic.mjs
node --check hybrid.mjs
node --check generation.mjs
node --check research.mjs
node --check report.mjs
node eval/run.mjs --strict
node eval/run.mjs --json > evaluation.json
```

The included [GitHub Actions CI](./.github/workflows/ci.yml) runs the same checks and archives the toy-corpus report. In the original development repo, **39 tests passed** during the v4 release ([verified Actions run](https://github.com/arjun9669/arjun9669/actions/runs/38015809050)). That run exercised deterministic retrieval, math with **mock embeddings**, prompt/citation structure with **mock model outputs**, research provenance and small sample documents. It did **not** run real downloaded MiniLM or Qwen weights or establish real-world answer accuracy. The browser UI contains optional device-specific model evaluations.

The small bundled evaluation corpus uses fictional sample documents and hand-written questions; do not present its high retrieval scores as independent production benchmarks.

## Technical flow

```text
User's files / sample documents
       │
Browser PDF/text extraction and in-memory chunks
       │
       ├── Keyword retrieval (BM25-style, default)
       ├── Optional local MiniLM q8 embeddings → cosine ranking
       └── Optional weighted reciprocal-rank fusion
       │
Verbatim source excerpts + clickable citations
       ├── Default: extractive evidence
       ├── Optional local Qwen WebGPU cited draft
       │     (citation format checked; factual entailment NOT proved)
       └── Scripted multi-document research / comparison reports
```

## Limitations and security

This is an **educational/portfolio prototype, not a production-ready RAG or security product**. Lexical and semantic results can be irrelevant, and a valid citation ID does not prove that generated text is supported. The simple pattern-based warning for prompt-injection-like text is not a comprehensive detector. Research reports show literal document excerpts and gaps; shared words alone do not prove agreement or contradiction. Validate answers against the excerpts before using them in decisions.

Model availability, downloaded weights, memory limits, browser WebGPU/WASM support, and performance vary by device. Uploaded content is in browser memory, but downloaded/exported reports and clipboard contents can contain private data. Avoid uploading confidential material to a public demo without independently reviewing your browser and extension environment.

## Source and deployment

This standalone-ready snapshot was prepared from [the verified GroundedDesk code inside the profile repository](https://github.com/arjun9669/arjun9669/tree/main/projects/groundeddesk-ai). The old profile-hosted Pages demo remains live until intentionally migrated. The `.github/workflows/pages.yml` file is included so a dedicated repository can have its **own free Pages deployment** when Pages is configured to use GitHub Actions.

No specific software license has been granted in this snapshot. Add an appropriate license only after the repository owner chooses one.
