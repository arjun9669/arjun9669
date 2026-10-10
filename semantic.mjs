/**
 * On-device semantic embeddings via Transformers.js v3 (opt-in only).
 * Network access is used to download public library/model files; source text
 * is processed in this browser and is not sent to a paid inference API.
 *
 * Official Transformers.js v3 CDN syntax documented by Hugging Face:
 * https://huggingface.co/blog/transformersjs-v3
 */
export const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
export const TRANSFORMERS_CDN = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0";
export const MAX_SEMANTIC_CHUNKS = 72;
let extractorPromise = null;

export async function loadBrowserEmbedder(onProgress = () => {}) {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import(TRANSFORMERS_CDN);
      // Avoid using a relative /models path on static GitHub Pages.
      if (env) env.allowLocalModels = false;
      return pipeline("feature-extraction", MODEL_ID, {
        dtype: "q8",
        device: "wasm",
        progress_callback: event => {
          if (event.status === "progress") {
            const percent = typeof event.progress === "number" ? ` ${Math.round(event.progress)}%` : "";
            onProgress(`Downloading open model files${percent}…`);
          } else if (event.status === "initiate" || event.status === "download") {
            onProgress("Downloading public model files…");
          }
        }
      });
    })().catch(err => {
      extractorPromise = null; // allow retry when connection returns
      throw new Error("On-device model could not load. Check network/browser compatibility; keyword search still works. " + (err?.message || ""));
    });
  }
  return extractorPromise;
}

export async function embedText(extractor, input) {
  const result = await extractor(String(input), { pooling: "mean", normalize: true });
  const data = result.data;
  const array = data ? Array.from(data) : result.tolist()?.[0];
  if (!Array.isArray(array) || array.length < 32 || array.some(n => !Number.isFinite(n))) {
    throw new Error("The local embedding model returned an invalid vector");
  }
  return array;
}

export async function embedChunks(extractor, chunks, onProgress = () => {}) {
  if (chunks.length > MAX_SEMANTIC_CHUNKS) {
    throw new Error(`Semantic mode supports up to ${MAX_SEMANTIC_CHUNKS} chunks per session; remove documents and try again. Keyword mode has no semantic limit.`);
  }
  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    vectors.push(await embedText(extractor, chunks[i].content));
    onProgress(`Embedding document passages: ${i + 1}/${chunks.length}`);
    // Give the browser a chance to repaint progress, especially on phones.
    if (i % 3 === 2) await new Promise(resolve => setTimeout(resolve, 0));
  }
  return vectors;
}
