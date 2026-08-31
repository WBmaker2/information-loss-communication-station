# 2026-08-31 초등학생 관점 점검·개선 결과

## 한눈에 보기

`elementary-webapp-ux-orchestrator`의 `full` 모드로 기준선 화면을 점검한 뒤 계획을 먼저 기록하고 구현했습니다. 현재 작업 트리에는 P0와 미해결 P1이 없으며, 초등학생이 시작할 위치·고를 조각·오답 회복 방법을 화면에서 바로 확인할 수 있습니다.

- 대상: 정보 손실 통신소 (3~4학년 기본 활동, 5~6학년 도전 활동)
- 점검일: 2026-08-31
- 주 페르소나: 초3~4 준호
- 보조 페르소나: 초5~6 서윤
- 공개 확인 링크: [정보 손실 통신소](https://wbmaker2.github.io/information-loss-communication-station/)
- VoiceOver: 사용자 규칙에 따라 구현·검증하지 않음
- 새 이미지: 추가하지 않음. 이 활동은 문장 조각과 의미를 직접 읽는 것이 학습 근거라서 장식 이미지보다 DOM 카드가 적합함

## 점검 경로와 시뮬레이션 결정

의존성 preflight는 `ready`였습니다. 현재 런타임에서 `ui-ux-pro-max`는 `filesystem-only`였으므로 첫 runtime-available 경로인 `design-system`을 선택했습니다.

```text
route=design-system
observed-statuses=ui-ux-pro-max:filesystem-only; design-system:runtime-available; impeccable:runtime-available; product-design:audit:runtime-available; design-review:runtime-available; qa:runtime-available
action=continue
fallback-reason=앞선 후보가 현재 턴에 runtime-available이 아니어서 첫 runtime fallback인 design-system을 선택했습니다.
```

이 앱은 시간에 따라 변하는 수치나 물리 현상을 탐구하는 도구가 아니라 문장 조각·변화 종류·근거·전달문을 고르는 활동입니다. 따라서 별도 Canvas/WebGL 시뮬레이션은 `not-needed`로 기록했고, 예측→조작→관찰→설명은 기존 DOM 선택과 즉시 피드백으로 유지했습니다. 자세한 결정은 [계획 문서의 시뮬레이션 결정](./2026-08-31-elementary-ux-plan.md)에 남겼습니다.

## 기준선 → 개선 결과

| 확인 지점 | 기준선 | 구현 후 확인 |
| --- | --- | --- |
| 320×800 시작 | `연습 시작` y=828로 첫 화면 밖 | 버튼 y=680~732로 첫 화면 안, 가로 넘침 없음(`scrollWidth=320`, `clientWidth=320`) |
| 320px 연습 | 풀이 카드가 먼저 길게 나와 첫 선택이 y=1323 이후 | `지금 할 일` y=290, 선택 그룹 y=423, 대상 카드 y=819, 대상 조각 y=933 |
| 320px 비교 | “두 문장에서”라고 안내하지만 실제 판정은 한쪽 조각 | “이전/다음 문장에서 사라진/달라진 말 하나”와 실제 조각을 함께 표시하고 대상 카드·조각에 `gi-pulse` 적용 |
| 안전 전달문 | 불완전 문장+안전 문장 조합이 합집합 검사로 통과 | 선택 문장을 개별 검증하여 혼합 조합은 완료 버튼 비활성, 잘못 고른 문장을 다시 눌러 취소하도록 안내 |
| 375×812 시작 | CTA가 화면 아래에 걸릴 가능성 | 버튼 y=645.94~697.94, 가로 넘침 없음(`scrollWidth=375`, `clientWidth=375`) |
| 1280×900 시작 | 긴 제목과 소개가 핵심 행동을 늦춤 | 짧은 제목·소개, CTA y=574.52~626.52, 가로 넘침 없음 |

## 구현 내용

1. `app/components/selectionGuidance.ts`를 추가해 아직 해결하지 않은 변화의 종류에 따라 선택해야 할 쪽과 실제 문장 조각을 계산합니다.
2. [Compare.tsx](../app/components/Compare.tsx)와 [WelcomeTutorial.tsx](../app/components/WelcomeTutorial.tsx)에서 `지금 할 일`을 상태별 한 행동으로 표시하고, 대상 카드에는 “여기서 찾아요”를 붙였습니다.
3. `MessageCard`에 선택 대상 스타일과 `gi-pulse`를 연결했습니다. 선택한 버튼은 `pressed` 상태만 남아 펄스가 멈춥니다.
4. 비교 카드를 긴 풀이 도움말보다 먼저 배치하고, [SolutionGuide.tsx](../app/components/SolutionGuide.tsx)의 설명을 짧은 초등학생용 문장으로 조정했습니다.
5. [Outcome.tsx](../app/components/Outcome.tsx)의 릴레이 화면에서 선택된 각 문장을 따로 검증합니다. 하나라도 중요한 뜻이 빠지거나 원문에 없던 뜻을 더하면 `활동 마치기`를 잠급니다.
6. [ux-improvements.css](../app/styles/ux-improvements.css)에 primitive→semantic→component 토큰을 추가하고 대상 카드·조각 강조와 모바일 시작 화면 여백을 조정했습니다.
7. [InfoDialog.tsx](../app/components/InfoDialog.tsx)의 업데이트 내역에 2026-08-31 기록을 추가했습니다.
8. 새 브라우저 회귀 테스트 [elementary-ux.spec.ts](../e2e/elementary-ux.spec.ts)를 추가해 모바일 CTA/선택 대상과 혼합 릴레이 차단을 고정했습니다.

## 자동화·브라우저 검증

| 명령/확인 | 결과 |
| --- | --- |
| `npm run typecheck` | 통과 |
| `npm run lint` | 통과 |
| `npm test` | 30개 통과 (빌드 포함) |
| `npm run build:pages` | 통과, `dist-pages` 생성 |
| `npm run test:e2e` | 17개 통과 (기존 15 + 새 UX 회귀 2) |
| 로컬 production 브라우저 320/375/1280px | 위 표의 위치·넘침 수치 확인 |
| 콘솔 오류 | 0건 |
| `prefers-reduced-motion` | 기존 reduced-motion 규칙으로 애니메이션을 끄고 `gi-pulse` 고정 외곽선 유지 |

브라우저 흐름은 시작→연습→사건 1 비교 2회→전체 변화→전달문→결과/완료 기록, 5~6학년 예정/확정 사례, 사건 5의 안전 문장 2개 조합, 키보드·뒤로가기·선택 복구까지 다시 실행했습니다. 실제 학생이 참여한 교실 관찰이 아니라 자동화와 초등학생 페르소나를 사용한 simulated learner panel이므로, 다음 수업에서 3~4학년 학생에게 “어느 문장을 왜 눌렀는지” 자기 말로 설명하게 하는 후속 확인이 남아 있습니다.

## 수용 게이트

- P0: 0건
- P1: 기준선의 2건(선택 지시 불일치, 혼합 릴레이 통과) 해결
- 핵심 CTA: 320/375/1280px에서 첫 화면에 보임
- 핵심 조작: 대상 문장·조각에 `gi-pulse`, 비활성 다음/완료 버튼에는 펄스 없음
- 회복: 오답 피드백, `고른 것 지우기`, 잘못된 전달문 재클릭 취소 제공
- 안전: 개인정보 입력·저장 기능을 추가하지 않음

## 릴리스 확인

- 커밋: [`9c392930`](https://github.com/WBmaker2/information-loss-communication-station/commit/9c3929308230d453024e0eda8340d752855fcfb2)
- GitHub Actions Pages: [실행 33395412230](https://github.com/WBmaker2/information-loss-communication-station/actions/runs/33395412230) — `build`와 `deploy` 모두 성공
- 공개 앱: [정보 손실 통신소](https://wbmaker2.github.io/information-loss-communication-station/)
- 공개 learner path: 320×800에서 시작→연습→사건 1 비교 2회→안전 전달문→완료 기록 흐름을 통과했고, `scrollWidth=320`, 콘솔 오류 0건, JS/CSS 자산 응답 200을 확인함

다음 수업에서 실제 3~4학년 학생에게 “어느 문장을 왜 눌렀는지” 자기 말로 설명하게 하는 후속 확인은 별도로 남아 있습니다.
