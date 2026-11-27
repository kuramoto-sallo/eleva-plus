import { expect, test } from "@playwright/test";

// Dados fictícios (CLAUDE.md, LGPD).

test("as 5 seções aparecem na ordem decidida", async ({ page }) => {
  await page.goto("/");
  const titles = await page.locator("main section h2").allTextContents();
  expect(titles.slice(0, 5)).toEqual([
    "Uma história de evolução que começou num quintal",
    "Seu futuro começa aqui",
    "O que você precisa para decolar?",
    "O que você ganha com o ELEVE+",
    "Seu caminho até o ELEVE+",
  ]);
});

test("etapa 1 mostra os erros com aria-invalid e resumo", async ({ page }) => {
  await page.goto("/#inscricao");
  await page.getByRole("button", { name: "Continuar" }).click();
  const alert = page.locator("form").getByRole("alert");
  await expect(alert).toContainText("Nome completo");
  await expect(page.getByLabel("Nome completo")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Etapa 1 de 4")).toBeVisible();
});

test("percorre as 4 etapas e bloqueia formatura antes de dez/2027", async ({ page }) => {
  await page.goto("/#inscricao");
  await page.getByLabel("Nome completo").fill("Maria Teste da Silva");
  await page.getByLabel("E-mail").fill("maria.teste@example.com");
  await page.getByLabel("Telefone/WhatsApp com DDD").fill("(62) 9 9999-0000");
  await page.getByLabel("Cidade").fill("Goiânia");
  await page.getByLabel("Estado (UF)").selectOption("GO");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByRole("heading", { name: "Formação" })).toBeFocused();
  await page.getByLabel("Instituição de ensino").fill("Universidade Exemplo");
  await page.getByLabel("Curso").fill("Administração");
  await page.getByLabel("Semestre/período atual").selectOption("5");
  await page.getByLabel("Mês").selectOption("6");
  await page.getByLabel("Ano").selectOption("2027");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("dezembro de 2027");

  await page.getByLabel("Mês").selectOption("12");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByRole("heading", { name: "Interesses e currículo" })).toBeFocused();
  await page.getByLabel(/Operações/).check();
  await page.getByLabel("Manhã").check();
  await page.getByLabel("Currículo em PDF").setInputFiles({
    name: "curriculo.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 teste"),
  });
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByRole("heading", { name: "Vídeo e envio" })).toBeFocused();
  await page.getByLabel("Link do YouTube").check();
  await page.getByLabel("Link do vídeo no YouTube").fill("https://youtu.be/teste");
  await page.getByLabel(/16 anos ou mais/).check();
  await page.getByLabel(/Li e aceito/).check();
  // O envio real depende do Supabase e do Turnstile; aqui só conferimos que a última etapa está pronta.
  await expect(page.getByRole("button", { name: "Enviar minha inscrição" })).toBeEnabled();
});
