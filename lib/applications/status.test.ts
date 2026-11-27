import { describe, expect, it } from "vitest";
import { canTransition, isStatus, NEXT_STATUSES, STATUSES } from "./status";

describe("status do processo", () => {
  it("segue a tabela de transições do banco", () => {
    expect(canTransition("recebida", "testes_online")).toBe(true);
    expect(canTransition("recebida", "aprovada")).toBe(false);
    expect(canTransition("entrevista_final", "lista_de_espera")).toBe(true);
    expect(canTransition("lista_de_espera", "aprovada")).toBe(true);
    expect(canTransition("aprovada", "nao_selecionada")).toBe(false);
  });

  it("status finais não têm próximo passo", () => {
    for (const s of ["contratada", "nao_selecionada", "desistiu"] as const) expect(NEXT_STATUSES[s]).toEqual([]);
  });

  it("só aceita valores do enum", () => {
    expect(STATUSES.every(isStatus)).toBe(true);
    expect(isStatus("admin")).toBe(false);
    expect(isStatus(undefined)).toBe(false);
  });
});
