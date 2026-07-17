# 테스트 기록

## 2026-07-18 · v0.3.0 릴리스 회귀

- RED: 기존 전체 Chromium E2E를 실행해 이전 오답 피드백 문구 기대와 네이티브 체크박스의 18px 크기 검사에서 실패를 확인했습니다. 소스 점검에서 사건 5의 이전 제목 selector도 현재 학생용 제목으로 갱신했습니다.
- GREEN: 새 피드백 문구와 `가상 학교 방송 이어 전하기` selector로 맞추고, 실제 44px 터치 영역인 레이블을 검사하도록 갱신했습니다. `npm run test:e2e -- --reporter=line`: Chromium 11개 통과(9.4초). 사건 1, 사건 4·5, 선택 복구, 뒤로가기, axe 심각도, reduced-motion, 360px·390px 가로 넘침, 200% 확대, 키보드, 저장소·쿠키 없음, 동일 출처 요청을 확인했습니다.
- `npm test`: build와 Node 테스트 29개 통과.
- `npm run typecheck`: 통과.
- `npm run lint`: 통과.
- `npm run build`: 통과.
- 390×844 production Chromium 캡처는 루트 권한 브라우저에서 성공했고, 비교 화면의 `scrollWidth`가 390px임을 확인했습니다. 첫 결과 화면 캡처에서는 이전 화면의 아래 스크롤 위치가 남아 결과 제목이 잘린 문제를 발견했습니다.
- RED: 첫 결과 캡처의 스크롤 잔존을 재현하는 E2E와 학생 화면 금지 표현 검사를 먼저 추가했습니다. GREEN: `view` 또는 `transition`이 바뀌면 화면 맨 위로 되돌리도록 보완했고, 새 학생용 문구의 정적 렌더 검증 2개는 통과했습니다.
- 이 작업 환경에서는 기존 43817과 분리한 43818 모두 이미 사용 중이라 Playwright webServer가 시작 전 종료되었습니다. 새 스크롤 E2E와 최종 390×844 비교·결과 캡처는 다음 루트 검증에서 다시 실행합니다.

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
