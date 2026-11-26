import { describe, expect, it } from "vitest";
import { confirmationEmail, phaseEmail } from "./templates";

describe("confirmationEmail", () => {
  it("escapa HTML do nome", () => {
    const e = confirmationEmail("<b>Maria</b>");
    expect(e.html).toContain("&lt;b&gt;Maria&lt;/b&gt;");
    expect(e.html).not.toContain("<b>Maria</b>");
    expect(e.text).toContain("<b>Maria</b>");
  });
});

describe("phaseEmail", () => {
  it("tem texto para cada fase que avisa o candidato", () => {
    for (const s of [
      "testes_online",
      "sallo_experience",
      "painel",
      "entrevista_final",
      "aprovada",
      "nao_selecionada",
    ]) {
      expect(phaseEmail(s, "Ana")?.subject).toMatch(/^ELEVE\+ \|/);
    }
  });

  it("não envia e-mail quando o candidato desistiu", () => {
    expect(phaseEmail("desistiu", "Ana")).toBeNull();
    expect(phaseEmail("recebida", "Ana")).toBeNull();
  });

  it("escapa HTML do nome", () => {
    expect(phaseEmail("painel", "<i>x</i>")?.html).not.toContain("<i>x</i>");
  });
});
