import { z } from "zod";

// Revisão do MVP, item 9: aceitar formatos comuns de telefone brasileiro.
// Aceita (62) 99999-9999, (62) 9 9999-9999, +55 62 99999-9999, 62999999999 etc.

/** Remove tudo que não é dígito e o 55 do Brasil. Retorna DDD + número (10 ou 11 dígitos). */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length > 11) digits = digits.replace(/^0+/, "");
  if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
  return digits;
}

export function isValidBrazilianPhone(input: string): boolean {
  const digits = normalizePhone(input);
  // DDD de 11 a 99; celular com 9 na frente (11 dígitos) ou fixo de 8 dígitos (10 no total).
  return /^[1-9][1-9](9\d{8}|[2-8]\d{7})$/.test(digits);
}

export const phoneSchema = z
  .string()
  .trim()
  .refine(isValidBrazilianPhone, { message: "Informe um telefone válido com DDD." })
  .transform(normalizePhone);
