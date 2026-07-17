# 테스트 기록

## 2026-07-18 · v0.3.0 최종 리뷰 보완

- RED: 비교 화면에서 `뜻이 바뀜`을 고르고 문장·이유·오답 피드백을 만든 뒤 `고른 것 지우기`를 누르는 E2E가 실패했습니다. 기존 `resetAnswer`가 변화 종류까지 `내용이 빠짐`으로 되돌렸습니다.
- GREEN: 비교 전용 `clearCurrentSelection`으로 문장·이유·피드백만 비우고 변화 종류는 유지하도록 보완했습니다. 연습 과다 선택 E2E도 실제 `내 답 확인` 뒤 `말을 너무 많이 골랐어요. 달라진 말만 남겨 보세요.`를 확인하고, 지운 뒤 선택과 피드백이 모두 비는지 검증합니다.
- `npm test`(30개), `npm run typecheck`, `npm run lint`, `npm run build`와 선택 복구 Chromium E2E 3개가 통과했습니다. 전체 Chromium E2E 14개 재실행은 제품 검증 전에 현재 실행 환경의 Chromium MachPort 권한 오류로 시작하지 못해 루트 재검증 대상으로 남겼습니다.
- 390×844 production 최종 결과 증거는 기존 `docs/screenshots/v0.3.0/result-mobile.png`를 유지하면서, 캐시와 구분되는 [result-mobile-final.png](screenshots/v0.3.0/result-mobile-final.png)로 별도 보존했습니다. viewport `[390, 844]`, `scrollWidth` 390, 결과 높이 996, scroll `[0, 0]`에서 wordmark·관리 버튼·활동/사건 배지·1~5 단계·결과 제목이 모두 보입니다.

## 2026-07-18 · v0.3.0 릴리스 회귀

- RED: 기존 전체 Chromium E2E를 실행해 이전 오답 피드백 문구 기대와 네이티브 체크박스의 18px 크기 검사에서 실패를 확인했습니다. 소스 점검에서 사건 5의 이전 제목 selector도 현재 학생용 제목으로 갱신했습니다.
- GREEN: 새 피드백 문구와 `가상 학교 방송 이어 전하기` selector로 맞추고, 실제 44px 터치 영역인 레이블을 검사하도록 갱신했습니다. 최종 `npm run test:e2e -- --reporter=line`: Chromium 13개 통과(9.2초). 사건 1, 결과 화면 스크롤 복구, 쉬운 표현 금지 검사, 사건 4·5, 선택 복구, 뒤로가기, axe 심각도, reduced-motion, 360px·390px 가로 넘침, 200% 확대, 키보드, 저장소·쿠키 없음, 동일 출처 요청을 확인했습니다.
- `npm test`: build와 Node 테스트 30개 통과.
- `npm run typecheck`: 통과.
- `npm run lint`: 통과.
- `npm run build`: 통과.
- 390×844 production 최종 캡처를 `docs/screenshots/v0.3.0/compare-mobile.png`, `docs/screenshots/v0.3.0/result-mobile.png`에 새로 저장했습니다. 결과 화면의 상단 16px 이상 안전 여백 안에 wordmark·관리 버튼·활동/사건 상태·5단계 진행·결과 제목이 모두 보입니다.
- RED: 첫 결과 캡처의 스크롤 잔존을 재현하는 E2E와 학생 화면 금지 표현 검사를 먼저 추가했습니다. GREEN: `view` 또는 `transition`이 바뀌면 화면 맨 위로 되돌리도록 보완했습니다. 최종 결과 지표는 viewport `[390, 844]`, `scrollWidth` 390, 결과 높이 996, scroll `[0, 0]`입니다.

## 2026-07-17

- RED: 제품 수용 테스트로 교체한 뒤 기존 Sites 스켈레톤 화면에서 제목과 제품 컴포넌트 부재로 실패를 확인했습니다.
- GREEN: 제품 UI 구현 뒤 `npm test`의 서버 렌더링 및 starter 제거 검사를 통과했습니다.

## 2026-07-17 · 최종 보완

- RED: `./node_modules/.bin/tsx --test tests/domain.test.ts tests/progress.test.ts tests/records.test.ts`에서 이전 문장 빠짐 선택이 오답 처리되고, 다음 문장/과다 선택이 정답 처리되며, 완료 기록 모듈이 없어 실패했습니다.
- GREEN: 엄격한 변화별 표현·근거 판정과 기록 모듈을 구현한 뒤 도메인·진행·기록 테스트 22개가 통과했습니다.
- `npm test`: build와 도메인·진행·기록·렌더·튜토리얼 테스트 25개 통과.
- `npm run typecheck`: 통과.
- `npm run lint`: 통과.
- `npm run build`: 통과.
- `npm run test:e2e -- --reporter=line`: 통과: 처음에는 `reuseExistingServer: true`가 4173 포트의 다른 앱을 재사용해 시작 버튼을 찾지 못했습니다. 전용 43817 포트와 production 서버, 재사용 금지로 분리한 뒤 최종 4개 E2E가 6.5초에 통과했습니다. 안내 활동의 뜻 유지 오답 잠금·두 단계 완료, 사건 1의 우천 조건 누락 전달문 거부와 결과·보존 기록 완주, 5~6학년의 예정→확정 복구, 사건 5의 두 유효 안전 전달문, Tab·Enter·Space, axe, reduced-motion, 200% page scale, 360px overflow, 저장소/cookie, 동일 출처 요청을 확인했습니다.
- `git diff --check`: 통과.

## 2026-07-17 · v0.2.0 기능·디자인 개선

- 5단계 진행 표시의 `aria-current="step"`, 한국어 매체명, 비교 화면 1·2·3 안내, 44px 터치 목표와 390px 가로 넘침을 검증하는 E2E 회귀 테스트를 추가했습니다.
- `npm test`: build와 도메인·진행·기록·렌더·튜토리얼 테스트 26개 통과.
- `npm run typecheck`, `npm run lint`: 통과.
- Chromium E2E: 표준 production webServer(43817)에서 6개 통과. 동일 출처 검사는 실행 주소를 기준으로 유지했습니다.
- 1440×1000, 390×844 비교 화면 스크린샷으로 모바일 헤더 2영역, 단계 표시, 1·2·3 행동 안내, 한국어 매체명과 가로 넘침 없음을 확인했습니다.
- 독립 리뷰 보완: 사건 개요의 한국어 매체명과 안내 활동 표현 카드의 1번 그룹을 확인하는 E2E 회귀 테스트를 추가해 통과했습니다.
