// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: vi.fn(), delete: vi.fn() }) }));
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT ${url}`);
});
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }));

const staff = { current: null as null | { userId: string; role: "admin" | "rh"; fullName: string } };
vi.mock("@/lib/auth/staff", () => ({
  authorize: async (roles: string[] = ["admin", "rh"]) =>
    staff.current && roles.includes(staff.current.role) ? staff.current : null,
}));
const audit = vi.fn(async () => {});
vi.mock("@/lib/audit", () => ({ audit: (...a: unknown[]) => audit(...(a as [])) }));
const sendEmail = vi.fn(async () => true);
vi.mock("@/lib/email/send", () => ({ sendEmail: (...a: unknown[]) => sendEmail(...(a as [])) }));

// Ordem das operações, para conferir "apaga a linha e só depois os arquivos".
const calls: string[] = [];
const db = {
  updated: null as null | { full_name: string; email: string },
  updateError: null as null | { code: string },
  deleted: null as null | { resume_path: string; video_path: string | null; status: string },
};

function chain(kind: "user" | "admin") {
  let op = "";
  const c = {
    update: (v: unknown) => {
      op = "update";
      calls.push(`${kind}.update ${JSON.stringify(v)}`);
      return c;
    },
    delete: () => {
      op = "delete";
      calls.push(`${kind}.delete`);
      return c;
    },
    eq: () => c,
    select: () => c,
    maybeSingle: async () => {
      if (op === "update") return { data: db.updateError ? null : db.updated, error: db.updateError };
      if (op === "delete") return { data: db.deleted, error: null };
      return { data: null, error: null };
    },
  };
  return c;
}

vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: () => chain("user") }) }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => chain("admin"),
    storage: {
      from: () => ({
        remove: async (paths: string[]) => {
          calls.push(`storage.remove ${paths.join(",")}`);
          return { data: [], error: null };
        },
      }),
    },
  }),
}));

const { changeStatus, deleteApplication, saveScore } = await import("./inscricoes-rh");

const ID = "6f1c2a6e-4a7b-4d2e-9a51-0f4b2b9f1c11";
const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const empty = { ok: false, message: null };

beforeEach(() => {
  calls.length = 0;
  staff.current = { userId: "u-rh", role: "rh", fullName: "RH Teste" };
  db.updated = { full_name: "Ana Fictícia", email: "ana@teste.local" };
  db.updateError = null;
  db.deleted = { resume_path: "p/a/curriculo.pdf", video_path: "p/a/video.mp4", status: "recebida" };
  audit.mockClear();
  sendEmail.mockClear();
  redirect.mockClear();
});

describe("changeStatus", () => {
  it("recusa quem não é da equipe", async () => {
    staff.current = null;
    const r = await changeStatus(empty, form({ id: ID, from: "recebida", to: "testes_online" }));
    expect(r.ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("recusa transição fora da tabela sem tocar no banco", async () => {
    const r = await changeStatus(empty, form({ id: ID, from: "recebida", to: "aprovada" }));
    expect(r.message).toMatch(/não é permitida/);
    expect(calls).toEqual([]);
  });

  it("muda o status, avisa o candidato e registra na auditoria", async () => {
    const r = await changeStatus(empty, form({ id: ID, from: "recebida", to: "testes_online" }));
    expect(r.ok).toBe(true);
    expect(calls).toEqual(['user.update {"status":"testes_online"}']);
    expect(sendEmail).toHaveBeenCalledOnce();
    expect(audit).toHaveBeenCalledWith("u-rh", "application.status_change", ID, {
      from: "recebida",
      to: "testes_online",
      email_sent: true,
    });
  });

  it("não manda e-mail duas vezes quando outra pessoa mudou antes", async () => {
    db.updated = null;
    const r = await changeStatus(empty, form({ id: ID, from: "recebida", to: "testes_online" }));
    expect(r.ok).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("não manda e-mail quando o candidato desistiu", async () => {
    await changeStatus(empty, form({ id: ID, from: "recebida", to: "desistiu" }));
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("saveScore", () => {
  it("aceita vírgula e arredonda para 2 casas", async () => {
    const r = await saveScore(empty, form({ id: ID, score: "87,456" }));
    expect(r.ok).toBe(true);
    expect(calls).toEqual(['user.update {"test_score":87.46}']);
  });

  it("recusa nota fora de 0 a 100", async () => {
    expect((await saveScore(empty, form({ id: ID, score: "101" }))).ok).toBe(false);
    expect((await saveScore(empty, form({ id: ID, score: "abc" }))).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("nota vazia limpa o campo", async () => {
    await saveScore(empty, form({ id: ID, score: "" }));
    expect(calls).toEqual(['user.update {"test_score":null}']);
  });
});

describe("deleteApplication", () => {
  it("RH não exclui", async () => {
    const r = await deleteApplication(empty, form({ id: ID, confirm: "EXCLUIR" }));
    expect(r.ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("exige a confirmação digitada", async () => {
    staff.current = { userId: "u-admin", role: "admin", fullName: "Admin" };
    const r = await deleteApplication(empty, form({ id: ID, confirm: "sim" }));
    expect(r.ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("admin exclui a linha e só depois os arquivos, e registra na auditoria", async () => {
    staff.current = { userId: "u-admin", role: "admin", fullName: "Admin" };
    await expect(deleteApplication(empty, form({ id: ID, confirm: "excluir" }))).rejects.toThrow(
      "REDIRECT /admin?excluida=1",
    );
    expect(calls).toEqual(["admin.delete", "storage.remove p/a/curriculo.pdf,p/a/video.mp4"]);
    expect(audit).toHaveBeenCalledWith("u-admin", "application.delete", ID, {
      status: "recebida",
      files: 2,
      files_removed: true,
    });
  });

  it("não remove arquivo quando a inscrição já não existe", async () => {
    staff.current = { userId: "u-admin", role: "admin", fullName: "Admin" };
    db.deleted = null;
    const r = await deleteApplication(empty, form({ id: ID, confirm: "EXCLUIR" }));
    expect(r.ok).toBe(false);
    expect(calls).toEqual(["admin.delete"]);
  });
});
