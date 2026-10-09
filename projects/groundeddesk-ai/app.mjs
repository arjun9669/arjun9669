import { buildIndex, answerQuestion, answerFromCandidates } from "./retrieval.mjs";
import { hybridRank } from "./hybrid.mjs";
import { loadBrowserEmbedder, embedText, embedChunks, MAX_SEMANTIC_CHUNKS } from "./semantic.mjs";
import { createEvidenceReport } from "./report.mjs";
import { loadLocalGenerator, generateCitedAnswer, isWebGPUAvailable } from "./generation.mjs";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_CHARS = 180000;
const MAX_DOCUMENTS = 15;
const $ = id => document.getElementById(id);
const documents = [];
let indexed = buildIndex([]);
let currentAnswer = null;
let visibleQuestion = "";
let indexVersion = 0;
let semanticVectors = null;
let semanticExtractor = null;
let semanticVersion = -1;
let modelBusy = false;
let searchBusy = false;
let evalBusy = false;
let localGenerator = null;
let generationLoading = false;
let recentTurns = [];

function setGenerationStatus(message, isError = false) {
  const status = $("generation-status");
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? "#a2462a" : "";
}

function updateGenerationControls() {
  const mode = $("answer-mode");
  if (!mode) return;
  mode.querySelector('option[value="generative"]').disabled = !localGenerator;
  if (!localGenerator) mode.value = "extractive";
  $("enable-generation").disabled = Boolean(localGenerator) || generationLoading || searchBusy;
  $("enable-generation").textContent = localGenerator ? "Local Qwen model ready" :
    generationLoading ? "Loading model…" : "Load free local Qwen model (WebGPU)";
}

function resetConversation() {
  recentTurns = [];
  const list = $("history-list");
  if (list) list.replaceChildren();
  if ($("history-count")) $("history-count").textContent = "0";
}

function addTurn(question, result) {
  recentTurns.push({ question, result });
  if (recentTurns.length > 8) recentTurns.shift();
  const list = $("history-list");
  list.replaceChildren();
  for (const turn of [...recentTurns].reverse()) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = turn.question + (turn.result.generated ? " · local AI" : " · extracts");
    button.addEventListener("click", () => renderResult(turn.question, turn.result));
    li.append(button);
    list.append(li);
  }
  $("history-count").textContent = String(recentTurns.length);
}

function semanticReady() {
  return Boolean(semanticVectors && semanticExtractor && semanticVersion === indexVersion
    && semanticVectors.length === indexed.chunks.length);
}

function setSemanticStatus(message, isError = false) {
  const status = $("semantic-status");
  if (status) {
    status.textContent = message;
    status.style.color = isError ? "#a2462a" : "";
  }
}

function updateSemanticControls() {
  const mode = $("retrieval-mode");
  if (!mode) return;
  mode.querySelector('option[value="hybrid"]').disabled = !semanticReady();
  if (!semanticReady()) mode.value = "keyword";
  $("enable-semantic").disabled = modelBusy || searchBusy || !indexed.chunks.length || indexed.chunks.length > MAX_SEMANTIC_CHUNKS;
  $("evaluate-modes").disabled = !semanticReady() || evalBusy || searchBusy ||
    documents.length !== sampleFiles.length ||
    !sampleFiles.every(([, name]) => documents.some(d => d.sample && d.name === name));
}
const sampleFiles = [
  ["samples/ai-governance.txt", "AI Governance Playbook"],
  ["samples/cloud-architecture.txt", "Cloud Architecture Guide"],
  ["samples/sustainability.txt", "Sustainability Operations Brief"],
];

function notify(message, isError = false) {
  const el = $("alert");
  el.textContent = message;
  el.style.color = isError ? "#b45336" : "#228477";
}

function rebuildIndex() {
  indexed = buildIndex(documents);
  indexVersion++;
  resetConversation();
  semanticVectors = null;
  semanticVersion = -1;
  if ($("semantic-status")) {
    setSemanticStatus(indexed.chunks.length > MAX_SEMANTIC_CHUNKS
      ? `Keyword mode active. Semantic mode supports up to ${MAX_SEMANTIC_CHUNKS} passages. Remove some documents to enable it.`
      : "Keyword mode active. Enable local embeddings to use hybrid retrieval.");
    updateSemanticControls();
  }
  $("doc-count").textContent = String(documents.length);
  renderDocuments();
}

function make(tag, className, content = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (content !== "") el.textContent = String(content);
  return el;
}

function renderDocuments() {
  const list = $("document-list");
  const filter = $("document-filter").value.trim().toLowerCase();
  list.replaceChildren();
  const matches = documents.filter(doc => doc.name.toLowerCase().includes(filter));
  if (!matches.length) {
    const empty = make("li", "library-note",
      documents.length ? "No files match this search." : "No documents loaded yet. Choose files or restore the sample documents by reloading.");
    list.append(empty);
    return;
  }
  for (const doc of matches) {
    const item = make("li", "document-card");
    item.dataset.documentId = doc.id;
    const fileIcon = make("span", "doc-icon", doc.type === "pdf" ? "PDF" : "TXT");
    const details = make("div", "doc-details");
    details.append(make("strong", "", doc.name), make("small", "", `${(doc.text.length / 1000).toFixed(1)}k characters · ${doc.sample ? "sample" : "session"}`));
    const remove = make("button", "remove-doc", "×");
    remove.type = "button";
    remove.title = `Remove ${doc.name}`;
    remove.setAttribute("aria-label", `Remove ${doc.name}`);
    remove.addEventListener("click", () => {
      const i = documents.findIndex(d => d.id === doc.id);
      if (i < 0) return;
      documents.splice(i, 1);
      rebuildIndex();
      clearResult();
      notify(`Removed ${doc.name}.`);
    });
    item.append(fileIcon, details, remove);
    list.append(item);
  }
}

function clearResult() {
  currentAnswer = null;
  $("initial-state").hidden = false;
  $("answer-result").hidden = true;
  $("answer-result").replaceChildren();
}

function addDocument({ name, text, type = "txt", sample = false }) {
  if (documents.length >= MAX_DOCUMENTS) throw new Error("Maximum of 15 documents per session.");
  const clean = String(text).trim();
  if (!clean) throw new Error(`${name} has no extractable text.`);
  if (clean.length > MAX_CHARS) throw new Error(`${name} exceeds the 180,000-character limit.`);
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `file-${Date.now()}-${documents.length}`;
  documents.push({ id, name, text: clean, sample, type });
  rebuildIndex();
}

async function extractPDF(file) {
  let pdfjs;
  try {
    // PDF.js is loaded only for PDFs; text retrieval remains fully offline.
    pdfjs = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";
  } catch {
    throw new Error("PDF.js could not load. Check connectivity, or use .txt/.md files instead.");
  }
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  if (pdf.numPages > 75) throw new Error("PDFs are limited to 75 pages.");
  const pages = [];
  let total = 0;
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map(part => typeof part.str === "string" ? part.str : "").join(" ");
    total += text.length;
    if (total > MAX_CHARS) throw new Error("Extracted PDF text exceeds 180,000 characters.");
    pages.push(text);
  }
  return pages.join("\n\n");
}

async function loadFiles(files) {
  const accepted = Array.from(files);
  let added = 0;
  const errors = [];
  for (const file of accepted) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["txt", "md", "markdown", "pdf"].includes(ext)) {
      errors.push(`${file.name}: unsupported file type`);
      continue;
    }
    if (file.size > MAX_BYTES) { errors.push(`${file.name}: exceeds 5 MB`); continue; }
    try {
      const text = ext === "pdf" ? await extractPDF(file) : await file.text();
      addDocument({ name: file.name, text, type: ext === "pdf" ? "pdf" : "txt" });
      added++;
    } catch (error) { errors.push(error instanceof Error ? error.message : "Could not read file."); }
  }
  if (added) clearResult();
  notify(`${added} file(s) added.${errors.length ? " Issues: " + errors.join("; ") : ""}`, errors.length > 0);
}

function highlightDocument(id) {
  const filter = $("document-filter");
  filter.value = "";
  renderDocuments();
  const target = [...$("document-list").children].find(item => item.dataset.documentId === id);
  if (target) {
    target.classList.add("source-highlight");
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => target.classList.remove("source-highlight"), 2000);
  }
}

function renderResult(question, result) {
  currentAnswer = result;
  visibleQuestion = question;
  $("initial-state").hidden = true;
  const view = $("answer-result");
  view.hidden = false;
  view.replaceChildren();
  view.append(make("span", "question-label", "YOUR QUESTION"));
  view.append(make("h4", "question-text", question));

  const heading = make("div", "result-heading");
  heading.append(make("span", "", result.answered
    ? `${result.sources.length} CITED SOURCE(S)`
    : "NO SUPPORTING EVIDENCE"));

  const actions = make("div", "report-actions");
  const copy = make("button", "copy-button", "Copy report");
  copy.type = "button";
  copy.setAttribute("aria-label", "Copy answer and evidence report");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(createEvidenceReport(question, result));
      notify("Evidence report copied to clipboard.");
    } catch (error) {
      notify(error instanceof Error && error.message.startsWith("Evidence check")
        ? error.message : "Clipboard access was blocked or the report could not be verified.", true);
    }
  });

  const download = make("button", "copy-button", "Download .md");
  download.type = "button";
  download.setAttribute("aria-label", "Download local Markdown evidence report");
  download.addEventListener("click", () => {
    let blobUrl;
    try {
      const report = createEvidenceReport(question, result);
      const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
      blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = "groundeddesk-evidence.md";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      notify("Markdown evidence report prepared for local download.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Evidence report unavailable.", true);
    } finally {
      if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    }
  });
  actions.append(copy, download);
  heading.append(actions);
  const answerBox = make("div", "answer-box");
  if (result.generated) {
    answerBox.append(make("p", "generation-disclaimer",
      "EXPERIMENTAL · On-device generated draft. Source IDs checked; factual accuracy NOT guaranteed."));
    const paragraph = make("p", "generated-answer");
    for (const piece of result.answer.split(/(\[\d+\])/g)) {
      const match = piece.match(/^\[(\d+)\]$/);
      if (!match) { paragraph.append(document.createTextNode(piece)); continue; }
      const n = Number(match[1]);
      const source = result.sources.find(x => x.citation === n);
      if (!source) { paragraph.append(document.createTextNode(piece)); continue; }
      const button = make("button", "inline-citation", piece);
      button.type = "button";
      button.setAttribute("aria-label", `Jump to source ${n}: ${source.filename}`);
      button.addEventListener("click", () => {
        const card = $(`source-${n}`);
        if (!card) return;
        card.setAttribute("tabindex", "-1");
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.focus({ preventScroll: true });
      });
      paragraph.append(button);
    }
    answerBox.append(paragraph);
  } else
  if (result.answered) {
    for (const source of result.sources) {
      const paragraph = make("p", "cited-answer-paragraph");
      const jump = make("button", "inline-citation", `[${source.citation}]`);
      jump.type = "button";
      jump.setAttribute("aria-label", `Jump to source ${source.citation}: ${source.filename}`);
      jump.addEventListener("click", () => {
        const card = $(`source-${source.citation}`);
        if (!card) return;
        card.setAttribute("tabindex", "-1");
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.focus({ preventScroll: true });
        card.classList.add("source-highlight");
        setTimeout(() => card.classList.remove("source-highlight"), 2000);
      });
      paragraph.append(jump, document.createTextNode(" " + source.quote));
      answerBox.append(paragraph);
    }
  } else {
    answerBox.textContent = result.answer;
  }
  view.append(heading, answerBox);

  if (result.answered) {
    view.append(make("h5", "evidence-heading", "SOURCE EVIDENCE"));
    for (const source of result.sources) {
      const card = make("article", "source-card");
      card.id = `source-${source.citation}`;
      const header = make("div", "source-top");
      header.append(make("span", "source-number", `[${source.citation}]`),
        make("strong", "", source.filename), make("small", "", `Rank ${source.score.toFixed(2)}`));
      card.append(header, make("p", "", source.excerpt));
      const jump = make("button", "", "Locate in library ↗");
      jump.type = "button";
      jump.addEventListener("click", () => highlightDocument(source.documentId));
      card.append(jump);
      view.append(card);
    }
    view.append(make("p", "result-footnote",
      result.generated
        ? "Local Qwen may produce unsupported claims despite valid citation IDs. Check every statement against the displayed excerpts. No cloud inference was used."
        : "Scores are uncalibrated relevance ranks, not confidence percentages. All quoted passages originate in your loaded text. Keyword retrieval may miss paraphrases."));
  } else {
    view.append(make("p", "result-footnote", "Try a different question or add a document containing relevant information. No answer was invented."));
  }
}

async function ask(question) {
  const value = String(question || "").trim();
  if (!value) { notify("Enter a question about the documents.", true); return; }
  if (!documents.length) { notify("Add a document before asking a question.", true); return; }
  if (searchBusy || evalBusy) { notify("Wait for the current retrieval to finish.", true); return; }
  searchBusy = true;
  $("ask-button").disabled = true;
  const startedAt = indexVersion;
  try {
    let result;
    if ($("retrieval-mode").value === "hybrid" && semanticReady()) {
      setSemanticStatus("Computing this question's embedding locally…");
      const vector = await embedText(semanticExtractor, value);
      if (indexVersion !== startedAt || !semanticReady()) {
        result = answerQuestion(value, indexed);
        setSemanticStatus("Documents changed during inference; safely used fresh keyword search.");
      } else {
        const ranking = hybridRank(value, indexed, vector, semanticVectors);
        result = answerFromCandidates(value, ranking, 3, "Local MiniLM + BM25-style reciprocal-rank fusion (extractive; no generative LLM)");
        setSemanticStatus("Hybrid mode ready: semantic model remains in this browser session.");
      }
    } else {
      result = answerQuestion(value, indexed);
    }
    if (result.answered && $("answer-mode").value === "generative" && localGenerator &&
        startedAt === indexVersion) {
      try {
        setGenerationStatus("Generating a short cited draft on this device's GPU…");
        const validation = await generateCitedAnswer(localGenerator, value, result.sources);
        if (startedAt !== indexVersion) {
          result = answerQuestion(value, indexed);
          setGenerationStatus("Documents changed during inference; model draft discarded.");
        } else if (validation.ok) {
          result = { ...result, answer: validation.text, generated: true };
          setGenerationStatus("Local AI draft complete. Verify claims against the source excerpts.");
        } else {
          setGenerationStatus("Draft failed source-ID checks (" + validation.reason + "); showing exact source excerpts.", true);
        }
      } catch (error) {
        setGenerationStatus("Local generation failed. Showing source excerpts instead. " +
          (error instanceof Error ? error.message : ""), true);
      }
    }
    if (startedAt !== indexVersion) result = answerQuestion(value, indexed);
    renderResult(value, result);
    addTurn(value, result);
    notify(result.answered ? "Evidence retrieved locally." : "No matching evidence in this session.");
  } catch (error) {
    // Fail safe: preserve answer availability and don't mislabel lexical as semantic.
    $("retrieval-mode").value = "keyword";
    const fallback = answerQuestion(value, indexed);
    renderResult(value, fallback);
    addTurn(value, fallback);
    setSemanticStatus("Hybrid retrieval could not complete; returned to working keyword search.", true);
    notify("Semantic query failed, so keyword fallback was used. " + (error instanceof Error ? error.message : ""), true);
  } finally {
    searchBusy = false;
    $("ask-button").disabled = false;
    updateSemanticControls();
    updateGenerationControls();
  }
}

async function enableGeneration() {
  if (localGenerator || generationLoading) return;
  if (!isWebGPUAvailable()) {
    setGenerationStatus("WebGPU unavailable on this browser. Extractive retrieval still works.", true);
    return;
  }
  generationLoading = true;
  updateGenerationControls();
  try {
    const generator = await loadLocalGenerator(setGenerationStatus);
    localGenerator = generator;
    $("answer-mode").value = "generative";
    setGenerationStatus("Local Qwen WebGPU model ready. Treat generated text as a draft; verify sources.");
    notify("Experimental on-device answer generation enabled. No paid inference API.");
  } catch (error) {
    setGenerationStatus(error instanceof Error ? error.message : "Local model unavailable.", true);
    notify("Local generator could not load; extractive search still works.", true);
  } finally {
    generationLoading = false;
    updateGenerationControls();
  }
}

$("enable-generation").addEventListener("click", enableGeneration);
$("answer-mode").addEventListener("change", () => {
  if ($("answer-mode").value === "generative" && !localGenerator) {
    $("answer-mode").value = "extractive";
    setGenerationStatus("Load the local model first.", true);
  }
});
$("clear-conversation").addEventListener("click", () => {
  resetConversation();
  clearResult();
  notify("Conversation cleared from this browser session.");
});

async function enableSemantic() {
  if (modelBusy || semanticReady()) return;
  if (!indexed.chunks.length || indexed.chunks.length > MAX_SEMANTIC_CHUNKS) {
    setSemanticStatus(`Need 1–${MAX_SEMANTIC_CHUNKS} indexed passages for the optional local model.`, true);
    return;
  }
  modelBusy = true;
  const version = indexVersion;
  updateSemanticControls();
  try {
    setSemanticStatus("Loading free MiniLM model. The first download may take time and use significant mobile data…");
    const model = await loadBrowserEmbedder(setSemanticStatus);
    const vectors = await embedChunks(model, indexed.chunks, setSemanticStatus);
    if (version !== indexVersion) {
      setSemanticStatus("Documents changed during model setup. Enable again to re-index the current documents.", true);
      return;
    }
    semanticExtractor = model;
    semanticVectors = vectors;
    semanticVersion = version;
    $("retrieval-mode").value = "hybrid";
    notify("On-device semantic embeddings are ready. Hybrid retrieval enabled.");
    setSemanticStatus(`Hybrid ready: indexed ${vectors.length} passages locally using Xenova/all-MiniLM-L6-v2. No document inference API calls.`);
  } catch (error) {
    semanticVectors = null;
    semanticVersion = -1;
    setSemanticStatus(error instanceof Error ? error.message : "Semantic setup failed. Keyword mode remains available.", true);
    notify("Semantic mode unavailable — keyword mode still works.", true);
  } finally {
    modelBusy = false;
    updateSemanticControls();
  }
}

async function evaluateModels() {
  if (!semanticReady() || evalBusy) return;
  const modeVersion = indexVersion;
  evalBusy = true;
  updateSemanticControls();
  const panel = $("evaluation-output");
  panel.hidden = false;
  panel.textContent = "Starting REAL local-model evaluation against the included example documents…";
  try {
    const response = await fetch("./eval/queries.json");
    if (!response.ok) throw new Error("Labeled evaluation fixture was unavailable");
    const fixture = await response.json();
    const cases = fixture.cases;
    if (!Array.isArray(cases) || cases.length < 15) throw new Error("Invalid evaluation fixture");
    let kwHits = 0, hyHits = 0, kwRefusals = 0, hyRefusals = 0, related = 0, unrelated = 0;
    const start = performance.now();
    for (const [i, item] of cases.entries()) {
      if (indexVersion !== modeVersion || !semanticReady()) throw new Error("Documents changed; evaluation stopped.");
      panel.textContent = `Running actual on-device semantic model: ${i + 1}/${cases.length} questions…`;
      const kw = answerQuestion(item.question, indexed);
      const questionVector = await embedText(semanticExtractor, item.question);
      const hy = answerFromCandidates(item.question, hybridRank(item.question, indexed, questionVector, semanticVectors), 3,
        "Local MiniLM + keyword RRF (extractive)");
      if (item.expected_source === null) {
        unrelated++;
        if (!kw.answered) kwRefusals++;
        if (!hy.answered) hyRefusals++;
      } else {
        related++;
        if (kw.sources[0]?.filename === item.expected_source) kwHits++;
        if (hy.sources[0]?.filename === item.expected_source) hyHits++;
      }
      if (i % 3 === 2) await new Promise(resolve => setTimeout(resolve, 0));
    }
    const secs = ((performance.now() - start) / 1000).toFixed(2);
    panel.textContent = [
      "ACTUAL LOCAL MODEL COMPARISON (not a production benchmark)",
      `Document corpus: ${documents.length} fictional samples / ${indexed.chunks.length} chunks`,
      `Supported questions: ${related}, out-of-domain questions: ${unrelated}`,
      `First-source accuracy: keyword ${kwHits}/${related} vs hybrid ${hyHits}/${related}`,
      `Out-of-domain refusals: keyword ${kwRefusals}/${unrelated} vs hybrid ${hyRefusals}/${unrelated}`,
      `Total execution time: ${secs}s on this device (model was already loaded)`,
      "MiniLM uses real on-device embeddings. No frozen vectors or invented metrics.",
      "Curated toy questions are easy; scores are not independently validated accuracy.",
    ].join("\n");
  } catch (error) {
    panel.textContent = "Evaluation couldn't finish: " + (error instanceof Error ? error.message : "unknown error");
  } finally {
    evalBusy = false;
    updateSemanticControls();
  }
}

$("enable-semantic").addEventListener("click", enableSemantic);
$("retrieval-mode").addEventListener("change", () => {
  if ($("retrieval-mode").value === "hybrid" && !semanticReady()) {
    $("retrieval-mode").value = "keyword";
    setSemanticStatus("Hybrid mode isn't ready. Enable the on-device model first.", true);
  }
});
$("evaluate-modes").addEventListener("click", evaluateModels);

$("query-form").addEventListener("submit", event => {
  event.preventDefault();
  ask($("query-input").value);
});
$("query-input").addEventListener("keydown", event => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    ask($("query-input").value);
  }
});
document.querySelectorAll(".suggestion").forEach(button => button.addEventListener("click", () => {
  $("query-input").value = button.dataset.question;
  ask(button.dataset.question);
}));
$("document-filter").addEventListener("input", renderDocuments);
$("clear-docs").addEventListener("click", () => {
  documents.splice(0);
  rebuildIndex();
  clearResult();
  notify("All documents removed from this browser session.");
});
$("file-input").addEventListener("change", async event => {
  await loadFiles(event.target.files);
  event.target.value = "";
});
const zone = $("dropzone");
zone.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    $("file-input").click();
  }
});
for (const eventName of ["dragover", "dragenter"]) {
  zone.addEventListener(eventName, event => { event.preventDefault(); zone.classList.add("dragging"); });
}
for (const eventName of ["dragleave", "drop"]) {
  zone.addEventListener(eventName, event => { event.preventDefault(); zone.classList.remove("dragging"); });
}
zone.addEventListener("drop", async event => {
  if (event.dataTransfer?.files) await loadFiles(event.dataTransfer.files);
});

async function init() {
  for (const [path, name] of sampleFiles) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("missing sample");
      const text = await response.text();
      addDocument({ name, text, sample: true });
    } catch { notify("Some samples could not load. You can still upload your own files.", true); }
  }
  updateGenerationControls();
  if (!isWebGPUAvailable()) setGenerationStatus("WebGPU unavailable here. Extractive and semantic retrieval remain usable.", true);
  if (documents.length) notify(`${documents.length} sample documents ready. Ask a question or upload your own text.`);
  else notify("No examples loaded. Please upload a TXT, Markdown or PDF document.", true);
}
init();
