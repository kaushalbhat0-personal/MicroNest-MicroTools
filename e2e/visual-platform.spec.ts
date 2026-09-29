import { test, expect } from "@playwright/test";

const viewports = [
  { w: 375, h: 800 },
  { w: 768, h: 800 },
  { w: 1280, h: 800 },
];

for (const vp of viewports) {
  test(`visual ${vp.w} — homepage responsive no overflow`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /small tools/i })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await page.screenshot({ path: `test-results/visual-${vp.w}-home.png`, fullPage: true });
  });

  test(`visual ${vp.w} — login responsive`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await page.screenshot({ path: `test-results/visual-${vp.w}-login.png`, fullPage: true });
  });

  test(`visual ${vp.w} — app redirects to login (unauth) no overflow`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
}

test("sitemap and public routes still correct after P2", async ({ page }) => {
  const res = await page.request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  const body = await res.text();
  expect(body).toContain("/tools/noticeflow");
  expect(body).toContain("/tools/mattervault");
  expect(body).not.toContain("/app/billing");
});
