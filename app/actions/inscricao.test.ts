// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("SUPABASE_SECRET_KEY", "chave-de-teste");
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));

const turnstile = vi.fn();
vi.mock("@/lib/security/turnstile", () => ({ verifyTurnstile: (...a: unknown[]) => turnstile(...a) }));
const sendEmail = vi.fn(async () => true);
vi.mock("@/lib/email/send", () => ({ sendEmail: (...a: unknown[]) => sendEmail(...(a as [])) }));

// Cliente admin falso: só o que as actions usam.
const state = {
  rateAllowed: true as boolean,
  processId: "11111111-1111-4111-8111-111111111111" as string | null,
  fileHeads: {} as Record<string, string>,
  insertError: null as null | { code: string },
  inserted: [] as Record<string, unknown>[],
  removed: [] as string[][],
};

function queryChain() {
  const chain = {
    select: () => chain,
    lte: () => chain,
    gt: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: async () => ({ data: state.processId ? { id: state.processId } : null, error: null }),
    insert: async (row: Record<string, unknown>) => {
      state.inserted.push(row);
      return { error: state.insertError };
    },
  };
  return chain;
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => queryChain(),
    rpc: async () => ({ data: state.rateAllowed, error: null }),
    storage: {
      from: () => ({
        createSignedUploadUrl: async (path: string) => ({ data: { token: `tok:${path}` }, error: null }),
        info: async (path: string) =>
          path in state.fileHeads
            ? { data: { size: state.fileHeads[path].length }, error: null }
            : { data: null, error: new Error("not found") },
        createSignedUrl: async (path: string) => ({ data: { signedUrl: `https://storage.test/${path}` }, error: null }),
        remove: async (paths: string[]) => {
          state.removed.push(paths);
          return { data: [], error: null };
        },
      }),
    },
  }),
}));

vi.stubGlobal(
  "fetch",
  vi.fn(async (url: string) => {
    const path = url.replace("https://storage.test/", "");
    return new Response(state.fileHeads[path] ?? "", { status: 206 });
  }),
);

const { startApplication, finishApplication } = await import("./inscricao");

// Dados fictícios.
const data = {
  fullName: "Maria Teste da Silva",
  email: "maria.teste@example.com",
  phone: "(62) 99999-0000",
  city: "Goiânia",
  state: "GO",
  institution: "Universidade Exemplo",
  course: "Administração",
  semester: "5",
  graduationMonth: "12",
  graduationYear: "2027",
  interestArea: "gestao",
  availability: "tarde",
  linkedinUrl: "",
  ageConfirmed: true,
  consent: true,
  videoMode: "upload",
};
const resume = { name: "cv.pdf", type: "application/pdf", size: 2000 };
const video = { name: "v.mp4", type: "video/mp4", size: 5000 };

beforeEach(() => {
  turnstile.mockReset().mockResolvedValue(true);
  sendEmail.mockClear();
  Object.assign(state, {
    rateAllowed: true,
    processId: "11111111-1111-4111-8111-111111111111",
    fileHeads: {},
    insertError: null,
    inserted: [],
    removed: [],
  });
});

describe("startApplication", () => {
  it("devolve URLs assinadas com caminhos fixos para currículo e vídeo", async () => {
    const r = await startApplication({ data, resume, video, turnstileToken: "t" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.uploads.map((u) => u.path)).toEqual([
      `${state.processId}/${r.applicationId}/curriculo.pdf`,
      `${state.processId}/${r.applicationId}/video.mp4`,
    ]);
  });

  it("recusa dados inválidos antes de tocar no banco", async () => {
    const r = await startApplication({ data: { ...data, state: "XX" }, resume, video, turnstileToken: "t" });
    expect(r).toEqual({ ok: false, message: "Revise os campos do formulário." });
    expect(turnstile).not.toHaveBeenCalled();
  });

  it("recusa currículo que não é PDF ou é grande demais", async () => {
    expect(
      (await startApplication({ data, resume: { ...resume, name: "cv.exe" }, video, turnstileToken: "t" })).ok,
    ).toBe(false);
    expect(
      (await startApplication({ data, resume: { ...resume, size: 11 * 1024 * 1024 }, video, turnstileToken: "t" })).ok,
    ).toBe(false);
  });

  it("aplica o limite de envios por IP", async () => {
    state.rateAllowed = false;
    const r = await startApplication({ data, resume, video, turnstileToken: "t" });
    expect(r.ok).toBe(false);
    expect(turnstile).not.toHaveBeenCalled();
  });

  it("exige o captcha válido", async () => {
    turnstile.mockResolvedValue(false);
    expect((await startApplication({ data, resume, video, turnstileToken: "t" })).ok).toBe(false);
  });

  it("recusa quando não há processo aberto", async () => {
    state.processId = null;
    const r = await startApplication({ data, resume, video, turnstileToken: "t" });
    expect(r).toEqual({ ok: false, message: "As inscrições não estão abertas no momento." });
  });
});

describe("finishApplication", () => {
  const appId = "22222222-2222-4222-8222-222222222222";
  const cvPath = () => `${state.processId}/${appId}/curriculo.pdf`;
  const vPath = () => `${state.processId}/${appId}/video.mp4`;

  it("grava a inscrição com consentimento e manda o e-mail", async () => {
    state.fileHeads = { [cvPath()]: "%PDF-1.7 ...", [vPath()]: "\0\0\0\x20ftypisom...." };
    const r = await finishApplication({ applicationId: appId, data, videoMime: "video/mp4" });
    expect(r).toEqual({ ok: true });
    const row = state.inserted[0];
    expect(row).toMatchObject({
      id: appId,
      email: "maria.teste@example.com",
      phone: "62999990000",
      semester: 5,
      resume_path: cvPath(),
      video_path: vPath(),
      video_url: null,
    });
    expect(row.consent_version).toBeTruthy();
    expect(row.consent_at).toBeTruthy();
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it("apaga os arquivos e recusa um 'PDF' que não é PDF", async () => {
    state.fileHeads = { [cvPath()]: "MZ\x90\0 executável", [vPath()]: "\0\0\0\x20ftypisom...." };
    const r = await finishApplication({ applicationId: appId, data, videoMime: "video/mp4" });
    expect(r.ok).toBe(false);
    expect(state.inserted).toHaveLength(0);
    expect(state.removed[0]).toEqual([cvPath(), vPath()]);
  });

  it("recusa quando os arquivos não foram enviados", async () => {
    const r = await finishApplication({ applicationId: appId, data, videoMime: "video/mp4" });
    expect(r.ok).toBe(false);
    expect(state.inserted).toHaveLength(0);
  });

  it("e-mail repetido no mesmo processo vira mensagem clara e apaga os arquivos", async () => {
    state.fileHeads = { [cvPath()]: "%PDF-1.7 ...", [vPath()]: "\0\0\0\x20ftypisom...." };
    state.insertError = { code: "23505" };
    const r = await finishApplication({ applicationId: appId, data, videoMime: "video/mp4" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.message).toContain("Já recebemos uma inscrição");
    expect(state.removed).toHaveLength(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("recusa id que não é UUID", async () => {
    expect((await finishApplication({ applicationId: "../outro", data, videoMime: null })).ok).toBe(false);
  });
});
