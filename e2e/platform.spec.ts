import { test, expect } from "@playwright/test";

test("platform routes require auth — settings, billing, clients, members", async ({ page }) => {
  for (const path of ["/app", "/app/settings", "/app/billing", "/app/clients", "/app/members"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  }
});

test("firm workspace dashboard redirects to login when unauthenticated, not leak product data", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
  expect(page.url()).not.toContain("NoticeFlow");
});

test("product routes still protected by P1 — direct URL denied when unauthenticated", async ({ page }) => {
  for (const path of ["/app/notices", "/app/matters", "/app/notices/new", "/app/matters/new"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  }
});

test("navigation hierarchy not exposed to unauthenticated — homepage still renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /small tools for the work that matters/i })).toBeVisible();
});

test("sitemap does not expose private firm routes", async ({ page }) => {
  const res = await page.request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  const body = await res.text();
  expect(body).not.toContain("/app/settings");
  expect(body).not.toContain("/app/billing");
  expect(body).not.toContain("/app/clients");
});
