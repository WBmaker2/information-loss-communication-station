# 정보 손실 통신소 v0.3.0 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to execute this plan task-by-task.

**Goal:** 3학년 학생이 도움 없이 읽고 활동을 복구할 수 있도록 문구, 선택 초기화, 뒤로가기, 피드백, 결과 요약을 개선하고 v0.3.0으로 공개합니다.

**Architecture:** 기존 `CommunicationStation`의 화면 상태와 `domain` 판정 규칙을 유지합니다. 쉬운 레이블은 `shared.ts`, 선택 복구 안내는 새 `SelectionSummary.tsx`, 화면 이동은 `CommunicationStation.tsx`에 모읍니다. 판정 함수는 정답 규칙을 바꾸지 않고 오답 원인만 분류하며, 결과 화면은 실제 발견 데이터가 있는 그룹만 렌더링합니다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node test runner, Playwright, axe-core, Sites hosting

## Global Constraints

- 승인 설계 문서 `docs/superpowers/specs/2026-07-18-elementary-student-usability-design.md`의 고정 문구와 이동 규칙을 그대로 적용합니다.
- 도메인 enum, 사건 ID, 판정 정답, 안전 전달문 허용 조합은 바꾸지 않습니다.
- 개인정보, 로그인, 브라우저 저장소, 쿠키, 외부 요청을 추가하지 않습니다.
- 모든 코드 파일은 500줄 미만을 유지합니다.
- 각 작업은 실패 테스트를 먼저 확인하고 최소 구현으로 통과시킵니다.
- 사용자 화면에 `인접 단계`, `표현 조각`, `근거 뜻`, `전이`, `전체 사슬 점검`, `전달 보존 기록`을 남기지 않습니다.

---

### Task 1: 쉬운 레이블과 원인별 판정 피드백

**Files:**
- Modify: `tests/domain.test.ts`
- Modify: `domain/judge.ts`
- Modify: `app/components/shared.ts`
- Modify: `domain/cases.ts`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: 원인별 피드백 회귀 테스트 작성**

`tests/domain.test.ts`에 빈 선택, 과다 선택, 변화 종류 불일치, 정답이 각각 다음 문구를 반환하는 테스트를 추가합니다.

```ts
assert.equal(empty.feedback, "먼저 달라진 말을 하나 고르고, 그 이유도 골라 보세요.");
assert.equal(overselected.feedback, "말을 너무 많이 골랐어요. 달라진 말만 남겨 보세요.");
assert.equal(wrongType.feedback, "고른 말은 다시 살펴볼 수 있어요. 어떻게 달라졌는지 한 번 더 생각해 보세요.");
assert.equal(correct.feedback, "잘 찾았어요. 고른 말과 이유가 서로 맞아요.");
```

- [ ] **Step 2: 실패 확인**

Run: `./node_modules/.bin/tsx --test tests/domain.test.ts`
Expected: 기존 일반 피드백 때문에 새 테스트가 FAIL.

- [ ] **Step 3: 판정 결과 문구만 세분화**

`domain/judge.ts`에서 단계 연결 확인 뒤 다음 순서로 원인을 구분합니다.

1. 문장 선택 또는 이유 선택이 비었으면 빈 선택 피드백
2. 중복을 제거한 선택 수가 해당 단계의 가능한 단일 변화보다 크면 과다 선택 피드백
3. 선택 문장·이유가 맞을 가능성이 있으나 `changeType`만 다르면 종류 불일치 피드백
4. 정확히 맞으면 승인된 정답 피드백
5. 그 밖의 오답은 고른 말을 좁혀 다시 살펴보라는 쉬운 피드백

`matchingChangeIds`와 기존 `isCorrect` 의미는 유지합니다.

- [ ] **Step 4: 학생용 공통 레이블 적용**

`app/components/shared.ts`의 변화 이름은 `내용이 빠짐 / 없던 내용이 생김 / 뜻이 바뀜 / 같은 뜻`으로 바꾸고, 5~6학년 의미 종류는 첫 노출에서 `조건(어떤 때인지) / 출처(누가 알려 줬는지) / 확실성(예정인지 확정인지)`으로 제공합니다. 도메인 키는 그대로 둡니다.

`domain/cases.ts`의 사건 5 제목과 목적을 각각 `가상 학교 방송 이어 전하기`, `방송 내용을 이어 전할 때, 어떤 때인지와 시간을 빠뜨리지 않아요.`로 바꾸고, 예정·확정의 첫 설명에는 승인된 괄호 풀이를 넣습니다.

- [ ] **Step 5: 서버 렌더 문구 테스트 갱신**

`tests/rendered-html.test.mjs`에서 시작 화면에 `3~4학년 기본 활동`, `5~6학년 도전 활동`이 보이고 이전 항로 문구가 없음을 검사합니다. 제품 소스 합계에서 금지 문구가 학생 UI 컴포넌트에 없는지도 검사합니다.

- [ ] **Step 6: 테스트 및 커밋**

Run: `npm test`
Expected: PASS.

```bash
git add tests/domain.test.ts domain/judge.ts app/components/shared.ts domain/cases.ts tests/rendered-html.test.mjs
git commit -m "feat: simplify learner vocabulary and feedback"
```

### Task 2: 선택 복구와 연습·비교 화면 이동

**Files:**
- Create: `app/components/SelectionSummary.tsx`
- Modify: `app/components/WelcomeTutorial.tsx`
- Modify: `app/components/Compare.tsx`
- Modify: `app/CommunicationStation.tsx`
- Modify: `app/styles/components.css`
- Modify: `app/styles/responsive.css`
- Modify: `e2e/station.spec.ts`

- [ ] **Step 1: 학생 복구 흐름 E2E 작성**

다음 시나리오를 `e2e/station.spec.ts`에 먼저 추가하거나 기존 시나리오에 삽입합니다.

- 연습에서 이전·다음 말을 함께 고른 뒤 `고른 것 지우기`를 누르면 선택 수 0, 이유 선택 0, 피드백 공백이 됩니다.
- 정답 확인 전에는 다음 버튼 옆에 `먼저 내 답 확인을 눌러요.`가 보이고 버튼의 `aria-describedby`가 안내 ID를 가리킵니다.
- 연습의 `시작 화면으로`, 비교의 `사건 설명으로`가 동작합니다.
- 비교에서 변화 하나를 확인한 뒤 사건 설명으로 갔다가 다시 들어오면 찾은 변화 수는 유지되고 미확인 답만 비워집니다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:e2e -- --grep "선택 복구|뒤로가기" --reporter=line`
Expected: 새 버튼과 안내가 없어 FAIL.

- [ ] **Step 3: 재사용 선택 요약 컴포넌트 구현**

`SelectionSummary.tsx`는 다음 props를 받습니다.

```ts
type SelectionSummaryProps = {
  selectedSegmentCount: number;
  selectedEvidenceCount: number;
  onClear: () => void;
  guidanceId?: string;
  showNextGuidance?: boolean;
};
```

보이는 문구로 문장 선택 수와 이유 선택 수를 알려 주고, 최소 높이 44px의 `고른 것 지우기` 버튼을 렌더링합니다. `showNextGuidance`일 때 `먼저 내 답 확인을 눌러요.`를 `guidanceId`로 출력합니다.

- [ ] **Step 4: 연습 화면 적용**

`WelcomeTutorial.tsx`에서 제목·단계를 `연습 활동`, `달라진 말 고르기`, `어떻게 달라졌나요?`, `왜 그렇게 생각했나요?`, `내 답 확인`으로 바꿉니다. `onBack` prop으로 `시작 화면으로`를 제공하고, 선택 지우기는 현재 문장·이유·피드백·진행 가능 상태만 초기화합니다. 비활성 다음 버튼에 `aria-describedby`를 연결합니다.

- [ ] **Step 5: 비교 화면 적용**

`Compare.tsx`에 `onClear`, `onBack`을 추가합니다. 단계 제목을 쉬운 말로 바꾸고, 예상 변화에 omission이 남아 있으면 `이전 문장에서 사라진 말을 골라요.`, 아니면 `다음 문장에서 달라지거나 새로 생긴 말을 골라요.`를 보여 줍니다. 다음 버튼 안내와 `aria-describedby`, `고른 것 지우기`, `사건 설명으로`를 추가합니다.

- [ ] **Step 6: 상위 상태 이동 연결**

`CommunicationStation.tsx`에서 연습의 뒤로가기는 현재 사건 상태를 비우고 welcome로, 비교의 뒤로가기는 `resetAnswer()` 후 mission으로 이동합니다. `resolvedByCase`, `findingsByCase`, `completedRecords`는 유지합니다. 헤더 활동 이름도 쉬운 말로 바꾸고 성공/진행 피드백에서 `전이`를 제거합니다.

- [ ] **Step 7: 스타일과 테스트 통과**

선택 요약, 안내, 뒤로가기 행을 기존 시각 체계 안에서 구분하고 360px에서 세로 배치합니다.

Run: `npm run typecheck && npm run lint && npm run test:e2e -- --grep "선택 복구|뒤로가기" --reporter=line`
Expected: PASS.

```bash
git add app/components/SelectionSummary.tsx app/components/WelcomeTutorial.tsx app/components/Compare.tsx app/CommunicationStation.tsx app/styles/components.css app/styles/responsive.css e2e/station.spec.ts
git commit -m "feat: add learner recovery and back navigation"
```

### Task 3: 전체 보기·전달문·결과 화면 간결화

**Files:**
- Modify: `app/components/Outcome.tsx`
- Modify: `app/CommunicationStation.tsx`
- Modify: `app/components/shared.ts`
- Modify: `app/styles/components.css`
- Modify: `e2e/station.spec.ts`
- Modify: `tests/records.test.ts`

- [ ] **Step 1: 결과 및 뒤로가기 회귀 테스트 작성**

E2E에 다음을 추가합니다.

- 전체 보기에서 `비교로 돌아가기`, 전달문 선택에서 `전체 변화 다시 보기`가 동작합니다.
- 돌아온 뒤 확인한 변화와 완료 기록은 유지됩니다.
- 결과의 `내가 찾은 변화`에는 발견된 변화 종류만 있고 빈 변화 카드가 없습니다.
- 결과 상단에는 `처음 달라진 곳 / 다시 넣은 중요한 내용 / 내가 고른 문장`이 먼저 보이고 `근거` 대신 `이유`를 씁니다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:e2e -- --grep "결과 요약|전체 변화" --reporter=line`
Expected: 뒤로가기와 간결한 결과 구조가 없어 FAIL.

- [ ] **Step 3: Ledger 개선**

`Ledger` 제목을 `처음 문장에서 마지막 문장까지`, 첫 카드 이름을 `처음 문장`으로 바꾸고 상태를 `남아 있음 / 사라짐 / 새로 생김`으로 표시합니다. `onBack`으로 `비교로 돌아가기`, 다음 행동은 `뜻을 지킨 문장 고르기`로 제공합니다.

- [ ] **Step 4: Relay 개선**

제목을 `뜻을 지킨 문장을 골라 다시 보내요`, 버튼을 `활동 마치기`로 바꿉니다. 비활성일 때 `뜻을 모두 지킨 문장을 골라야 활동을 마칠 수 있어요.`를 연결하고, 빠진 의미 종류를 쉬운 레이블로 알려 줍니다. `onBack`으로 `전체 변화 다시 보기`를 제공합니다.

- [ ] **Step 5: Result 개선**

상단 요약을 승인된 세 항목만 렌더링합니다. `findingsByType(findings)` 결과 중 길이가 0보다 큰 그룹만 출력하고, 각 항목의 `근거`를 `이유`로 바꿉니다. `완료 기록 보기` 버튼을 사용합니다.

- [ ] **Step 6: 상태 이동 연결 및 회귀 테스트**

`CommunicationStation.tsx`에서 ledger→compare, relay→ledger를 연결하되 학습 기록은 유지합니다. 기존 전체 사건 1과 사건 5 경로를 새 문구로 갱신합니다.

Run: `npm test && npm run typecheck && npm run lint && npm run test:e2e -- --reporter=line`
Expected: 전체 PASS.

```bash
git add app/components/Outcome.tsx app/CommunicationStation.tsx app/components/shared.ts app/styles/components.css e2e/station.spec.ts tests/records.test.ts
git commit -m "feat: simplify outcome and preserve navigation state"
```

### Task 4: v0.3.0 릴리스 기록과 학생 실사용 증거

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/components/InfoDialog.tsx`
- Modify: `docs/progress.md`
- Modify: `docs/test-log.md`
- Create: `docs/2026-07-18-elementary-student-usability-report.md`
- Create: `docs/screenshots/v0.3.0/compare-mobile.png`
- Create: `docs/screenshots/v0.3.0/result-mobile.png`

- [ ] **Step 1: 버전과 업데이트 내역 갱신**

`npm version 0.3.0 --no-git-tag-version`으로 패키지 버전을 맞춥니다. `InfoDialog` 업데이트 내역 맨 위에 `2026-07-18 · v0.3.0`과 `쉬운 문구, 선택 복구, 뒤로가기, 간결한 결과 화면`을 기록합니다.

- [ ] **Step 2: 전체 자동 검증**

Run: `npm test`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

Run: `npm run test:e2e -- --reporter=line`
Expected: 3~4학년 사건 1, 5~6학년 사건 4·5, 선택 복구, 뒤로가기, axe, 360px·390px·200% 확대, 키보드, 저장소 없음이 모두 PASS.

- [ ] **Step 3: 390×844 실제 흐름 점검과 스크린샷**

프로덕션 서버에서 모바일 뷰포트로 시작→연습→사건→비교→전체 보기→전달문→결과를 직접 수행합니다. `compare-mobile.png`, `result-mobile.png`를 저장하고 가로 넘침, 안내 가독성, 뒤로가기, 빈 결과 반복 제거를 확인합니다.

- [ ] **Step 4: 문서 기록**

`docs/progress.md`에 v0.3.0 구현 내역, `docs/test-log.md`에 실제 실행한 명령·테스트 수·브라우저 점검을 추가합니다. 학생 보고서에는 시나리오, 해결된 마찰, 남은 교실 확인 항목을 기록합니다.

- [ ] **Step 5: 파일 크기와 변경 검증**

Run: `wc -l app/**/*.ts app/**/*.tsx domain/*.ts tests/*.ts tests/*.mjs e2e/*.ts | awk '$1 >= 500 && $2 != "total" { print; failed=1 } END { exit failed }'`
Expected: 출력 없이 PASS.

Run: `git diff --check`
Expected: PASS.

- [ ] **Step 6: 릴리스 문서 커밋**

```bash
git add package.json package-lock.json app/components/InfoDialog.tsx docs/progress.md docs/test-log.md docs/2026-07-18-elementary-student-usability-report.md docs/screenshots/v0.3.0
git commit -m "docs: record v0.3.0 student usability release"
```

### Task 5: 독립 리뷰, 메인 반영, 공개 배포

**Files:**
- Review: all changes since `cc2bf05`
- Verify: `.openai/hosting.json`

- [ ] **Step 1: 독립 코드·명세 리뷰**

별도 검토자가 `cc2bf05..HEAD`를 승인 설계와 비교해 Critical/Important 문제를 확인합니다. 지적이 있으면 구현자가 테스트와 함께 수정하고 재검토합니다.

- [ ] **Step 2: 작업 브랜치 최종 검증**

Run: `npm test && npm run typecheck && npm run lint && npm run build && npm run test:e2e -- --reporter=line && git diff --check cc2bf05..HEAD`
Expected: 모두 PASS.

- [ ] **Step 3: 메인 반영 후 재검증**

작업 브랜치를 `main`에 fast-forward로 반영하고 `npm test`, `npm run test:e2e -- --reporter=line`을 다시 실행합니다.

- [ ] **Step 4: Sites 새 버전 배포**

`.openai/hosting.json`의 기존 프로젝트를 사용해 정확한 `main` HEAD 소스를 업로드하고 빌드·배포합니다. 접근 모드는 `public`을 유지합니다.

- [ ] **Step 5: 라이브 확인**

`https://information-loss-communication-station.wbmaker.chatgpt.site`에서 비로그인 HTTP 200, v0.3.0 업데이트 내역, 쉬운 시작 문구, 핵심 학생 흐름을 확인합니다.
