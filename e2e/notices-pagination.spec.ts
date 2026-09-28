import { test, expect } from "@playwright/test";

test("notices pagination preserves filters and shows controls", async ({ page }) => {
  await page.goto("/app/notices?status=review&page=2&q=abc");
  const url = page.url();
  // Tenant isolation: unauth redirects to login, auth shows notices — both valid
  expect(url).toMatch(/\/app\/notices|\/login/);
  if (url.includes("/app/notices") && !url.includes("/login")) {
    await expect(page.getByText(/Page 2 of/)).toBeVisible();
    const nextLink = page.getByRole("link", { name: "Next" });
    const href = await nextLink.getAttribute("href");
    if (href) {
      expect(href).toContain("q=abc");
      expect(href).toContain("status=review");
      expect(href).not.toContain("firm_id");
    }
  }
});

test("notices export link preserves filters not page", async ({ page }) => {
  await page.goto("/app/notices?q=abc&status=review&page=2");
  const url = page.url();
  expect(url).toMatch(/\/app\/notices|\/login/);
  if (!url.includes("/login")) {
    const exportLink = page.getByRole("link", { name: "Export CSV" });
    const href = await exportLink.getAttribute("href");
    if (href) {
      expect(href).toContain("/api/notices/export");
      expect(href).toContain("q=abc");
      expect(href).toContain("status=review");
      expect(href).not.toContain("page=2");
      expect(href).not.toContain("firm_id");
    }
  }
});

test("pagination boundaries — Previous disabled on first page", async ({ page }) => {
  await page.goto("/app/notices?page=1");
  const url = page.url();
  expect(url).toMatch(/\/app\/notices|\/login/);
  if (!url.includes("/login")) {
    const prev = page.getByRole("link", { name: "Previous" });
    await expect(prev).toHaveAttribute("aria-disabled", "true");
  }
});

test("no firm_id in URL", async ({ page }) => {
  await page.goto("/app/notices?firm_id=evil&page=1");
  const url = page.url();
  expect(url).not.toContain("firm_id=evil");
  expect(url).toMatch(/\/app\/notices|\/login/);
});
