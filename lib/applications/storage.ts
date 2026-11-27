// Caminhos dos arquivos no bucket privado candidate-files.
// Ficam numa pasta por inscrição, com nomes fixos: o candidato não escolhe o caminho.

export const CANDIDATE_BUCKET = "candidate-files";

export const VIDEO_EXTENSIONS = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" } as const;
export type VideoMime = keyof typeof VIDEO_EXTENSIONS;

export function applicationFolder(processId: string, applicationId: string) {
  return `${processId}/${applicationId}`;
}

export function resumePath(processId: string, applicationId: string) {
  return `${applicationFolder(processId, applicationId)}/curriculo.pdf`;
}

export function videoPath(processId: string, applicationId: string, mime: VideoMime) {
  return `${applicationFolder(processId, applicationId)}/video.${VIDEO_EXTENSIONS[mime]}`;
}

/** MIME do vídeo a partir do tipo informado ou da extensão (alguns celulares mandam tipo vazio). */
export function videoMimeFrom(file: { type: string; name: string }): VideoMime | null {
  if (file.type in VIDEO_EXTENSIONS) return file.type as VideoMime;
  const ext = file.name.toLowerCase().split(".").pop();
  const found = Object.entries(VIDEO_EXTENSIONS).find(([, e]) => e === ext);
  return found ? (found[0] as VideoMime) : null;
}
