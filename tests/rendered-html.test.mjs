import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", {
    headers: { accept: "text/html" },
  }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("서버는 정보 손실 통신소 환영 화면을 렌더링한다", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>정보 손실 통신소<\/title>/);
  assert.match(html, /전해지는 동안 달라진 뜻을 찾아 안전하게 다시 보내요/);
  assert.match(html, /3~4학년 기본 활동/);
  assert.match(html, /5~6학년 도전 활동/);
  assert.doesNotMatch(html, /기본 항로|확장 항로|오늘의 항로/);
  assert.match(html, /개인정보를 모으거나 저장하지 않아요/);
  assert.match(html, /업데이트 내역/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|codex-preview|react-loading-skeleton/i);
});

test("제품 파일은 starter 흔적, 영구 저장, 자유 입력 없이 작게 분리되어 있다", async () => {
  const root = new URL("../", import.meta.url);
  const [page, layout, packageJson, cases, appSource, globalCss, missionSource, compareSource, tutorialSource, infoDialogSource, sharedSource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../domain/cases.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/CommunicationStation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/Mission.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/Compare.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/WelcomeTutorial.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/InfoDialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/shared.ts", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page + layout + packageJson, /_sites-preview|Starter Project|react-loading-skeleton|codex-preview/);
  assert.doesNotMatch(packageJson, /drizzle|db:generate/);
  assert.doesNotMatch(appSource, /localStorage|sessionStorage|indexedDB|document\.cookie|<input[^>]+type=["']text/i);
  assert.match(appSource, /clearCurrentCase\("mission"\)/);
  assert.match(missionSource, /onClick=\{onBack\}>사건 목록으로/);
  assert.match(missionSource, /바로 다음 문장 비교하기/);
  assert.match(compareSource, /중요한 내용/);
  assert.match(tutorialSource, /이유를 찾아/);
  assert.match(appSource, /\.\/components\/Compare/);
  assert.match(appSource, /\.\/components\/Outcome/);
  assert.match(globalCss, /\.\/styles\/base\.css/);
  assert.match(globalCss, /\.\/styles\/components\.css/);
  assert.match(globalCss, /\.\/styles\/responsive\.css/);
  assert.match(compareSource, /이전 문장에서 사라진 말을 골라요/);
  assert.match(compareSource, /stage=\{from\} selectable/);
  assert.match(tutorialSource, /judgeStageChange\(TUTORIAL_CASE/);
  assert.match(tutorialSource, /disabled=\{!canAdvance\}/);
  assert.match(sharedSource, /omission: "내용이 빠짐"/);
  assert.match(sharedSource, /"unsupported-addition": "없던 내용이 생김"/);
  assert.match(sharedSource, /"meaning-shift": "뜻이 바뀜"/);
  assert.match(sharedSource, /"meaning-preserving": "같은 뜻"/);
  assert.match(sharedSource, /condition: "조건\(어떤 때인지\)"/);
  assert.match(sharedSource, /source: "출처\(누가 알려 줬는지\)"/);
  assert.match(sharedSource, /certainty: "확실성\(예정인지 확정인지\)"/);
  assert.doesNotMatch(sharedSource, /omission: "빠짐"|근거 없는 추가|뜻이 달라짐|뜻 유지/);
  assert.doesNotMatch(tutorialSource + appSource, /기본 항로|확장 항로|오늘의 항로|이 전이/);
  assert.doesNotMatch(missionSource + compareSource + tutorialSource + infoDialogSource, /인접 단계|인접 전달문|표현 조각|근거 뜻|뜻 장부|원문|전이|전체 사슬 점검|전달 보존 기록|항로|안전 전달문/);
  assert.match(cases, /가상 학교 방송 이어 전하기/);
  assert.match(cases, /CASE_ONE[\s\S]*CASE_FIVE/);
  assert.match(cases, /grade-3-4/);
  assert.match(cases, /grade-5-6/);
  for (const filename of ["page.tsx", "CommunicationStation.tsx", "globals.css"]) {
    const info = await stat(new URL(`../app/${filename}`, import.meta.url));
    assert.ok(info.size > 0, `${filename} is not empty`);
    const source = await readFile(new URL(`../app/${filename}`, import.meta.url), "utf8");
    assert.ok(source.split("\n").length < 500, `${filename} stays below 500 lines`);
  }
  for (const filename of ["Compare.tsx", "Mission.tsx", "Outcome.tsx", "WelcomeTutorial.tsx", "InfoDialog.tsx"]) {
    await access(new URL(`../app/components/${filename}`, import.meta.url));
  }
  await assert.rejects(access(new URL("app/_sites-preview", root)));
  await assert.rejects(access(new URL("db", root)));
  await assert.rejects(access(new URL("drizzle.config.ts", root)));
});
