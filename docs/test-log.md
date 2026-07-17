# 테스트 기록

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
