import { expect, test } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

type ChangeAnswer = {
  segment: string;
  evidence: string;
  type?: "빠짐" | "근거 없는 추가" | "뜻이 달라짐" | "뜻 유지";
};

async function startMission(page: import("playwright/test").Page, route: "3~4학년 기본 항로" | "5~6학년 확장 항로") {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveText("정보 손실 통신소");
  if (route === "5~6학년 확장 항로") await page.getByRole("button", { name: route }).click();
  await page.getByRole("button", { name: "통신 임무 시작" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "안내 활동 건너뛰기" }).focus();
  await page.keyboard.press("Space");
}

async function openCase(page: import("playwright/test").Page, title: string) {
  await page.getByRole("button", { name: title }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "인접 전달문 비교하기" }).focus();
  await page.keyboard.press("Enter");
}

async function answerChange(page: import("playwright/test").Page, answer: ChangeAnswer) {
  await page.getByRole("button", { name: answer.segment, exact: true }).click();
  if (answer.type && answer.type !== "빠짐") await page.getByLabel(answer.type).check();
  await page.getByLabel(answer.evidence, { exact: true }).check();
  await page.getByRole("button", { name: "판정 확인" }).click();
  await expect(page.getByText("잘 찾았어요. 선택한 뜻 조각이 이 변화의 근거가 돼요.")).toBeVisible();
}

test("3~4학년 사건 1의 두 빠짐을 복구해 결과와 보존 기록까지 완성한다", async ({ page }) => {
  await startMission(page, "3~4학년 기본 항로");
  await openCase(page, "비 오는 날 모임 장소");

  await answerChange(page, { segment: "모둠 안내판 앞에 모여요.", evidence: "도움 정보 · 모둠 안내판 앞" });
  await expect(page.getByRole("button", { name: "다음 비교" })).toBeEnabled();
  await page.getByRole("button", { name: "다음 비교" }).focus();
  await page.keyboard.press("Enter");
  await answerChange(page, { segment: "비가 오면 체육관에서 만나요.", evidence: "조건 · 비가 오면 체육관" });
  await page.getByRole("button", { name: "전체 사슬 점검" }).click();
  await page.getByRole("button", { name: "안전 전달문 고르기" }).click();
  await page.getByRole("button", { name: "금요일 2시에 운동장 모둠 안내판 앞에서 모여요. 비가 오면 체육관으로 가요." }).click();
  await expect(page.getByRole("button", { name: "사건 기록 완성" })).toBeEnabled();
  await page.getByRole("button", { name: "사건 기록 완성" }).click();
  await expect(page.getByRole("heading", { name: "뜻을 지키는 전달 기록을 남겼어요" })).toBeVisible();
  await expect(page.getByText("비가 올 때만 체육관으로 간다는 조건이 빠졌어요.")).toBeVisible();
  await page.getByRole("button", { name: "전달 보존 기록 보기" }).click();
  await expect(page.getByRole("heading", { name: "완료한 사건만 모아 봐요" })).toBeVisible();
  await expect(page.getByText("✓ 비 오는 날 모임 장소")).toBeVisible();
});

test("5~6학년 사건에서 예정이 확정으로 바뀐 것을 찾아 안전 전달문으로 복구한다", async ({ page }) => {
  await startMission(page, "5~6학년 확장 항로");
  await openCase(page, "방과 후 일정은 아직 예정");

  await answerChange(page, {
    segment: "다음 주 방과 후 일정은 화요일로 바뀔 예정이에요. 월요일에 담당 선생님 안내로 최종 확인해요.",
    evidence: "출처 · 담당 선생님 안내",
  });
  await page.getByRole("button", { name: "다음 비교" }).click();
  await answerChange(page, {
    segment: "다음 주 방과 후 일정은 화요일로 확정됐고 월요일에 확인해요.",
    type: "뜻이 달라짐",
    evidence: "확실성 · 예정",
  });
  await page.getByRole("button", { name: "전체 사슬 점검" }).click();
  await page.getByRole("button", { name: "안전 전달문 고르기" }).click();
  await page.getByRole("button", { name: "다음 주 방과 후 일정은 화요일로 바뀔 예정이에요. 월요일에 담당 선생님 안내로 최종 확인해요." }).click();
  await page.getByRole("button", { name: "사건 기록 완성" }).click();
  await expect(page.getByText("예정이 확정으로 바뀌어 확실한 정도가 달라졌어요.")).toBeVisible();
  await expect(page.getByText("담당 선생님 안내로 최종 확인해요.")).toBeVisible();
});

test("사건 5의 두 안전 전달문과 접근성·화면·네트워크 경계를 확인한다", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startMission(page, "5~6학년 확장 항로");
  await openCase(page, "가상 학교 방송 인수인계");

  await answerChange(page, {
    segment: "금요일 오전에 가상 방송실에서, 담당 안내문으로 확인한 비상 안내만 방송해요.",
    type: "뜻 유지",
    evidence: "무엇 · 방송 내용을 전달",
  });
  await page.getByRole("button", { name: "다음 비교" }).click();
  await answerChange(page, {
    segment: "금요일 오전에 가상 방송실에서, 담당 안내문으로 확인한 비상 안내만 방송해요.",
    evidence: "조건 · 비상 안내가 있을 때만",
  });
  await answerChange(page, {
    segment: "금요일 오후 가상 방송실에서 방송 내용을 전달해요.",
    type: "뜻이 달라짐",
    evidence: "언제 · 금요일 오전",
  });
  await answerChange(page, {
    segment: "손전등도 준비해요.",
    type: "근거 없는 추가",
    evidence: "도움 정보 · 손전등 준비",
  });
  await page.getByRole("button", { name: "전체 사슬 점검" }).click();
  await page.getByRole("button", { name: "안전 전달문 고르기" }).click();

  const oneSentence = page.getByRole("button", { name: "비상 안내가 있을 때만 담당 안내문에서 확인된 내용을 금요일 오전 가상 방송실에서 방송으로 전달해요." });
  const twoSentences = page.getByRole("button", { name: "금요일 오전 가상 방송실에서 방송 내용을 전달해요. 비상 안내가 있을 때 담당 안내문으로 확인한 내용만 전해요." });
  await oneSentence.click();
  await expect(page.getByRole("button", { name: "사건 기록 완성" })).toBeEnabled();
  await oneSentence.click();
  await twoSentences.click();
  await expect(page.getByRole("button", { name: "사건 기록 완성" })).toBeEnabled();

  const violations = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(violations.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? ""))).toEqual([]);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  expect(await page.locator(".primary").evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBeGreaterThanOrEqual(2);
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }))).toEqual({ local: 0, session: 0, cookies: "" });
  expect([...new Set(requests.map((url) => new URL(url).origin))]).toEqual(["http://127.0.0.1:43817"]);
});
