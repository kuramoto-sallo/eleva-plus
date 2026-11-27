// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
const runRetention = vi.fn(async () => ({ applications: 1, files: 2, orphans: 0, failedRemovals: 0 }));
vi.mock("@/lib/retention/run", () => ({ runRetention: () => runRetention() }));

const { GET } = await import("./route");
const req = (auth?: string) =>
  new NextRequest("http://localhost/api/cron/retencao", { headers: auth ? { authorization: auth } : {} });

beforeEach(() => {
  runRetention.mockClear();
  vi.stubEnv("CRON_SECRET", "segredo-de-teste-123");
});

describe("cron de retenção", () => {
  it("recusa sem o segredo", async () => {
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req("Bearer errado"))).status).toBe(401);
    expect(runRetention).not.toHaveBeenCalled();
  });

  it("não roda se CRON_SECRET não estiver configurado", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await GET(req("Bearer "))).status).toBe(401);
    expect(runRetention).not.toHaveBeenCalled();
  });

  it("roda com o segredo certo e devolve só contagens", async () => {
    const res = await GET(req("Bearer segredo-de-teste-123"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, applications: 1, files: 2, orphans: 0, failedRemovals: 0 });
  });
});
