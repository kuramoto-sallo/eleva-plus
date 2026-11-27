import { describe, expect, it } from "vitest";
import { newPasswordSchema, passwordSchema, safeAdminPath } from "./password";

describe("regra de senha", () => {
  it("exige 10 caracteres com minúscula, maiúscula e número", () => {
    expect(passwordSchema.safeParse("Curta1").success).toBe(false);
    expect(passwordSchema.safeParse("semmaiuscula123").success).toBe(false);
    expect(passwordSchema.safeParse("SEMMINUSCULA123").success).toBe(false);
    expect(passwordSchema.safeParse("SemNumeroAqui").success).toBe(false);
    expect(passwordSchema.safeParse("Senha-Forte-2026").success).toBe(true);
  });

  it("confere a confirmação", () => {
    const r = newPasswordSchema.safeParse({ password: "Senha-Forte-2026", confirm: "Outra-Senha-2026" });
    expect(r.success).toBe(false);
  });
});

describe("safeAdminPath", () => {
  it("aceita caminhos da área do RH", () => {
    expect(safeAdminPath("/admin/definir-senha")).toBe("/admin/definir-senha");
    expect(safeAdminPath("/admin?status=painel")).toBe("/admin?status=painel");
  });

  it("recusa destinos externos ou fora de /admin", () => {
    for (const bad of [
      null,
      "",
      "https://mal.example",
      "//mal.example",
      "/\\mal.example",
      "/",
      "/adminx/../x",
      "/adminx",
    ]) {
      expect(safeAdminPath(bad)).toBe("/admin");
    }
  });
});
