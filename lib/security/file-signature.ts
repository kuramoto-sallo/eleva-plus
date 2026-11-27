// Confere o tipo real de um arquivo pelos primeiros bytes ("magic numbers"),
// sem confiar na extensão nem no Content-Type informado pelo navegador.

export type DetectedType = "pdf" | "mp4" | "mov" | "webm" | "unknown";

export function detectFileType(bytes: Uint8Array): DetectedType {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes.length >= 5 && ascii(0, 5) === "%PDF-") return "pdf";
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return "webm";
  }
  if (bytes.length >= 12 && ascii(4, 8) === "ftyp") {
    return ascii(8, 12) === "qt  " ? "mov" : "mp4";
  }
  // QuickTime antigo, sem "ftyp" no começo.
  if (bytes.length >= 8 && ["moov", "mdat", "wide", "free", "skip", "pnot"].includes(ascii(4, 8))) return "mov";
  return "unknown";
}

export function isAllowedResume(type: DetectedType) {
  return type === "pdf";
}

export function isAllowedVideo(type: DetectedType) {
  return type === "mp4" || type === "mov" || type === "webm";
}
