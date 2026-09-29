import { test, expect } from "@playwright/test";

test("root renders MicroNest homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /small tools for the work that matters/i })).toBeVisible();
  await expect(page.getByText("Browse by Profession")).toBeVisible();
});

test("homepage shows both professions and both tools", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Chartered Accountants", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lawyers", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "NoticeFlow" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "MatterVault" })).toBeVisible();
});

test("tool page renders NoticeFlow", async ({ page }) => {
  await page.goto("/tools/noticeflow");
  await expect(page.getByRole("heading", { name: "NoticeFlow" })).toBeVisible();
});

test("tool page renders MatterVault", async ({ page }) => {
  await page.goto("/tools/mattervault");
  await expect(page.getByRole("heading", { name: "MatterVault" })).toBeVisible();
  await expect(page.getByText("Lawyers", { exact: true }).first()).toBeVisible();
});

test("profession page renders Chartered Accountants", async ({ page }) => {
  await page.goto("/profession/chartered-accountants");
  await expect(page.getByRole("heading", { name: "Chartered Accountants", exact: true })).toBeVisible();
});

test("profession page renders Lawyers", async ({ page }) => {
  await page.goto("/profession/lawyers");
  await expect(page.getByRole("heading", { name: "Lawyers", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "MatterVault" })).toBeVisible();
});

test("unknown profession shows not-found", async ({ page }) => {
  await page.goto("/profession/nonexistent-profession");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("unknown tool shows not-found", async ({ page }) => {
  await page.goto("/tools/nonexistent-tool");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("sitemap contains all public routes", async ({ page }) => {
  const res = await page.request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  const body = await res.text();
  expect(body).toContain("/profession/chartered-accountants");
  expect(body).toContain("/profession/lawyers");
  expect(body).toContain("/tools/noticeflow");
  expect(body).toContain("/tools/mattervault");
});
