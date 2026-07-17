# 정보 손실 통신소 기능·디자인 개선 계획

- 작성일: 2026-07-17
- 대상 버전: v0.1.0 → v0.2.0
- 기준 화면: 로컬 production-equivalent UI, 1440×1000 및 390×844
- 범위 승인: 사용자의 “분석 후 개선하고 구현까지 마무리” 요청에 따라 이 계획을 확정하고 구현·검증·배포까지 진행한다.

## 1. 점검 요약

현재 앱은 두 학년군, 안내 활동, 5개 사건, 의미 변화 판정, 안전 전달문과 결과 기록까지 학습 흐름이 완성되어 있다. 색상 대비, 키보드 이동, 360px 가로 넘침 방지와 개인정보 비저장 원칙도 갖추었다.

다만 모바일에서 상단 정보 구조와 긴 비교 활동의 방향 안내가 약하고, 내부 전달 매체 값이 영어로 노출되며, 일부 선택 영역의 터치 높이가 44px보다 작다. 학생이 “지금 어디에 있고 무엇을 해야 하는지”를 더 빨리 이해하도록 아래 항목을 개선한다.

## 2. 발견 사항과 구현 계획

### FINDING-001 · 모바일 상단 정보 위계가 흩어짐

- 근거: `baseline-home-mobile.png`, `baseline-compare-mobile.png`
- 현상: 로고, 학년 항로, 교사용 버튼이 각각 한 줄씩 놓여 실제 학습 상태보다 관리 버튼이 먼저 눈에 들어온다.
- 개선:
  - 모바일 헤더를 로고/관리 버튼 한 줄과 항로·사건 상태 한 줄로 재배치한다.
  - 관리 버튼은 44px 이상 터치 높이를 유지한다.
  - 현재 항로·사건 상태를 작은 상태 배지로 묶는다.

### FINDING-002 · 전체 학습 흐름에서 현재 단계가 보이지 않음

- 근거: `baseline-mission-mobile.png`, `baseline-compare-desktop.png`
- 현상: 비교 내부의 1/2 표시는 있지만 사건 선택 → 비교 → 전체 점검 → 안전 전달 → 결과 중 현재 위치를 알기 어렵다.
- 개선:
  - 사건 활동 화면 위에 5단계 진행 표시를 추가한다.
  - 현재 단계는 색과 `aria-current="step"`으로 함께 표시한다.
  - 안내 활동은 별도의 “연습” 상태로 표시하고 사건 흐름과 섞지 않는다.

### FINDING-003 · 전달 매체 내부값이 영어로 노출됨

- 근거: `baseline-compare-desktop.png`, `baseline-compare-mobile.png`
- 현상: 초등학생 화면에 `notice`, `spoken`이 그대로 나타난다.
- 개선:
  - `notice`, `spoken`, `memo`, `broadcast`를 각각 `안내문`, `말`, `메모`, `방송`으로 표시한다.
  - 도메인 값은 바꾸지 않고 화면 표시만 변환해 기존 판정 로직을 보존한다.

### FINDING-004 · 비교 활동의 선택 순서가 긴 화면에서 약해짐

- 근거: `baseline-compare-mobile.png`
- 현상: 문장, 뜻 장부, 변화 현황, 세 선택 영역이 길게 이어져 “표현 → 변화 종류 → 근거 뜻” 순서를 놓치기 쉽다. 첫 선택 영역 제목도 모바일에서 어색하게 줄바꿈된다.
- 개선:
  - 비교 화면에 짧은 3단계 행동 안내를 추가한다.
  - 선택 영역 제목을 짧고 직접적인 학생 언어로 바꾼다.
  - 각 영역에 1·2·3 번호를 표시한다.

### FINDING-005 · 일부 선택 영역이 권장 터치 크기보다 작음

- 근거: 자동 측정에서 헤더 버튼 40~41px, 라디오/체크 레이블 39px
- 개선:
  - 헤더 버튼과 라디오/체크 레이블의 최소 높이를 44px 이상으로 조정한다.
  - 실제 입력 요소도 18px 이상으로 키우고 레이블 전체를 누를 수 있게 유지한다.

## 3. 구현 파일 계획

- `app/CommunicationStation.tsx`: 화면 단계 정보를 진행 표시 컴포넌트에 전달
- `app/components/WorkflowProgress.tsx`: 학습 단계 표시 신규 컴포넌트
- `app/components/Compare.tsx`: 한국어 전달 매체, 3단계 행동 안내, 짧은 영역 제목
- `app/components/WelcomeTutorial.tsx`: 안내 활동의 선택 순서 번호 정리
- `app/components/shared.ts`: 전달 매체 한국어 표시 매핑
- `app/styles/components.css`, `app/styles/responsive.css`: 헤더 위계, 단계 표시, 터치 목표, 모바일 레이아웃
- `app/components/InfoDialog.tsx`, `docs/progress.md`: v0.2.0 업데이트 내역
- `e2e/station.spec.ts`: 한국어 표시, 진행 단계, 터치 크기 회귀 검증

## 4. 완료 기준

- 390px와 360px에서 가로 스크롤이 없고 상단 정보가 두 영역으로 정리된다.
- 사건 활동 중 현재 5단계 위치가 시각·스크린리더 양쪽에서 확인된다.
- 학생 화면에 `notice`, `spoken`, `memo`, `broadcast`가 노출되지 않는다.
- 비교 선택 순서가 1·2·3으로 보인다.
- 헤더 관리 버튼과 선택 레이블의 높이가 44px 이상이다.
- 기존 3~4학년·5~6학년 완주 흐름이 유지된다.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`가 통과한다.
- 개선 전·후 스크린샷과 검증 결과를 디자인 점검 보고서와 테스트 기록에 남긴다.

## 5. 구현 기록

- 구현 전: 기준 화면과 자동 측정 완료
- 구현 후: `WorkflowProgress.tsx`를 추가하고, `CommunicationStation.tsx`, `Mission.tsx`, `Compare.tsx`, `WelcomeTutorial.tsx`, `shared.ts`, 스타일, 업데이트 기록과 E2E 회귀 테스트를 개선했다.
- 검증: `npm test`(26개), `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`(6개)를 통과했다.
- 화면 확인: Chromium에서 1440×1000과 390×844 비교 화면을 확인했으며, 390px에서 가로 넘침 없이 모바일 헤더·진행 표시·행동 안내가 표시된다.
