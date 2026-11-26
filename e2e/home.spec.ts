import { expect, test } from "@playwright/test";

test("página inicial carrega com o título do programa", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ELEVE\+/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ELEVE+");
});

test("cabeçalhos de segurança estão presentes", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("sem rolagem lateral no celular", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
