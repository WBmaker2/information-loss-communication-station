import { expect, test } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("3~4학년 항로에서 첫 빠짐을 찾고 키보드와 모바일 접근성을 확인한다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "통신 임무 시작" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "안내 활동 건너뛰기" }).click();
  await page.getByRole("button", { name: /비 오는 날 모임 장소/ }).click();
  await page.getByRole("button", { name: "인접 전달문 비교하기" }).click();
  await page.getByRole("button", { name: "모둠 안내판 앞에 모여요." }).click();
  await page.getByLabel("빠짐").check();
  await page.getByLabel("도움 정보 · 모둠 안내판 앞").check();
  await page.getByRole("button", { name: "판정 확인" }).click();
  await expect(page.getByText("이 전이에서 1/1개를 찾았어요.")).toBeVisible();
  await expect(page.getByRole("button", { name: "다음 비교" })).toBeEnabled();

  const violations = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(violations.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? ""))).toEqual([]);

  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }))).toEqual({ local: 0, session: 0, cookies: "" });
});
