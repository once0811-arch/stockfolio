import { expect, test } from "@playwright/test";

test("allows direct dashboard access in local no-auth mode", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "주요 화면" }).getByRole("link"),
  ).toHaveCount(3);
  await expect(
    page.getByText("금융 정보 제공 목적이며 투자 자문이 아닙니다."),
  ).toBeVisible();
});
