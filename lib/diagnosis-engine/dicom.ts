/**
 * Minimal DICOM reader for previewing and sending a single image to the AI read.
 *
 * Reads only what is needed to draw the pixels (size, bit depth, rescale, window, photometric) plus the
 * non-identifying Modality and Body Part tags. Patient, study and institution tags are never read, and only
 * the rendered pixels leave the browser — so DICOM header identifiers are dropped by design.
 * Supports uncompressed little-endian transfer syntaxes; compressed studies must be exported as JPEG/PNG.
 */

export type DicomImage = {
  width: number;
  height: number;
  /** RGBA pixels ready for a canvas ImageData. */
  rgba: Uint8ClampedArray<ArrayBuffer>;
  modality?: string;
  bodyPart?: string;
  frames: number;
};

export class DicomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DicomError";
  }
}

const IMPLICIT_LE = "1.2.840.10008.1.2";
const EXPLICIT_LE = "1.2.840.10008.1.2.1";
const DEFLATED = "1.2.840.10008.1.2.1.99";
const LONG_VRS = new Set(["OB", "OD", "OF", "OL", "OV", "OW", "SQ", "SV", "UC", "UN", "UR", "UT", "UV"]);
const UNDEFINED = 0xffffffff;

const tag = (group: number, element: number) => ((group << 16) | element) >>> 0;
const T = {
  transferSyntax: tag(0x0002, 0x0010),
  modality: tag(0x0008, 0x0060),
  bodyPart: tag(0x0018, 0x0015),
  samples: tag(0x0028, 0x0002),
  photometric: tag(0x0028, 0x0004),
  frames: tag(0x0028, 0x0008),
  rows: tag(0x0028, 0x0010),
  columns: tag(0x0028, 0x0011),
  bitsAllocated: tag(0x0028, 0x0100),
  bitsStored: tag(0x0028, 0x0101),
  pixelRepresentation: tag(0x0028, 0x0103),
  planar: tag(0x0028, 0x0006),
  windowCenter: tag(0x0028, 0x1050),
  windowWidth: tag(0x0028, 0x1051),
  intercept: tag(0x0028, 0x1052),
  slope: tag(0x0028, 0x1053),
  pixelData: tag(0x7fe0, 0x0010),
  item: tag(0xfffe, 0xe000),
  itemEnd: tag(0xfffe, 0xe00d),
  sequenceEnd: tag(0xfffe, 0xe0dd),
};
const WANTED = new Set([T.transferSyntax, T.modality, T.bodyPart, T.samples, T.photometric, T.frames, T.rows, T.columns, T.bitsAllocated, T.bitsStored, T.pixelRepresentation, T.planar, T.windowCenter, T.windowWidth, T.intercept, T.slope]);

type Element = { offset: number; length: number };

class Reader {
  private readonly view: DataView;
  readonly explicit: boolean;
  constructor(view: DataView, explicit: boolean) {
    this.view = view;
    this.explicit = explicit;
  }
  get size() { return this.view.byteLength; }

  /** Reads the element header at `offset`; returns tag, VR, value offset and length (or UNDEFINED). */
  header(offset: number, explicit = this.explicit) {
    const group = this.view.getUint16(offset, true);
    const element = this.view.getUint16(offset + 2, true);
    const id = tag(group, element);
    if (group === 0xfffe) return { id, vr: "", valueOffset: offset + 8, length: this.view.getUint32(offset + 4, true) };
    if (explicit) {
      const vr = String.fromCharCode(this.view.getUint8(offset + 4), this.view.getUint8(offset + 5));
      if (LONG_VRS.has(vr)) return { id, vr, valueOffset: offset + 12, length: this.view.getUint32(offset + 8, true) };
      return { id, vr, valueOffset: offset + 8, length: this.view.getUint16(offset + 6, true) };
    }
    return { id, vr: "", valueOffset: offset + 8, length: this.view.getUint32(offset + 4, true) };
  }

  /** Skips an undefined-length sequence or item list starting at `offset`; returns the offset after it. */
  skipUndefined(offset: number, explicit: boolean): number {
    let cursor = offset;
    let depth = 0;
    while (cursor + 8 <= this.size) {
      const head = this.header(cursor, explicit);
      if (head.id === T.sequenceEnd) {
        if (depth === 0) return head.valueOffset;
        depth -= 1;
        cursor = head.valueOffset;
        continue;
      }
      if (head.id === T.item) {
        cursor = head.length === UNDEFINED ? head.valueOffset : head.valueOffset + head.length;
        continue;
      }
      if (head.id === T.itemEnd) {
        cursor = head.valueOffset;
        continue;
      }
      if (head.length === UNDEFINED) {
        depth += 1;
        cursor = head.valueOffset;
        continue;
      }
      cursor = head.valueOffset + head.length;
    }
    throw new DicomError("The DICOM file ended inside a sequence.");
  }
}

function text(view: DataView, { offset, length }: Element) {
  let value = "";
  for (let index = 0; index < length; index += 1) value += String.fromCharCode(view.getUint8(offset + index));
  return value.replace(/\0/g, "").trim();
}

const firstNumber = (value: string | undefined) => {
  const parsed = Number.parseFloat((value ?? "").split("\\")[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function isDicom(buffer: ArrayBuffer) {
  if (buffer.byteLength < 132) return false;
  const view = new Uint8Array(buffer, 128, 4);
  return String.fromCharCode(...view) === "DICM";
}

/** Parses the dataset and renders the middle frame to 8-bit RGBA with the stored (or automatic) window. */
export function readDicom(buffer: ArrayBuffer): DicomImage {
  const view = new DataView(buffer);
  const elements = new Map<number, Element>();
  const hasPreamble = isDicom(buffer);
  let offset = hasPreamble ? 132 : 0;
  let transferSyntax = IMPLICIT_LE;

  // File meta information (group 0002) is always explicit VR little endian.
  if (hasPreamble) {
    const meta = new Reader(view, true);
    while (offset + 8 <= view.byteLength && view.getUint16(offset, true) === 0x0002) {
      const head = meta.header(offset);
      if (head.id === T.transferSyntax) transferSyntax = text(view, { offset: head.valueOffset, length: head.length });
      offset = head.valueOffset + head.length;
    }
  }
  if (transferSyntax === DEFLATED || (transferSyntax !== IMPLICIT_LE && transferSyntax !== EXPLICIT_LE)) {
    throw new DicomError("This DICOM file is compressed. Export the image as JPEG or PNG from the viewer and attach that instead.");
  }

  const reader = new Reader(view, transferSyntax === EXPLICIT_LE);
  while (offset + 8 <= view.byteLength) {
    const head = reader.header(offset);
    if (head.id === T.pixelData) {
      if (head.length === UNDEFINED) throw new DicomError("This DICOM file holds compressed pixel data. Export the image as JPEG or PNG and attach that instead.");
      elements.set(T.pixelData, { offset: head.valueOffset, length: Math.min(head.length, view.byteLength - head.valueOffset) });
      break;
    }
    if (head.length === UNDEFINED) {
      offset = reader.skipUndefined(head.valueOffset, reader.explicit);
      continue;
    }
    if (WANTED.has(head.id)) elements.set(head.id, { offset: head.valueOffset, length: head.length });
    offset = head.valueOffset + head.length;
  }

  const u16 = (id: number) => (elements.has(id) ? view.getUint16(elements.get(id)!.offset, true) : undefined);
  const str = (id: number) => (elements.has(id) ? text(view, elements.get(id)!) : undefined);
  const rows = u16(T.rows), columns = u16(T.columns);
  const pixels = elements.get(T.pixelData);
  if (!rows || !columns || !pixels) throw new DicomError("No image was found in this DICOM file.");

  const bitsAllocated = u16(T.bitsAllocated) ?? 16;
  const signed = u16(T.pixelRepresentation) === 1;
  const samples = u16(T.samples) ?? 1;
  const photometric = (str(T.photometric) ?? "MONOCHROME2").toUpperCase();
  const frames = Math.max(1, Math.round(firstNumber(str(T.frames)) ?? 1));
  const slope = firstNumber(str(T.slope)) ?? 1;
  const intercept = firstNumber(str(T.intercept)) ?? 0;
  const pixelCount = rows * columns;
  const bytesPerSample = bitsAllocated / 8;
  const frameBytes = pixelCount * samples * bytesPerSample;
  const frame = Math.floor(frames / 2);
  const start = pixels.offset + frame * frameBytes;
  if (start + frameBytes > view.byteLength) throw new DicomError("The DICOM pixel data is incomplete.");

  const rgba = new Uint8ClampedArray(pixelCount * 4);

  if (samples === 3 && bitsAllocated === 8) {
    const planar = u16(T.planar) === 1;
    for (let index = 0; index < pixelCount; index += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        const source = planar ? start + channel * pixelCount + index : start + index * 3 + channel;
        rgba[index * 4 + channel] = view.getUint8(source);
      }
      rgba[index * 4 + 3] = 255;
    }
    return { width: columns, height: rows, rgba, modality: str(T.modality), bodyPart: str(T.bodyPart), frames };
  }
  if (samples !== 1 || ![8, 16].includes(bitsAllocated)) throw new DicomError("This DICOM image format is not supported. Export it as JPEG or PNG.");

  const values = new Float32Array(pixelCount);
  let min = Infinity, max = -Infinity;
  for (let index = 0; index < pixelCount; index += 1) {
    const at = start + index * bytesPerSample;
    const raw = bitsAllocated === 8 ? (signed ? view.getInt8(at) : view.getUint8(at)) : signed ? view.getInt16(at, true) : view.getUint16(at, true);
    const value = raw * slope + intercept;
    values[index] = value;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  let center = firstNumber(str(T.windowCenter));
  let width = firstNumber(str(T.windowWidth));
  if (center === undefined || width === undefined || width <= 1) {
    center = (min + max) / 2;
    width = Math.max(1, max - min);
  }
  const low = center - width / 2;
  const invert = photometric === "MONOCHROME1";
  for (let index = 0; index < pixelCount; index += 1) {
    let grey = ((values[index] - low) / width) * 255;
    grey = grey < 0 ? 0 : grey > 255 ? 255 : grey;
    if (invert) grey = 255 - grey;
    const base = index * 4;
    rgba[base] = rgba[base + 1] = rgba[base + 2] = grey;
    rgba[base + 3] = 255;
  }
  return { width: columns, height: rows, rgba, modality: str(T.modality), bodyPart: str(T.bodyPart), frames };
}
