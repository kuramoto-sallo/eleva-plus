import { describe, expect, it } from "vitest";
import { detectFileType, isAllowedResume, isAllowedVideo } from "./file-signature";

const bytes = (...parts: (string | number[])[]) =>
  new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));

describe("detectFileType", () => {
  it("reconhece PDF", () => {
    expect(detectFileType(bytes("%PDF-1.7\n"))).toBe("pdf");
  });
  it("reconhece MP4, MOV e WebM", () => {
    expect(detectFileType(bytes([0, 0, 0, 0x20], "ftypisom", [0, 0]))).toBe("mp4");
    expect(detectFileType(bytes([0, 0, 0, 0x14], "ftypqt  ", [0, 0]))).toBe("mov");
    expect(detectFileType(bytes([0, 0, 0, 0x08], "wide"))).toBe("mov");
    expect(detectFileType(bytes([0x1a, 0x45, 0xdf, 0xa3, 0x01]))).toBe("webm");
  });
  it("não aceita arquivo disfarçado", () => {
    // Um executável renomeado para .pdf continua "unknown".
    expect(detectFileType(bytes("MZ\x90\x00"))).toBe("unknown");
    expect(detectFileType(bytes("<html>"))).toBe("unknown");
    expect(detectFileType(new Uint8Array())).toBe("unknown");
  });
  it("só aceita PDF como currículo e vídeo como vídeo", () => {
    expect(isAllowedResume("pdf")).toBe(true);
    expect(isAllowedResume("mp4")).toBe(false);
    expect(isAllowedVideo("webm")).toBe(true);
    expect(isAllowedVideo("pdf")).toBe(false);
  });
});
