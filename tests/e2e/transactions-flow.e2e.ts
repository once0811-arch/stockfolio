import { expect, test } from "@playwright/test";

test("covers quick trade, symbol memo, memo fact-check, and overview matrix", async ({
  page,
}) => {
  const symbol = `TST${Date.now().toString().slice(-6)}`;

  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Ledger", exact: true }).click();
  await expect(page).toHaveURL(/\/transactions/);

  const previousCount = Number(await page.getByTestId("trade-count").innerText());

  await page.getByLabel("종목 코드").fill(symbol);
  await page.getByLabel("매수/매도").selectOption("BUY");
  await page.getByLabel("수량").fill("10");
  await page.getByLabel("단가").fill("100");
  await page.getByLabel("체결일").fill("2026-03-16");
  await page.getByRole("button", { name: "Quick 거래 추가" }).click();

  await expect
    .poll(async () => Number(await page.getByTestId("trade-count").innerText()))
    .toBeGreaterThan(previousCount);
  await expect(page.getByTestId(`position-row-${symbol}`)).toContainText("10");

  await page.getByTestId(`trade-row-${symbol}`).click();
  await page.getByLabel("종목 메모").fill("밸류에이션 조정으로 하방이 제한적이다.");
  await page.getByRole("button", { name: "메모 저장" }).click();
  await expect
    .poll(
      async () => page.getByTestId(`memo-status-${symbol}`).innerText(),
      { timeout: 10000 },
    )
    .toContain("ATTACHED");

  await page.getByRole("link", { name: "Research", exact: true }).click();
  await expect(page).toHaveURL(/\/research/);
  await page.getByRole("button", { name: symbol }).click();
  await page.getByRole("button", { name: "선택 메모 팩트체크" }).click();
  await expect
    .poll(async () => {
      const text = await page.getByTestId("factcheck-citation-status").innerText();
      const match = text.match(/citation\s+(\d+)/i);
      return match ? Number(match[1]) : 0;
    })
    .toBeGreaterThan(0);

  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByTestId("overview-triple-realized")).toContainText("실현손익");

  await page.goto("/forecast");
  await expect(page).toHaveURL(/\/forecast/);
  await expect(
    page.getByRole("heading", { name: "Forecast", exact: true }),
  ).toBeVisible();
});
