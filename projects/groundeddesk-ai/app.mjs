import { buildIndex, answerQuestion } from "./retrieval.mjs";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_CHARS = 180000;
const MAX_DOCUMENTS = 15;
const $ = id => document.getElementById(id);
const documents = [];
let indexed = buildIndex([]);
let currentAnswer = null;
let visibleQuestion = "";
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
  heading.append(make("span", "", result.answered ? `${result.sources.length} CITED SOURCE(S)` : "NO SUPPORTING EVIDENCE"));
  if (result.answered) {
    const copy = make("button", "copy-button", "Copy answer");
    copy.type = "button";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(`${visibleQuestion}\n\n${result.answer}\n\n${result.sources.map(s => `[${s.citation}] ${s.filename}`).join("\n")}`);
        notify("Answer copied to clipboard.");
      } catch { notify("Clipboard access was blocked by the browser.", true); }
    });
    heading.append(copy);
  }
  view.append(heading, make("div", "answer-box", result.answer));

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
      "Scores are uncalibrated relevance ranks, not confidence percentages. All quoted passages originate in your loaded text. Keyword retrieval may miss paraphrases."));
  } else {
    view.append(make("p", "result-footnote", "Try a different question or add a document containing relevant information. No answer was invented."));
  }
}

function ask(question) {
  const value = question.trim();
  if (!value) { notify("Enter a question about the documents.", true); return; }
  if (!documents.length) { notify("Add a document before asking a question.", true); return; }
  try {
    const result = answerQuestion(value, indexed);
    renderResult(value, result);
    notify(result.answered ? "Evidence retrieved locally." : "No matching evidence in this session.");
  } catch (error) { notify(error instanceof Error ? error.message : "Search failed.", true); }
}

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
  if (documents.length) notify(`${documents.length} sample documents ready. Ask a question or upload your own text.`);
}
init();
