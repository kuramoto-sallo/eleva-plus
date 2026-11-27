import { describe, expect, it } from "vitest";
import {
  applicationSchema,
  checkResume,
  checkVideo,
  educationSchema,
  interestsSchema,
  personalSchema,
  RESUME_MAX_BYTES,
  VIDEO_MAX_BYTES,
} from "./application";

// Dados fictícios (CLAUDE.md, LGPD).
const valid = {
  fullName: "Maria Teste da Silva",
  email: "Maria.Teste@Example.com",
  phone: "(62) 9 9999-0000",
  city: "Goiânia",
  state: "GO",
  institution: "Universidade Exemplo",
  course: "Engenharia de Produção",
  semester: "5",
  graduationMonth: "12",
  graduationYear: "2027",
  interestArea: "operacoes",
  availability: "manha",
  linkedinUrl: "",
  ageConfirmed: true,
  consent: true,
  videoMode: "link",
  videoUrl: "https://youtu.be/abc123",
} as const;

describe("applicationSchema", () => {
  it("aceita uma inscrição válida e normaliza e-mail, telefone e números", () => {
    const r = applicationSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.email).toBe("maria.teste@example.com");
    expect(r.data.phone).toBe("62999990000");
    expect(r.data.semester).toBe(5);
    expect(r.data.graduationYear).toBe(2027);
    expect(r.data.linkedinUrl).toBeUndefined();
  });

  it("exige nome e sobrenome", () => {
    const r = personalSchema.safeParse({ ...valid, fullName: "Maria" });
    expect(r.success).toBe(false);
  });

  it("recusa UF fora da lista", () => {
    expect(personalSchema.safeParse({ ...valid, state: "XX" }).success).toBe(false);
  });

  it("recusa formatura antes de dezembro de 2027", () => {
    const r = educationSchema.safeParse({ ...valid, graduationMonth: "11", graduationYear: "2027" });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.issues[0].path).toEqual(["graduationMonth"]);
  });

  it("aceita formatura em 2028 em qualquer mês", () => {
    expect(educationSchema.safeParse({ ...valid, graduationMonth: "1", graduationYear: "2028" }).success).toBe(true);
  });

  it("recusa semestre vazio", () => {
    expect(educationSchema.safeParse({ ...valid, semester: "" }).success).toBe(false);
  });

  it("aceita só as 4 macroáreas e os 2 turnos", () => {
    expect(interestsSchema.safeParse({ ...valid, interestArea: "rh" }).success).toBe(false);
    expect(interestsSchema.safeParse({ ...valid, availability: "integral" }).success).toBe(false);
  });

  it("valida o LinkedIn só quando preenchido", () => {
    expect(interestsSchema.safeParse({ ...valid, linkedinUrl: "https://www.linkedin.com/in/teste" }).success).toBe(
      true,
    );
    expect(interestsSchema.safeParse({ ...valid, linkedinUrl: "https://exemplo.com/teste" }).success).toBe(false);
  });

  it("exige link do YouTube quando o vídeo é por link", () => {
    expect(applicationSchema.safeParse({ ...valid, videoUrl: "https://vimeo.com/1" }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...valid, videoMode: "upload", videoUrl: undefined }).success).toBe(true);
  });

  it("exige consentimento e idade mínima", () => {
    expect(applicationSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...valid, ageConfirmed: false }).success).toBe(false);
  });
});

describe("checkResume", () => {
  it("aceita PDF até 10 MB", () => {
    expect(checkResume({ name: "cv.pdf", type: "application/pdf", size: 1000 }).ok).toBe(true);
  });
  it("recusa outros tipos, arquivo grande e vazio", () => {
    expect(checkResume({ name: "cv.docx", type: "application/msword", size: 1000 }).ok).toBe(false);
    expect(checkResume({ name: "cv.pdf", type: "application/pdf", size: RESUME_MAX_BYTES + 1 }).ok).toBe(false);
    expect(checkResume({ name: "cv.pdf", type: "application/pdf", size: 0 }).ok).toBe(false);
    expect(checkResume(null).ok).toBe(false);
  });
});

describe("checkVideo", () => {
  it("aceita MP4, MOV e WebM até 100 MB e 1 minuto", () => {
    expect(checkVideo({ name: "v.mp4", type: "video/mp4", size: 1000 }, 59).ok).toBe(true);
    expect(checkVideo({ name: "v.mov", type: "video/quicktime", size: 1000 }, 60.5).ok).toBe(true);
    expect(checkVideo({ name: "v.webm", type: "video/webm", size: 1000 }).ok).toBe(true);
  });
  it("recusa vídeo longo, grande ou de outro tipo", () => {
    expect(checkVideo({ name: "v.mp4", type: "video/mp4", size: 1000 }, 75).ok).toBe(false);
    expect(checkVideo({ name: "v.mp4", type: "video/mp4", size: VIDEO_MAX_BYTES + 1 }).ok).toBe(false);
    expect(checkVideo({ name: "v.avi", type: "video/x-msvideo", size: 1000 }).ok).toBe(false);
  });
});
