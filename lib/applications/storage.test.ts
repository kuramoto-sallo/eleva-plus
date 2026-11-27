import { describe, expect, it } from "vitest";
import { resumePath, videoMimeFrom, videoPath } from "./storage";

describe("caminhos no Storage", () => {
  it("usa pasta por inscrição e nomes fixos", () => {
    expect(resumePath("p1", "a1")).toBe("p1/a1/curriculo.pdf");
    expect(videoPath("p1", "a1", "video/quicktime")).toBe("p1/a1/video.mov");
  });
  it("descobre o tipo do vídeo pelo MIME ou pela extensão", () => {
    expect(videoMimeFrom({ type: "video/webm", name: "x" })).toBe("video/webm");
    expect(videoMimeFrom({ type: "", name: "IMG_0001.MOV" })).toBe("video/quicktime");
    expect(videoMimeFrom({ type: "", name: "filme.avi" })).toBeNull();
  });
});
