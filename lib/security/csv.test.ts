import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./csv";

describe("csvCell", () => {
  it.each(['=HIPERLINK("x")', "+1+1", "-2+3", "@SUM(A1)", "\tfoo", "\rbar"])("neutraliza fórmula %j", (value) => {
    expect(csvCell(value).startsWith(`"'`)).toBe(true);
  });

  it("escapa aspas duplas", () => {
    expect(csvCell('Ana "Aninha"')).toBe('"Ana ""Aninha"""');
  });

  it("mantém ponto e vírgula dentro das aspas", () => {
    expect(csvCell("a;b")).toBe('"a;b"');
  });

  it("trata nulos como célula vazia", () => {
    expect(csvCell(null)).toBe('""');
    expect(csvCell(undefined)).toBe('""');
  });
});

describe("toCsv", () => {
  it("gera BOM, separador ; e CRLF", () => {
    const csv = toCsv(["nome", "email"], [["=cmd", "a@b.com"]]);
    expect(csv).toBe('﻿"nome";"email"\r\n"\'=cmd";"a@b.com"\r\n');
  });
});
