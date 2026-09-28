import { test, expect } from "@playwright/test";

test("unauthenticated /app redirects to /login", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
});

test("login and signup pages render", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: /Create account/i })).toBeVisible();
});

test("onboarding requires auth", async ({ page }) => {
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/login/);
});
