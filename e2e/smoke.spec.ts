import { test, expect } from "@playwright/test";

test("root renders MicroNest homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "MicroNest MicroTools" })).toBeVisible();
  await expect(page.getByText("Browse by Profession")).toBeVisible();
});

test("tool page renders NoticeFlow", async ({ page }) => {
  await page.goto("/tools/noticeflow");
  await expect(page.getByRole("heading", { name: "NoticeFlow" })).toBeVisible();
});

test("profession page renders Chartered Accountants", async ({ page }) => {
  await page.goto("/profession/chartered-accountants");
  await expect(page.getByRole("heading", { name: "Chartered Accountants", exact: true })).toBeVisible();
});

test("unknown profession shows not-found", async ({ page }) => {
  await page.goto("/profession/nonexistent-profession");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("unknown tool shows not-found", async ({ page }) => {
  await page.goto("/tools/nonexistent-tool");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
