import { expect, test } from "@playwright/test";

// Sem sessão: nada da área do RH abre. Os fluxos logados dependem do Supabase e são
// conferidos no preview com contas de teste fictícias.

test("lista de inscrições manda para o login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByLabel("Senha")).toBeVisible();
  // Sem cadastro público
  await expect(page.getByText(/criar conta/i)).toHaveCount(0);
});

test("equipe e detalhe também exigem login", async ({ page }) => {
  await page.goto("/admin/processos");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/equipe");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/inscricoes/6f1c2a6e-4a7b-4d2e-9a51-0f4b2b9f1c11");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("exportação e arquivos recusam quem não está logado", async ({ request }) => {
  const csv = await request.get("/admin/exportar");
  expect(csv.status()).toBe(403);
  const file = await request.get("/admin/inscricoes/6f1c2a6e-4a7b-4d2e-9a51-0f4b2b9f1c11/arquivo/curriculo", {
    maxRedirects: 0,
  });
  expect(file.status()).toBe(403);
});

test("link de convite inválido volta para o login com aviso", async ({ page }) => {
  await page.goto("/auth/confirm?type=invite");
  await expect(page).toHaveURL(/\/admin\/login\?erro=link$/);
  await expect(page.locator("form").getByRole("alert")).toContainText("O link expirou");
});

test("área do RH não é indexada", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("cron de retenção recusa chamada sem o segredo", async ({ request }) => {
  expect((await request.get("/api/cron/retencao")).status()).toBe(401);
});
