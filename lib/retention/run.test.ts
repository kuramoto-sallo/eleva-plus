// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const state = {
  purged: [] as { resume_path: string | null; video_path: string | null }[],
  orphans: [] as string[],
  removed: [] as string[][],
  removeError: false,
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    rpc: async (fn: string) =>
      fn === "purge_expired_applications" ? { data: state.purged, error: null } : { data: state.orphans, error: null },
    storage: {
      from: () => ({
        remove: async (paths: string[]) => {
          state.removed.push(paths);
          return { data: [], error: state.removeError ? { name: "StorageError" } : null };
        },
      }),
    },
  }),
}));

const { runRetention } = await import("./run");

beforeEach(() => {
  state.purged = [];
  state.orphans = [];
  state.removed = [];
  state.removeError = false;
});

describe("runRetention", () => {
  it("remove currículo e vídeo das inscrições apagadas e os órfãos", async () => {
    state.purged = [
      { resume_path: "p/a/curriculo.pdf", video_path: "p/a/video.mp4" },
      { resume_path: "p/b/curriculo.pdf", video_path: null },
    ];
    state.orphans = ["p/c/curriculo.pdf"];
    const r = await runRetention();
    expect(r).toEqual({ applications: 2, files: 3, orphans: 1, failedRemovals: 0 });
    expect(state.removed).toEqual([["p/a/curriculo.pdf", "p/a/video.mp4", "p/b/curriculo.pdf"], ["p/c/curriculo.pdf"]]);
  });

  it("remove em lotes de 100", async () => {
    state.orphans = Array.from({ length: 250 }, (_, i) => `p/${i}/curriculo.pdf`);
    await runRetention();
    expect(state.removed.map((b) => b.length)).toEqual([100, 100, 50]);
  });

  it("não chama o Storage quando não há nada para apagar", async () => {
    expect(await runRetention()).toEqual({ applications: 0, files: 0, orphans: 0, failedRemovals: 0 });
    expect(state.removed).toEqual([]);
  });

  it("conta falhas de remoção sem parar a rotina", async () => {
    state.removeError = true;
    state.purged = [{ resume_path: "p/a/curriculo.pdf", video_path: null }];
    state.orphans = ["p/c/curriculo.pdf"];
    expect((await runRetention()).failedRemovals).toBe(2);
  });
});
