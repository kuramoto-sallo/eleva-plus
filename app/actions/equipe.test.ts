// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));

const staff = { current: null as null | { userId: string; role: "admin" | "rh"; fullName: string } };
vi.mock("@/lib/auth/staff", () => ({
  authorize: async (roles: string[] = ["admin", "rh"]) =>
    staff.current && roles.includes(staff.current.role) ? staff.current : null,
}));
vi.mock("@/lib/audit", () => ({ audit: vi.fn(async () => {}) }));

const calls: string[] = [];
const db = { insertError: null as null | { code: string }, target: { role: "rh" } as null | { role: string } };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    auth: {
      admin: {
        inviteUserByEmail: async (email: string) => {
          calls.push(`invite ${email}`);
          return { data: { user: { id: "novo-id" } }, error: null };
        },
        deleteUser: async (id: string) => {
          calls.push(`deleteUser ${id}`);
          return { error: null };
        },
      },
    },
    from: () => {
      const c = {
        insert: async (row: { role: string }) => {
          calls.push(`insert ${row.role}`);
          return { error: db.insertError };
        },
        select: () => c,
        eq: () => c,
        maybeSingle: async () => ({ data: db.target, error: null }),
      };
      return c;
    },
  }),
}));

const { inviteStaff, removeStaff } = await import("./equipe");

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const empty = { ok: false, message: null };
const OTHER = "6f1c2a6e-4a7b-4d2e-9a51-0f4b2b9f1c11";
const ADMIN = "0b8f4a8e-1c2d-4e5f-8a9b-1c2d3e4f5a6b";

beforeEach(() => {
  calls.length = 0;
  db.insertError = null;
  db.target = { role: "rh" };
  staff.current = { userId: ADMIN, role: "admin", fullName: "Admin" };
});

describe("inviteStaff", () => {
  const valid = { email: "Nova@Teste.Local", fullName: "Nova Pessoa", role: "rh" };

  it("só admin convida", async () => {
    staff.current = { userId: OTHER, role: "rh", fullName: "RH" };
    expect((await inviteStaff(empty, form(valid))).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("não aceita papel fora de admin/rh", async () => {
    expect((await inviteStaff(empty, form({ ...valid, role: "superadmin" }))).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("convida com e-mail em minúsculas e grava o papel", async () => {
    expect((await inviteStaff(empty, form(valid))).ok).toBe(true);
    expect(calls).toEqual(["invite nova@teste.local", "insert rh"]);
  });

  it("desfaz a conta se não conseguir gravar o papel", async () => {
    db.insertError = { code: "23505" };
    expect((await inviteStaff(empty, form(valid))).ok).toBe(false);
    expect(calls).toEqual(["invite nova@teste.local", "insert rh", "deleteUser novo-id"]);
  });
});

describe("removeStaff", () => {
  it("só admin remove", async () => {
    staff.current = { userId: OTHER, role: "rh", fullName: "RH" };
    expect((await removeStaff(empty, form({ userId: ADMIN }))).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("ninguém remove a si mesmo (sempre sobra um admin)", async () => {
    expect((await removeStaff(empty, form({ userId: ADMIN }))).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("remove a conta do membro", async () => {
    expect((await removeStaff(empty, form({ userId: OTHER }))).ok).toBe(true);
    expect(calls).toEqual([`deleteUser ${OTHER}`]);
  });
});
