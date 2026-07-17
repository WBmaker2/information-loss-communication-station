# Task 2 보고서: 선택 복구와 연습·비교 화면 이동

## Status

구현 완료. 학생이 고른 문장·이유를 초기화하고, 연습에서는 시작 화면으로, 비교에서는 사건 설명으로 안전하게 돌아갈 수 있습니다. 비교에서 돌아갈 때는 현재 답안만 초기화하고 이미 찾은 변화와 기록은 유지합니다.

## RED

명령:

```bash
npm run test:e2e -- --grep "선택 복구|뒤로가기" --reporter=line
```

실패 이유: 구현 전에는 `SelectionSummary`, `고른 것 지우기`, 다음 단계 안내, `aria-describedby`, `시작 화면으로`, `사건 설명으로`가 없었습니다. 새 E2E 4개 중 첫 시나리오가 선택 수 문구를 찾지 못해 RED를 확인했습니다.

## GREEN

확인된 명령:

```bash
npm run test:e2e -- --grep "선택 복구: 답을 확인하기 전" --reporter=line
```

결과: Chromium 1 passed (4.1s). 비활성 다음 버튼 옆 안내와 `aria-describedby="tutorial-next-guidance"` 연결을 확인했습니다.

요구된 4개 묶음 명령도 권한 분리 Chromium에서 실행했으나, 환경이 세 번째 진행 표시 뒤 종료 결과를 반환하지 않고 테스트 서버를 남겼습니다. 샌드박스 Chromium 실행은 macOS Mach 포트 권한 오류가 있었고, 권한 분리 환경에서는 묶음 종료 상태가 수집되지 않았습니다. 이 환경 문제 때문에 재반복하지 않았으며 루트 에이전트가 별도 권한 환경에서 최종 E2E를 재검증합니다.

```bash
npm run test:e2e -- --grep "선택 복구|뒤로가기" --reporter=line
```

## 전체 정적 검증

```bash
npm test                 # 28 passed, 0 failed (빌드 포함)
npm run typecheck        # passed
npm run lint             # passed
git diff --check         # passed
```

## 자체 검토

- `SelectionSummary`는 문장·이유 선택 수, 44px `고른 것 지우기`, 조건부 다음 단계 안내를 재사용합니다.
- 연습의 지우기는 문장·이유·피드백·진행 가능 상태만 초기화하며 변화 종류 선택은 유지합니다.
- 비교의 지우기와 뒤로가기는 현재 답안의 문장·이유·피드백·변화 종류만 초기화합니다.
- 비교 뒤로가기는 `resolvedByCase`, `findingsByCase`, `completedRecords`를 건드리지 않습니다.
- 새 뒤로가기 버튼과 선택 요약 버튼은 최소 44px이고, 360px에서는 세로로 배치됩니다.
- Task 3의 Mission/Outcome 흐름과 결과 화면은 수정하지 않았습니다.

## Commit

Commit SHA: pending (commit created after this report is written)

커밋 메시지: `feat: add learner recovery and back navigation`

## 변경 파일

- `app/components/SelectionSummary.tsx`
- `app/components/WelcomeTutorial.tsx`
- `app/components/Compare.tsx`
- `app/CommunicationStation.tsx`
- `app/styles/components.css`
- `app/styles/responsive.css`
- `e2e/station.spec.ts`
- `tests/rendered-html.test.mjs` (비교 안내 문구 변경에 맞춘 기존 정적 기대값)
- `.superpowers/sdd/task-2-report.md`

## 우려 사항

- 전체 선택 복구·뒤로가기 E2E 4개와 전체 E2E 10개는 이 에이전트 환경에서 종료 상태를 신뢰성 있게 수집하지 못했습니다. 단일 핵심 E2E와 모든 비브라우저 검증은 통과했으며, 최종 브라우저 재검증이 남아 있습니다.
