import { describe, expect, it } from "vitest";
import { filtersToQuery, parseFilters, sanitizeSearch } from "./filters";

describe("parseFilters", () => {
  it("lê filtros válidos", () => {
    const f = parseFilters(
      {
        processo: "6f1c2a6e-4a7b-4d2e-9a51-0f4b2b9f1c11",
        status: "painel",
        area: "gestao",
        pagina: "3",
      },
      "maria",
    );
    expect(f).toEqual({
      processId: "6f1c2a6e-4a7b-4d2e-9a51-0f4b2b9f1c11",
      status: "painel",
      area: "gestao",
      search: "maria",
      page: 3,
    });
  });

  it("não lê busca da URL", () => {
    expect(parseFilters({ q: "maria" }).search).toBeUndefined();
  });

  it("ignora valores inválidos em vez de quebrar a página", () => {
    expect(parseFilters({ processo: "1 or 1=1", status: "admin", area: "x", pagina: "-2" })).toEqual({
      processId: undefined,
      status: undefined,
      area: undefined,
      search: undefined,
      page: 1,
    });
  });

  it("usa o primeiro valor quando o parâmetro se repete", () => {
    expect(parseFilters({ status: ["painel", "recebida"] }).status).toBe("painel");
  });
});

describe("sanitizeSearch", () => {
  it("tira a sintaxe de filtro do PostgREST", () => {
    expect(sanitizeSearch("a,full_name.eq.x)")).toBe("a full_name.eq.x");
    expect(sanitizeSearch("%*\\:\"'()")).toBeUndefined();
  });

  it("mantém acentos, e-mail e hífen", () => {
    expect(sanitizeSearch("  João  da-Silva ")).toBe("João da-Silva");
    expect(sanitizeSearch("joao@teste.local")).toBe("joao@teste.local");
  });
});

describe("filtersToQuery", () => {
  it("monta a query só com o que foi preenchido e nunca com a busca", () => {
    expect(filtersToQuery({ status: "painel", page: 1, search: "maria" })).toBe("?status=painel");
    expect(filtersToQuery({})).toBe("");
  });
});
