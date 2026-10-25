/**
 * On-device chest X-ray read (runs in the browser; the image never leaves the device and there is no per-read cost).
 *
 * Model: TorchXRayVision DenseNet-121 "xrv-all" as packaged by Chester (Cohen et al.), CC BY-NC 4.0, "not for medical
 * use" — teaching and demonstration only. Preprocessing and score calibration follow Chester exactly: centre crop,
 * 224×224 greyscale scaled to ±1024, then each output is rescaled around its operating point so 0.5 = threshold.
 * Eleven findings are used; Chester leaves pneumothorax, pneumonia, nodule, lesion, fracture and infiltration blank, and
 * the hernia output is not used (the engine would confuse it with abdominal hernia).
 */
import type { FindingConfidence, ImageAnalysisResponse, SuggestedFinding } from "@/types/diagnosisEngine";

export const LOCAL_MODEL_URL = "/models/chester-xrv-all/model.json";
export const LOCAL_CONFIG_URL = "/models/chester-xrv-all/config.json";
export const TFJS_URL = "/vendor/tfjs/tf.min.js";
const CACHE_KEY = "indexeddb://marifa-chester-xrv-all-v1";

export const LOCAL_READ_NOTICE =
  "On-device read by an open research model (TorchXRayVision / Chester, Cohen et al., CC BY-NC 4.0). Its authors state it is not for medical use: teaching and demonstration only. It screens a single frontal chest X-ray for 11 findings and cannot detect pneumothorax, nodules, fractures, lines or tubes. A clinician must review the image.";

export type ModelConfig = { IMAGE_SIZE: number; IMAGE_SCALE: number; LABELS: string[]; OP_POINT: number[]; SCALE_UPPER?: number };

/** Model label → finding text the engine recognises. */
export const LABEL_TO_FINDING: Record<string, string> = {
  Atelectasis: "Atelectasis",
  Consolidation: "Consolidation",
  Edema: "Pulmonary oedema",
  Emphysema: "Hyperinflation / emphysema",
  Fibrosis: "Pulmonary fibrosis",
  Effusion: "Pleural effusion",
  "Pleural Thickening": "Pleural thickening",
  Cardiomegaly: "Cardiomegaly",
  Mass: "Lung mass",
  "Lung Opacity": "Airspace opacity",
  "Enlarged Cardiomedia.": "Widened mediastinum / enlarged cardiomediastinum",
};

const CRITICAL = new Set(["Enlarged Cardiomedia.", "Mass"]);
export const POSITIVE = 0.6;
const BORDERLINE = 0.55;
const PRESELECT = 0.75;
/** Labels with known false positives in this model need a higher score before they are pre-ticked. */
const PRESELECT_OVERRIDE: Record<string, number> = { "Lung Opacity": 0.95 };
const MAX_BORDERLINE = 3;

/** Chester's calibration: 0.5 at the operating point, linear either side, upper half stretched by SCALE_UPPER. */
export function calibrate(value: number, opPoint: number, scaleUpper = 1.3) {
  if (value < opPoint) return value / (opPoint * 2);
  const normalised = 1 - (1 - value) / ((1 - opPoint) * 2);
  return normalised > 0.6 && scaleUpper ? Math.min(1, normalised * scaleUpper) : normalised;
}

export type LocalScore = { label: string; finding: string; raw: number; score: number };

export function scoresFromOutput(output: ArrayLike<number>, config: ModelConfig): LocalScore[] {
  const scores: LocalScore[] = [];
  config.LABELS.forEach((label, index) => {
    if (!label || !LABEL_TO_FINDING[label]) return;
    scores.push({ label, finding: LABEL_TO_FINDING[label], raw: output[index], score: calibrate(output[index], config.OP_POINT[index], config.SCALE_UPPER) });
  });
  return scores.sort((a, b) => b.score - a.score);
}

const confidenceOf = (score: number): FindingConfidence => (score >= 0.9 ? "high" : score >= PRESELECT ? "moderate" : "low");

/** Builds the same response shape as the AI read so one review panel serves both. */
export function localReadResponse(scores: LocalScore[], quality: ImageQuality): ImageAnalysisResponse {
  const positives = scores.filter((item) => item.score > POSITIVE);
  const borderline = scores.filter((item) => item.score > BORDERLINE && item.score <= POSITIVE).slice(0, MAX_BORDERLINE);
  const findings: SuggestedFinding[] = [
    ...positives.map((item) => ({ text: item.finding, confidence: confidenceOf(item.score), significance: (CRITICAL.has(item.label) ? "critical" : "abnormal") as SuggestedFinding["significance"], suggested: item.score >= (PRESELECT_OVERRIDE[item.label] ?? PRESELECT) })),
    ...borderline.map((item) => ({ text: item.finding, confidence: "low" as const, significance: "abnormal" as const, suggested: false })),
  ];
  const impression = positives.length
    ? `The on-device model flags ${positives.map((item) => item.finding.toLowerCase()).join(", ")}${borderline.length ? `; borderline for ${borderline.map((item) => item.finding.toLowerCase()).join(", ")}` : ""}.`
    : borderline.length
      ? `No finding above the model's threshold; borderline for ${borderline.map((item) => item.finding.toLowerCase()).join(", ")}.`
      : "No finding above the model's threshold among the 11 it screens for. This does not exclude pneumothorax, nodules, fractures or subtle disease.";
  return {
    studyDescription: "Frontal chest X-ray — on-device model",
    adequacy: quality.ok ? (quality.warnings.length ? "limited" : "adequate") : "non_diagnostic",
    adequacyNote: quality.warnings.join(" ") || undefined,
    impression,
    urgentAlerts: positives.filter((item) => item.label === "Enlarged Cardiomedia." && item.score >= PRESELECT).map(() => "Enlarged cardiomediastinum: if chest or back pain, consider aortic dissection — urgent CT aortogram."),
    findings,
    limitations: ["Screens 11 findings only: cannot detect pneumothorax, nodules, fractures, lines or tubes.", "Research model with known false positives (especially airspace opacity); lateral views, children and portable films reduce accuracy."],
    identifiersVisible: false,
    model: "TorchXRayVision DenseNet-121 (Chester), on device",
    notice: LOCAL_READ_NOTICE,
    source: "on-device",
    scores: scores.map((item) => ({ finding: item.finding, score: Math.round(item.score * 100) / 100 })),
  };
}

/* ── Image checks (lightweight stand-in for Chester's out-of-distribution autoencoder) ───────────── */

export type ImageQuality = { ok: boolean; warnings: string[]; reason?: string };

/** Rejects images that are clearly not a radiograph (colour photos, blank or very low-contrast frames, odd shapes). */
export function checkImage(rgba: ArrayLike<number>, width: number, height: number): ImageQuality {
  const warnings: string[] = [];
  const ratio = width / height;
  let colour = 0, sum = 0, sumSq = 0, count = 0;
  const step = Math.max(1, Math.floor((width * height) / 40000));
  for (let pixel = 0; pixel < width * height; pixel += step) {
    const i = pixel * 4;
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    colour += Math.abs(r - g) + Math.abs(g - b);
    const grey = (r + g + b) / 3;
    sum += grey;
    sumSq += grey * grey;
    count += 1;
  }
  const meanColour = colour / count;
  const mean = sum / count;
  const sd = Math.sqrt(Math.max(0, sumSq / count - mean * mean));
  if (meanColour > 18) return { ok: false, warnings, reason: "This looks like a colour image, not a radiograph. Attach the X-ray itself (greyscale)." };
  if (sd < 12) return { ok: false, warnings, reason: "The image is blank or has almost no contrast." };
  if (ratio < 0.55 || ratio > 1.8) return { ok: false, warnings, reason: "The image shape is unusual for a chest X-ray. Crop to the chest and try again." };
  if (meanColour > 6) warnings.push("Slight colour tint (photo of a screen?) may reduce accuracy.");
  if (mean > 200 || mean < 35) warnings.push("Exposure looks very bright or very dark.");
  if (ratio < 0.7 || ratio > 1.45) warnings.push("Image is not close to square; the centre crop may cut off lung edges.");
  return { ok: true, warnings };
}

/* ── Browser runtime ───────────────────────────────────────────────────────────────────────────── */

type TF = {
  ready: () => Promise<void>;
  setBackend: (name: string) => Promise<boolean>;
  loadGraphModel: (url: string, options?: { onProgress?: (fraction: number) => void }) => Promise<GraphModel>;
  tensor4d: (values: Float32Array, shape: [number, number, number, number]) => Tensor;
  tidy: <T>(fn: () => T) => T;
};
type Tensor = { dataSync: () => Float32Array; dispose: () => void };
type GraphModel = { predict: (input: Tensor) => Tensor; save: (url: string) => Promise<unknown> };

let runtime: Promise<TF> | null = null;
let model: Promise<{ model: GraphModel; config: ModelConfig }> | null = null;

function loadRuntime(): Promise<TF> {
  if (runtime) return runtime;
  runtime = new Promise<TF>((resolve, reject) => {
    const existing = (window as unknown as { tf?: TF }).tf;
    if (existing) return resolve(existing);
    const script = document.createElement("script");
    script.src = TFJS_URL;
    script.async = true;
    script.onload = () => {
      const tf = (window as unknown as { tf?: TF }).tf;
      if (tf) resolve(tf); else reject(new Error("The on-device model runtime did not load."));
    };
    script.onerror = () => reject(new Error("The on-device model runtime could not be downloaded."));
    document.head.appendChild(script);
  }).catch((error) => { runtime = null; throw error; });
  return runtime;
}

/** Loads the model once per page (and from the browser's own cache after the first download, ~28 MB). */
export function loadLocalModel(onProgress?: (fraction: number) => void) {
  if (model) return model;
  model = (async () => {
    const tf = await loadRuntime();
    if (!(await tf.setBackend("webgl").catch(() => false))) await tf.setBackend("cpu");
    await tf.ready();
    const config = (await (await fetch(LOCAL_CONFIG_URL)).json()) as ModelConfig;
    let loaded: GraphModel;
    try {
      loaded = await tf.loadGraphModel(CACHE_KEY);
      onProgress?.(1);
    } catch {
      loaded = await tf.loadGraphModel(LOCAL_MODEL_URL, { onProgress });
      loaded.save(CACHE_KEY).catch(() => undefined);
    }
    return { model: loaded, config };
  })().catch((error) => { model = null; throw error; });
  return model;
}

/** Centre crop to a square, resize to size×size, greyscale scaled to ±scale — Chester's exact input. */
export function prepareInput(source: CanvasImageSource, width: number, height: number, size: number, scale: number) {
  const side = Math.min(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is not available in this browser.");
  context.imageSmoothingQuality = "high";
  context.drawImage(source, (width - side) / 2, (height - side) / 2, side, side, 0, 0, size, size);
  const { data } = context.getImageData(0, 0, size, size);
  const input = new Float32Array(size * size);
  for (let index = 0; index < size * size; index += 1) {
    const grey = (data[index * 4] + data[index * 4 + 1] + data[index * 4 + 2]) / 3 / 255;
    input[index] = (grey * 2 - 1) * scale;
  }
  return input;
}

/** Full on-device read of one frontal chest X-ray image. */
export async function readChestXrayLocally(image: HTMLImageElement, onProgress?: (fraction: number) => void): Promise<ImageAnalysisResponse> {
  const width = image.naturalWidth, height = image.naturalHeight;
  const probe = document.createElement("canvas");
  const scale = Math.min(1, 400 / Math.max(width, height));
  probe.width = Math.max(1, Math.round(width * scale));
  probe.height = Math.max(1, Math.round(height * scale));
  const probeContext = probe.getContext("2d", { willReadFrequently: true });
  if (!probeContext) throw new Error("Canvas is not available in this browser.");
  probeContext.drawImage(image, 0, 0, probe.width, probe.height);
  const quality = checkImage(probeContext.getImageData(0, 0, probe.width, probe.height).data, probe.width, probe.height);
  if (!quality.ok) throw new Error(quality.reason);

  const tf = await loadRuntime();
  const { model: net, config } = await loadLocalModel(onProgress);
  const input = prepareInput(image, width, height, config.IMAGE_SIZE, config.IMAGE_SCALE);
  const output = tf.tidy(() => {
    const tensor = tf.tensor4d(input, [1, 1, config.IMAGE_SIZE, config.IMAGE_SIZE]);
    return net.predict(tensor).dataSync();
  });
  return localReadResponse(scoresFromOutput(output, config), quality);
}
