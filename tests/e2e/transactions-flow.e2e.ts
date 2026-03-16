import { expect, test } from "@playwright/test";

test("adds a trade and shows aggregated position", async ({ page }) => {
  const symbol = `TST${Date.now().toString().slice(-6)}`;

  await page.goto("/dashboard");
  await page.getByRole("link", { name: "거래 관리" }).click();
  await expect(page).toHaveURL(/\/transactions/);

  const previousCount = Number(await page.getByTestId("trade-count").innerText());

  await page.getByLabel("Symbol").fill(symbol);
  await page.getByLabel("Side").selectOption("BUY");
  await page.getByLabel("Quantity").fill("10");
  await page.getByLabel("Price").fill("100");
  await page.getByLabel("Fee").fill("1");
  await page.getByRole("button", { name: "거래 추가" }).click();

  await expect(page.getByTestId("trade-count")).toHaveText(
    String(previousCount + 1),
  );
  await expect(page.getByTestId(`position-row-${symbol}`)).toContainText("10");
});
