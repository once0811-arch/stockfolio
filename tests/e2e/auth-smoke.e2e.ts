import { expect, test } from "@playwright/test";

test("redirects unauthenticated user from dashboard to login", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
});
