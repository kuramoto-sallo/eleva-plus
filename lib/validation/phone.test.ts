import { describe, expect, it } from "vitest";
import { isValidBrazilianPhone, normalizePhone, phoneSchema } from "./phone";

describe("telefone", () => {
  it.each([
    "(62) 99999-9999",
    "(62) 9 9999-9999",
    "+55 62 99999-9999",
    "62999999999",
    "(62) 3240-1700",
    "055 62 99999-9999",
  ])("aceita %j", (value) => {
    expect(isValidBrazilianPhone(value)).toBe(true);
  });

  it.each(["", "9999-9999", "(01) 99999-9999", "(62) 89999-9999", "abc", "62 99999 99999 9"])("recusa %j", (value) => {
    expect(isValidBrazilianPhone(value)).toBe(false);
  });

  it("normaliza para DDD + número", () => {
    expect(normalizePhone("+55 (62) 9 9999-9999")).toBe("62999999999");
    expect(phoneSchema.parse(" (62) 3240-1700 ")).toBe("6232401700");
  });
});
