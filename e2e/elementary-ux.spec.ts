import { expect, test } from "playwright/test";

test("초등학생 첫 화면은 시작 버튼을 보이고 다음 문장의 선택 위치를 알려 준다", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");

  const start = page.getByRole("button", { name: "연습 시작" });
  const startBox = await start.boundingBox();
  expect(startBox).not.toBeNull();
  expect(startBox!.y + startBox!.height).toBeLessThanOrEqual(800);
  await start.click();

  await expect(page.locator(".task-hint")).toContainText("다음 문장에서 달라진 말을 골라요.");
  await expect(page.locator(".task-hint")).toContainText("모둠별로");
  await expect(page.locator(".message-card.selection-target")).toHaveCount(1);
  await expect(page.locator(".message-card.selection-target .phrase.gi-pulse")).toHaveCount(1);
});

test("안전하지 않은 전달문과 안전한 전달문을 함께 고르면 마칠 수 없다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "연습 시작" }).click();
  await page.getByRole("button", { name: "연습 활동 건너뛰기" }).click();
  await page.getByRole("button", { name: "비 오는 날 모임 장소" }).click();
  await page.getByRole("button", { name: "바로 다음 문장 비교하기" }).click();

  await page.getByRole("button", { name: "모둠 안내판 앞에 모여요.", exact: true }).click();
  await page.getByLabel("도움 정보 · 모둠 안내판 앞").check();
  await page.getByRole("button", { name: "내 답 확인" }).click();
  await page.getByRole("button", { name: "다음 비교" }).click();
  await page.getByRole("button", { name: "비가 오면 체육관에서 만나요.", exact: true }).click();
  await page.getByLabel("조건(어떤 때인지) · 비가 오면 체육관").check();
  await page.getByRole("button", { name: "내 답 확인" }).click();
  await page.getByRole("button", { name: "처음부터 끝까지 보기" }).click();
  await page.getByRole("button", { name: "뜻을 지킨 문장 고르기" }).click();

  const unsafe = page.getByRole("button", { name: "금요일 2시에 운동장에 모여요." });
  const safe = page.getByRole("button", { name: "금요일 2시에 운동장 모둠 안내판 앞에서 모여요. 비가 오면 체육관으로 가요." });
  await unsafe.click();
  await safe.click();
  await expect(page.getByText("선택한 문장 중 하나에 중요한 뜻이 빠졌어요.")).toBeVisible();
  await expect(page.getByRole("button", { name: "활동 마치기" })).toBeDisabled();

  await unsafe.click();
  await expect(page.getByRole("button", { name: "활동 마치기" })).toBeEnabled();
});
