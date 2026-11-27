import { describe, expect, it } from "vitest";
import { fromLocalInput, toLocalInput } from "./process-dates";

describe("datas do processo em Brasília", () => {
  it("converte o campo para UTC e volta", () => {
    expect(fromLocalInput("2026-11-30T00:00")).toBe("2026-11-30T03:00:00.000Z");
    expect(toLocalInput("2026-11-30T03:00:00.000Z")).toBe("2026-11-30T00:00");
    expect(toLocalInput("2026-12-29T02:59:59+00:00")).toBe("2026-12-28T23:59");
  });

  it("recusa formato inválido", () => {
    expect(fromLocalInput("30/11/2026")).toBeNull();
    expect(fromLocalInput("2026-13-40T99:99")).toBeNull();
    expect(toLocalInput(null)).toBe("");
  });
});
