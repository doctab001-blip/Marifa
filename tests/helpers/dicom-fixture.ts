/** Builds small synthetic DICOM files for tests (no real patient data). */
type El = { group: number; element: number; vr: string; value: Uint8Array };

const LONG_VRS = new Set(["OB", "OD", "OF", "OL", "OV", "OW", "SQ", "SV", "UC", "UN", "UR", "UT", "UV"]);
const ascii = (text: string) => { const padded = text.length % 2 ? `${text} ` : text; return new TextEncoder().encode(padded); };
const uid = (text: string) => { const bytes = new TextEncoder().encode(text.length % 2 ? `${text}\0` : text); return bytes; };
const u16 = (value: number) => { const bytes = new Uint8Array(2); new DataView(bytes.buffer).setUint16(0, value, true); return bytes; };

function encode(elements: El[], explicit: boolean) {
  const parts: Uint8Array[] = [];
  for (const el of elements) {
    const head = new DataView(new ArrayBuffer(12));
    head.setUint16(0, el.group, true);
    head.setUint16(2, el.element, true);
    if (explicit || el.group === 0x0002) {
      head.setUint8(4, el.vr.charCodeAt(0));
      head.setUint8(5, el.vr.charCodeAt(1));
      if (LONG_VRS.has(el.vr)) { head.setUint32(8, el.value.length, true); parts.push(new Uint8Array(head.buffer, 0, 12)); }
      else { head.setUint16(6, el.value.length, true); parts.push(new Uint8Array(head.buffer, 0, 8)); }
    } else {
      head.setUint32(4, el.value.length, true);
      parts.push(new Uint8Array(head.buffer, 0, 8));
    }
    parts.push(el.value);
  }
  return parts;
}

export function buildDicom(options: { width: number; height: number; pixels: number[]; transferSyntax?: string; explicit?: boolean; photometric?: string; windowCenter?: number; windowWidth?: number; modality?: string; bodyPart?: string; withSequence?: boolean }) {
  const transfer = options.transferSyntax ?? (options.explicit === false ? "1.2.840.10008.1.2" : "1.2.840.10008.1.2.1");
  const explicit = transfer !== "1.2.840.10008.1.2";
  const meta = encode([{ group: 0x0002, element: 0x0010, vr: "UI", value: uid(transfer) }], true);
  const pixelBytes = new Uint8Array(options.pixels.length * 2);
  options.pixels.forEach((value, index) => new DataView(pixelBytes.buffer).setUint16(index * 2, value, true));
  const body: El[] = [
    { group: 0x0008, element: 0x0060, vr: "CS", value: ascii(options.modality ?? "CR") },
    { group: 0x0010, element: 0x0010, vr: "PN", value: ascii("TEST^PATIENT") },
    { group: 0x0018, element: 0x0015, vr: "CS", value: ascii(options.bodyPart ?? "CHEST") },
    { group: 0x0028, element: 0x0002, vr: "US", value: u16(1) },
    { group: 0x0028, element: 0x0004, vr: "CS", value: ascii(options.photometric ?? "MONOCHROME2") },
    { group: 0x0028, element: 0x0010, vr: "US", value: u16(options.height) },
    { group: 0x0028, element: 0x0011, vr: "US", value: u16(options.width) },
    { group: 0x0028, element: 0x0100, vr: "US", value: u16(16) },
    { group: 0x0028, element: 0x0101, vr: "US", value: u16(12) },
    { group: 0x0028, element: 0x0103, vr: "US", value: u16(0) },
  ];
  if (options.windowCenter !== undefined) body.push({ group: 0x0028, element: 0x1050, vr: "DS", value: ascii(String(options.windowCenter)) });
  if (options.windowWidth !== undefined) body.push({ group: 0x0028, element: 0x1051, vr: "DS", value: ascii(String(options.windowWidth)) });
  const parts: Uint8Array[] = [new Uint8Array(128), new TextEncoder().encode("DICM"), ...meta];
  const encodedBody = encode(body, explicit);
  parts.push(...encodedBody);
  if (options.withSequence) {
    // (0008,1140) referenced image sequence with undefined length, one undefined-length item.
    const sq = new DataView(new ArrayBuffer(explicit ? 12 : 8));
    sq.setUint16(0, 0x0008, true); sq.setUint16(2, 0x1140, true);
    if (explicit) { sq.setUint8(4, 83); sq.setUint8(5, 81); sq.setUint32(8, 0xffffffff, true); } else sq.setUint32(4, 0xffffffff, true);
    const item = new DataView(new ArrayBuffer(8)); item.setUint16(0, 0xfffe, true); item.setUint16(2, 0xe000, true); item.setUint32(4, 0xffffffff, true);
    const inner = encode([{ group: 0x0008, element: 0x1150, vr: "UI", value: uid("1.2.3") }], explicit);
    const itemEnd = new DataView(new ArrayBuffer(8)); itemEnd.setUint16(0, 0xfffe, true); itemEnd.setUint16(2, 0xe00d, true);
    const seqEnd = new DataView(new ArrayBuffer(8)); seqEnd.setUint16(0, 0xfffe, true); seqEnd.setUint16(2, 0xe0dd, true);
    parts.push(new Uint8Array(sq.buffer), new Uint8Array(item.buffer), ...inner, new Uint8Array(itemEnd.buffer), new Uint8Array(seqEnd.buffer));
  }
  parts.push(...encode([{ group: 0x7fe0, element: 0x0010, vr: "OW", value: pixelBytes }], explicit));
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out.buffer;
}
