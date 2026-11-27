// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));
const staff = { current: null as null | { userId: string; role: "admin" | "rh"; fullName: string } };
vi.mock("@/lib/auth/staff", () => ({
  authorize: async (roles: string[]) => (staff.current && roles.includes(staff.current.role) ? staff.current : null),
}));
vi.mock("@/lib/audit", () => ({ audit: vi.fn(async () => {}) }));

const updates: unknown[] = [];
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => {
      const c = {
        update: (v: unknown) => {
          updates.push(v);
          return c;
        },
        eq: () => c,
        select: () => c,
        maybeSingle: async () => ({ data: { id: "x" }, error: null }),
      };
      return c;
    },
  }),
}));

const { updateProcess } = await import("./processos");
const ID = "6f1c2a6e-4a7b-4d2e-9a51-0f4b2b9f1c11";
const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries({ id: ID, ...o })) f.set(k, v);
  return f;
};
const empty = { ok: false, message: null };
const dates = { opensAt: "2026-11-30T00:00", closesAt: "2026-12-28T23:59" };

beforeEach(() => {
  updates.length = 0;
  staff.current = { userId: "u", role: "admin", fullName: "Admin" };
});

describe("updateProcess", () => {
  it("só admin edita", async () => {
    staff.current = { userId: "u", role: "rh", fullName: "RH" };
    expect((await updateProcess(empty, form({ ...dates, endsAt: "" }))).ok).toBe(false);
    expect(updates).toEqual([]);
  });

  it("grava em UTC a partir do horário de Brasília", async () => {
    expect((await updateProcess(empty, form({ ...dates, endsAt: "2027-02-15T18:00" }))).ok).toBe(true);
    expect(updates).toEqual([
      {
        opens_at: "2026-11-30T03:00:00.000Z",
        closes_at: "2026-12-29T02:59:00.000Z",
        ends_at: "2027-02-15T21:00:00.000Z",
      },
    ]);
  });

  it("fim vazio fica sem data", async () => {
    await updateProcess(empty, form({ ...dates, endsAt: "" }));
    expect(updates).toEqual([expect.objectContaining({ ends_at: null })]);
  });

  it("recusa datas fora de ordem ou inválidas", async () => {
    expect(
      (await updateProcess(empty, form({ opensAt: "2026-12-28T00:00", closesAt: "2026-11-30T00:00", endsAt: "" }))).ok,
    ).toBe(false);
    expect((await updateProcess(empty, form({ ...dates, endsAt: "2026-12-01T00:00" }))).ok).toBe(false);
    expect((await updateProcess(empty, form({ ...dates, endsAt: "amanhã" }))).ok).toBe(false);
    expect(updates).toEqual([]);
  });
});
