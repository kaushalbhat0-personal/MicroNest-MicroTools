import { test, expect } from "@playwright/test";

test("root renders NoticeFlow placeholder", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "NoticeFlow" })).toBeVisible();
  await expect(page.getByText("Notice workflow management for CA firms")).toBeVisible();
});
