import { expect, test } from "@playwright/test";

test("adds a trade and shows aggregated position", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("demo@local.dev");
  await page.getByLabel("Password").fill("demo-password");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole("link", { name: "거래 관리" }).click();
  await expect(page).toHaveURL(/\/transactions/);

  await page.getByLabel("Symbol").fill("AAPL");
  await page.getByLabel("Side").selectOption("BUY");
  await page.getByLabel("Quantity").fill("10");
  await page.getByLabel("Price").fill("100");
  await page.getByLabel("Fee").fill("1");
  await page.getByRole("button", { name: "거래 추가" }).click();

  await expect(page.getByTestId("trade-count")).toHaveText("1");
  await expect(page.getByTestId("position-row-AAPL")).toContainText("10");
});
