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
  assert.match(html, /3~4학년 기본 항로/);
  assert.match(html, /5~6학년 확장 항로/);
  assert.match(html, /개인정보를 모으거나 저장하지 않아요/);
  assert.match(html, /업데이트 내역/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|codex-preview|react-loading-skeleton/i);
});

test("제품 파일은 starter 흔적, 영구 저장, 자유 입력 없이 작게 분리되어 있다", async () => {
  const root = new URL("../", import.meta.url);
  const [page, layout, packageJson, cases, appSource, globalCss, missionSource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../domain/cases.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/CommunicationStation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/Mission.tsx", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page + layout + packageJson, /_sites-preview|Starter Project|react-loading-skeleton|codex-preview/);
  assert.doesNotMatch(appSource, /localStorage|sessionStorage|indexedDB|document\.cookie|<input[^>]+type=["']text/i);
  assert.match(appSource, /clearCurrentCase\("mission"\)/);
  assert.match(missionSource, /onClick=\{onBack\}>사건 목록으로/);
  assert.match(appSource, /\.\/components\/Compare/);
  assert.match(appSource, /\.\/components\/Outcome/);
  assert.match(globalCss, /\.\/styles\/base\.css/);
  assert.match(globalCss, /\.\/styles\/components\.css/);
  assert.match(globalCss, /\.\/styles\/responsive\.css/);
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
});
