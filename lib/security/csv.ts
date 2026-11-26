// Exportação CSV segura contra injeção de fórmulas (CSV/formula injection).
// Revisão do MVP, item 2: um nome como =HIPERLINK(...) rodava no Excel do RH.

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

/** Neutraliza um valor para célula de CSV: prefixa fórmulas com ' e escapa aspas. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (FORMULA_PREFIX.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Monta um CSV com ; como separador (padrão do Excel em pt-BR) e BOM para acentos. */
export function toCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const lines = [headers, ...rows].map((row) => row.map(csvCell).join(";"));
  return `﻿${lines.join("\r\n")}\r\n`;
}
