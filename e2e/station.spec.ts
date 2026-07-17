import { expect, test } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

type ChangeAnswer = {
  segment: string;
  evidence: string;
  type?: "내용이 빠짐" | "없던 내용이 생김" | "뜻이 바뀜" | "같은 뜻";
};

async function startMission(page: import("playwright/test").Page, route: "3~4학년 기본 활동" | "5~6학년 도전 활동") {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveText("정보 손실 통신소");
  if (route === "5~6학년 도전 활동") await page.getByRole("button", { name: route }).click();
  await page.getByRole("button", { name: "연습 시작" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "연습 활동 건너뛰기" }).focus();
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
  if (answer.type && answer.type !== "내용이 빠짐") await page.getByLabel(answer.type).check();
  await page.getByLabel(answer.evidence, { exact: true }).check();
  await page.getByRole("button", { name: "내 답 확인" }).click();
  await expect(page.getByText("잘 찾았어요. 고른 말과 이유가 서로 맞아요.")).toBeVisible();
}

test("3~4학년 사건 1의 두 빠짐을 복구해 결과와 완료 기록까지 완성한다", async ({ page }) => {
  await startMission(page, "3~4학년 기본 활동");
  await openCase(page, "비 오는 날 모임 장소");

  await answerChange(page, { segment: "모둠 안내판 앞에 모여요.", evidence: "도움 정보 · 모둠 안내판 앞" });
  await expect(page.getByRole("button", { name: "다음 비교" })).toBeEnabled();
  await page.getByRole("button", { name: "다음 비교" }).focus();
  await page.keyboard.press("Enter");
  await answerChange(page, { segment: "비가 오면 체육관에서 만나요.", evidence: "조건(어떤 때인지) · 비가 오면 체육관" });
  await page.getByRole("button", { name: "처음부터 끝까지 보기" }).click();
  await page.getByRole("button", { name: "뜻을 지킨 문장 고르기" }).click();
  const unsafeRelay = page.getByRole("button", { name: "금요일 2시에 운동장에 모여요." });
  await unsafeRelay.click();
  await expect(page.getByText("아직 빠진 중요한 뜻: 조건(어떤 때인지).")).toBeVisible();
  await expect(page.getByRole("button", { name: "활동 마치기" })).toBeDisabled();
  await unsafeRelay.click();
  await page.getByRole("button", { name: "금요일 2시에 운동장 모둠 안내판 앞에서 모여요. 비가 오면 체육관으로 가요." }).click();
  await expect(page.getByRole("button", { name: "활동 마치기" })).toBeEnabled();
  await page.getByRole("button", { name: "활동 마치기" }).click();
  await expect(page.getByRole("heading", { name: "뜻을 지키는 전달 기록을 남겼어요" })).toBeVisible();
  await expect(page.getByText("비가 올 때만 체육관으로 간다는 조건이 빠졌어요.")).toBeVisible();
  await page.getByRole("button", { name: "완료 기록 보기" }).click();
  await expect(page.getByRole("heading", { name: "완료한 사건만 모아 봐요" })).toBeVisible();
  await expect(page.getByText("✓ 비 오는 날 모임 장소")).toBeVisible();
});

test("안내 활동은 오답 피드백으로 잠그고 뜻 유지와 뜻 바뀜을 모두 확인한다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "연습 시작" }).click();

  await page.getByRole("button", { name: "모둠별로", exact: true }).click();
  await page.getByLabel("뜻이 바뀜").check();
  await page.getByLabel("누가 · 각 모둠").check();
  await page.getByRole("button", { name: "내 답 확인" }).click();
  await expect(page.getByText("앞 문장과 다음 문장을 나란히 읽고, 무엇이 빠지거나 달라졌는지 찾아보세요.")).toBeVisible();
  await expect(page.getByRole("button", { name: "다음 비교" })).toBeDisabled();

  await page.getByLabel("같은 뜻").check();
  await page.getByRole("button", { name: "내 답 확인" }).click();
  await expect(page.getByRole("button", { name: "다음 비교" })).toBeEnabled();
  await page.getByRole("button", { name: "다음 비교" }).click();
  await page.getByRole("button", { name: "각자", exact: true }).click();
  await page.getByLabel("뜻이 바뀜").check();
  await page.getByLabel("누가 · 각 모둠").check();
  await page.getByRole("button", { name: "내 답 확인" }).click();
  await expect(page.getByRole("button", { name: "사건 임무로" })).toBeEnabled();
  await page.getByRole("button", { name: "사건 임무로" }).click();
  await expect(page.getByRole("heading", { name: "통신 기록을 열어 보세요" })).toBeVisible();
});

test("사건 개요와 안내 활동도 학생용 1·2·3 표시와 한국어 매체명을 유지한다", async ({ page }) => {
  await startMission(page, "3~4학년 기본 활동");
  await page.getByRole("button", { name: "비 오는 날 모임 장소" }).click();

  const facts = page.locator(".facts");
  await expect(facts).toContainText("안내문 → 말 → 메모");
  await expect(facts).not.toContainText(/notice|spoken|memo|broadcast/);

  await page.getByRole("button", { name: "정보 손실 통신소" }).click();
  await page.getByRole("button", { name: "연습 시작" }).click();
  const expressionChoice = page.getByRole("group", { name: "1. 달라진 말 고르기" });
  await expect(expressionChoice).toBeVisible();
  await expect(expressionChoice.getByRole("button", { name: "각 모둠은", exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "2. 어떻게 달라졌나요?" })).toBeVisible();
  await expect(page.getByRole("group", { name: "3. 왜 그렇게 생각했나요?" })).toBeVisible();
});

test("사건 비교는 전체 진행 단계, 한국어 매체명, 1·2·3 선택 안내와 44px 터치 목표를 보여 준다", async ({ page }) => {
  await startMission(page, "3~4학년 기본 활동");
  await openCase(page, "비 오는 날 모임 장소");

  const workflow = page.getByRole("navigation", { name: "사건 활동 진행" });
  await expect(workflow).toBeVisible();
  await expect(workflow.locator('[aria-current="step"]')).toHaveText("2비교");
  await expect(page.getByRole("heading", { name: "이전 · 안내문" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "다음 · 말" })).toBeVisible();
  const activitySteps = page.getByLabel("비교 활동 순서");
  await expect(activitySteps.getByText("1. 달라진 말 고르기")).toBeVisible();
  await expect(activitySteps.getByText("2. 어떻게 달라졌나요?")).toBeVisible();
  await expect(activitySteps.getByText("3. 왜 그렇게 생각했나요?")).toBeVisible();

  expect(await page.locator(".header-actions button").evaluateAll((buttons) => buttons.every((button) => button.getBoundingClientRect().height >= 44))).toBe(true);
  expect(await page.locator(".choice-row label, .check-grid label").evaluateAll((labels) => labels.every((label) => label.getBoundingClientRect().height >= 44))).toBe(true);
  expect(await page.locator(".choice-row input, .check-grid input").evaluateAll((inputs) => inputs.every((input) => input.getBoundingClientRect().width >= 18 && input.getBoundingClientRect().height >= 18))).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".station-header")).toHaveClass(/mobile-header/);
  await expect(page.locator(".station-header .header-status")).toContainText("3~4학년 기본 활동");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("5~6학년 사건에서 예정이 확정으로 바뀐 것을 찾아 안전 전달문으로 복구한다", async ({ page }) => {
  await startMission(page, "5~6학년 도전 활동");
  await openCase(page, "방과 후 일정은 아직 예정");

  await answerChange(page, {
    segment: "다음 주 방과 후 일정은 화요일로 바뀔 예정이에요. 월요일에 담당 선생님 안내로 최종 확인해요.",
    evidence: "출처(누가 알려 줬는지) · 담당 선생님 안내",
  });
  await page.getByRole("button", { name: "다음 비교" }).click();
  await answerChange(page, {
    segment: "다음 주 방과 후 일정은 화요일로 확정됐고 월요일에 확인해요.",
    type: "뜻이 바뀜",
    evidence: "확실성(예정인지 확정인지) · 예정(아직 바뀔 수 있음)",
  });
  await page.getByRole("button", { name: "처음부터 끝까지 보기" }).click();
  await page.getByRole("button", { name: "뜻을 지킨 문장 고르기" }).click();
  await page.getByRole("button", { name: "다음 주 방과 후 일정은 화요일로 바뀔 예정이에요. 월요일에 담당 선생님 안내로 최종 확인해요." }).click();
  await page.getByRole("button", { name: "활동 마치기" }).click();
  await expect(page.getByText("예정이 확정으로 바뀌어 확실한 정도가 달라졌어요.")).toBeVisible();
  await expect(page.getByText("담당 선생님 안내로 최종 확인해요.")).toBeVisible();
});

test("사건 5의 두 안전 전달문과 접근성·화면·네트워크 경계를 확인한다", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startMission(page, "5~6학년 도전 활동");
  await openCase(page, "가상 학교 방송 인수인계");

  await answerChange(page, {
    segment: "금요일 오전에 가상 방송실에서, 담당 안내문으로 확인한 비상 안내만 방송해요.",
    type: "같은 뜻",
    evidence: "무엇 · 방송 내용을 전달",
  });
  await page.getByRole("button", { name: "다음 비교" }).click();
  await answerChange(page, {
    segment: "금요일 오전에 가상 방송실에서, 담당 안내문으로 확인한 비상 안내만 방송해요.",
    evidence: "조건(어떤 때인지) · 비상 안내가 있을 때만",
  });
  await answerChange(page, {
    segment: "금요일 오후 가상 방송실에서 방송 내용을 전달해요.",
    type: "뜻이 바뀜",
    evidence: "언제 · 금요일 오전",
  });
  await answerChange(page, {
    segment: "손전등도 준비해요.",
    type: "없던 내용이 생김",
    evidence: "도움 정보 · 손전등 준비",
  });
  await page.getByRole("button", { name: "처음부터 끝까지 보기" }).click();
  await page.getByRole("button", { name: "뜻을 지킨 문장 고르기" }).click();

  const oneSentence = page.getByRole("button", { name: "비상 안내가 있을 때만 담당 안내문에서 확인된 내용을 금요일 오전 가상 방송실에서 방송으로 전달해요." });
  const twoSentences = page.getByRole("button", { name: "금요일 오전 가상 방송실에서 방송 내용을 전달해요. 비상 안내가 있을 때 담당 안내문으로 확인한 내용만 전해요." });
  await oneSentence.click();
  await expect(page.getByRole("button", { name: "활동 마치기" })).toBeEnabled();
  await oneSentence.click();
  await twoSentences.click();
  await expect(page.getByRole("button", { name: "활동 마치기" })).toBeEnabled();

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
  expect([...new Set(requests.map((url) => new URL(url).origin))]).toEqual([new URL(page.url()).origin]);
});

test("선택 복구: 연습에서 정답 확인 뒤와 과다 선택 뒤 고른 것을 모두 지울 수 있다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "연습 시작" }).click();

  await page.getByRole("button", { name: "모둠별로", exact: true }).click();
  await page.getByLabel("누가 · 각 모둠").check();
  await page.getByRole("button", { name: "내 답 확인" }).click();
  await expect(page.locator(".feedback")).not.toHaveText("");
  await expect(page.getByRole("button", { name: "다음 비교" })).toBeEnabled();
  await page.getByRole("button", { name: "고른 것 지우기" }).click();

  await expect(page.getByText("문장 선택 0개 · 이유 선택 0개")).toBeVisible();
  await expect(page.getByLabel("누가 · 각 모둠")).not.toBeChecked();
  await expect(page.locator(".feedback")).toHaveText("");
  await expect(page.getByRole("button", { name: "다음 비교" })).toBeDisabled();

  await page.getByRole("button", { name: "각 모둠은", exact: true }).click();
  await page.getByRole("button", { name: "모둠별로", exact: true }).click();
  await page.getByLabel("누가 · 각 모둠").check();
  await expect(page.getByText("문장 선택 2개 · 이유 선택 1개")).toBeVisible();
  await page.getByRole("button", { name: "고른 것 지우기" }).click();
  await expect(page.getByText("문장 선택 0개 · 이유 선택 0개")).toBeVisible();
});

test("선택 복구: 답을 확인하기 전 다음 버튼은 안내와 연결된다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "연습 시작" }).click();

  const next = page.getByRole("button", { name: "다음 비교" });
  await expect(next).toBeDisabled();
  await expect(page.getByText("먼저 내 답 확인을 눌러요.")).toBeVisible();
  await expect(next).toHaveAttribute("aria-describedby", "tutorial-next-guidance");

  await startMission(page, "3~4학년 기본 활동");
  await openCase(page, "비 오는 날 모임 장소");
  const compareNext = page.getByRole("button", { name: "다음 비교" });
  await expect(compareNext).toBeDisabled();
  await expect(page.getByText("먼저 내 답 확인을 눌러요.")).toBeVisible();
  await expect(compareNext).toHaveAttribute("aria-describedby", "compare-next-guidance");
});

test("전체 변화 보기와 전달문 선택 뒤로가기는 찾은 변화와 완료 기록을 유지한다", async ({ page }) => {
  await startMission(page, "3~4학년 기본 활동");
  await openCase(page, "비 오는 날 모임 장소");

  await answerChange(page, { segment: "모둠 안내판 앞에 모여요.", evidence: "도움 정보 · 모둠 안내판 앞" });
  await page.getByRole("button", { name: "다음 비교" }).click();
  await answerChange(page, { segment: "비가 오면 체육관에서 만나요.", evidence: "조건(어떤 때인지) · 비가 오면 체육관" });
  await page.getByRole("button", { name: "처음부터 끝까지 보기" }).click();

  await expect(page.getByRole("heading", { name: "처음 문장에서 마지막 문장까지" })).toBeVisible();
  await expect(page.getByRole("button", { name: "비교로 돌아가기" })).toBeVisible();
  await page.getByRole("button", { name: "비교로 돌아가기" }).click();
  await expect(page.getByText("찾은 변화 1/1")).toBeVisible();
  await page.getByRole("button", { name: "처음부터 끝까지 보기" }).click();
  await page.getByRole("button", { name: "뜻을 지킨 문장 고르기" }).click();

  const finish = page.getByRole("button", { name: "활동 마치기" });
  await expect(finish).toBeDisabled();
  await expect(page.getByText("뜻을 모두 지킨 문장을 골라야 활동을 마칠 수 있어요.")).toBeVisible();
  await expect(finish).toHaveAttribute("aria-describedby", "relay-finish-help");
  await page.getByRole("button", { name: "전체 변화 다시 보기" }).click();
  await expect(page.getByRole("heading", { name: "처음 문장에서 마지막 문장까지" })).toBeVisible();
  await page.getByRole("button", { name: "뜻을 지킨 문장 고르기" }).click();

  await page.getByRole("button", { name: "금요일 2시에 운동장 모둠 안내판 앞에서 모여요. 비가 오면 체육관으로 가요." }).click();
  await finish.click();
  await expect(page.getByText("내가 찾은 변화")).toBeVisible();
  await expect(page.locator(".finding-groups article")).toHaveCount(1);
  await expect(page.getByText("확인한 변화가 없어요.")).toHaveCount(0);
  await expect(page.getByText("이유:").first()).toBeVisible();
  await page.getByRole("button", { name: "완료 기록 보기" }).click();
  await expect(page.getByText("✓ 비 오는 날 모임 장소")).toBeVisible();
});

test("뒤로가기: 연습은 시작 화면으로, 비교는 사건 설명으로 돌아간다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "연습 시작" }).click();
  await page.getByRole("button", { name: "시작 화면으로" }).click();
  await expect(page.getByRole("heading", { name: "전해지는 동안 달라진 뜻을 찾아 안전하게 다시 보내요" })).toBeVisible();

  await page.getByRole("button", { name: "연습 시작" }).click();
  await page.getByRole("button", { name: "연습 활동 건너뛰기" }).click();
  await page.getByRole("button", { name: "비 오는 날 모임 장소" }).click();
  await page.getByRole("button", { name: "인접 전달문 비교하기" }).click();
  await page.getByRole("button", { name: "사건 설명으로" }).click();
  await expect(page.getByRole("heading", { name: "비 오는 날 모임 장소" })).toBeVisible();
  await expect(page.getByRole("button", { name: "인접 전달문 비교하기" })).toBeVisible();
});

test("뒤로가기: 비교에서 찾은 변화는 유지하고 아직 확인하지 않은 답만 비운다", async ({ page }) => {
  await startMission(page, "3~4학년 기본 활동");
  await openCase(page, "비 오는 날 모임 장소");

  await page.getByRole("button", { name: "모둠 안내판 앞에 모여요.", exact: true }).click();
  await page.getByLabel("도움 정보 · 모둠 안내판 앞").check();
  await page.getByRole("button", { name: "내 답 확인" }).click();
  await expect(page.getByText("찾은 변화 1/1")).toBeVisible();
  await page.getByRole("heading", { name: "다음 · 말" }).locator("..").getByRole("button", { name: "금요일 2시에 운동장에 모여요.", exact: true }).click();
  await page.getByLabel("언제 · 금요일 2시").check();
  await page.getByLabel("뜻이 바뀜").check();
  await page.getByRole("button", { name: "내 답 확인" }).click();
  await expect(page.locator(".feedback")).not.toHaveText("");
  await page.getByRole("button", { name: "사건 설명으로" }).click();
  await page.getByRole("button", { name: "인접 전달문 비교하기" }).click();

  await expect(page.getByText("찾은 변화 1/1")).toBeVisible();
  await expect(page.getByText("문장 선택 0개 · 이유 선택 0개")).toBeVisible();
  await expect(page.locator(".phrase.pressed")).toHaveCount(0);
  await expect(page.locator(".check-grid input:checked")).toHaveCount(0);
  await expect(page.getByLabel("내용이 빠짐")).toBeChecked();
  await expect(page.locator(".feedback")).toHaveText("");
});
