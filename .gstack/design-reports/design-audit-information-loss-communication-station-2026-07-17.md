# 정보 손실 통신소 디자인 점검 보고서

- 점검일: 2026-07-17
- 기준 버전: v0.1.0
- 점검 화면: 1440×1000, 390×844
- 상태: 개선 구현 및 재검토 완료

## 첫인상

차분한 종이·기록실 분위기와 청록색 강조가 교육용 활동의 신뢰감을 잘 만든다. 시작 화면의 핵심 행동과 두 학년군 선택도 명확하다. 다만 모바일 상단에서 브랜드, 항로 상태, 관리 버튼이 세 줄로 흩어지고, 비교 화면은 한 페이지 안에 많은 선택이 이어져 전체 흐름과 현재 행동 순서가 약해진다.

## 발견 사항

| ID | 심각도 | 영역 | 발견 사항 | 기준 증거 |
| --- | --- | --- | --- | --- |
| FINDING-001 | P1 | 반응형 헤더 | 모바일에서 학습 상태보다 관리 버튼이 상단 공간을 크게 차지하고 정보 위계가 분산됨 | `screenshots/baseline-home-mobile.png` |
| FINDING-002 | P1 | 학습 흐름 | 사건 선택부터 결과까지 전체 단계 중 현재 위치를 보여 주는 표시가 없음 | `screenshots/baseline-mission-mobile.png`, `screenshots/baseline-compare-desktop.png` |
| FINDING-003 | P1 | 학생 언어 | 전달 매체가 `notice`, `spoken` 영어 내부값으로 노출됨 | `screenshots/baseline-compare-mobile.png` |
| FINDING-004 | P1 | 비교 활동 | 모바일의 긴 비교 화면에서 표현·변화·근거 선택 순서가 약하고 첫 제목이 어색하게 줄바꿈됨 | `screenshots/baseline-compare-mobile.png` |
| FINDING-005 | P2 | 터치 접근성 | 헤더 버튼 40~41px, 선택 레이블 39px로 44px 권장 기준보다 작음 | Playwright 자동 측정 |

## 기준 측정

- 가로 폭: 390px 화면에서 문서 폭 390px, 가로 넘침 없음
- 본문 글꼴: Apple SD Gothic Neo → Malgun Gothic → Noto Sans KR → Arial
- 비교 화면 h1: 28.8px
- 콘솔 경고·오류: 없음
- 헤더 관리 버튼: 40px
- 선택 레이블: 39px
- 라디오·체크 입력: 13px

## 기준 화면

- 시작: `screenshots/baseline-home-desktop.png`, `screenshots/baseline-home-mobile.png`
- 안내 활동: `screenshots/baseline-tutorial-desktop.png`, `screenshots/baseline-tutorial-mobile.png`
- 사건 목록: `screenshots/baseline-mission-desktop.png`, `screenshots/baseline-mission-mobile.png`
- 비교: `screenshots/baseline-compare-desktop.png`, `screenshots/baseline-compare-mobile.png`

## 구현 후 기록

| ID | 조치 | 검증 |
| --- | --- | --- |
| FINDING-001 | 모바일에서 로고·관리 버튼을 첫 줄에, 항로·사건 상태를 두 번째 줄의 상태 배지에 배치했습니다. | 390px E2E 가로 넘침 없음 및 헤더 상태 확인 |
| FINDING-002 | 사건 선택·비교·전체 점검·안전 전달·결과의 5단계 표시를 추가하고 현재 단계에 `aria-current="step"`을 적용했습니다. | 비교 화면 E2E에서 현재 ‘비교’ 단계 확인 |
| FINDING-003 | 도메인 값은 유지하고 안내문·말·메모·방송의 화면 표시 매핑을 비교와 사건 개요에 적용했습니다. | 비교·사건 개요 E2E 확인 |
| FINDING-004 | 비교와 안내 활동에 1·2·3 행동 안내와 번호가 붙은 선택 영역 제목을 추가하고, 안내 활동 표현 카드를 1번 그룹으로 묶었습니다. | 비교·안내 활동 E2E 및 390px 스크린샷 확인 |
| FINDING-005 | 헤더 관리 버튼과 선택 레이블을 44px 이상, 라디오·체크 입력을 18px으로 조정했습니다. | DOM 크기 측정 E2E 통과 |

- 회귀 검증: `npm test` 26개, `npm run typecheck`, `npm run lint`, 표준 production webServer(43817)의 Chromium E2E 6개 모두 통과했습니다.
- 개선 화면: `screenshots/after-home-desktop.png`, `screenshots/after-home-mobile.png`, `screenshots/after-tutorial-desktop.png`, `screenshots/after-compare-desktop.png`, `screenshots/after-compare-mobile.png`.
- 최종 자동 측정: 390px 화면에서 문서 폭 390px, 헤더 버튼·선택 레이블 최소 44px, 영어 매체명 노출 0건, 현재 단계 `aria-current="step"` 확인, 콘솔 경고·오류 0건.

## 최종 평가

| 항목 | 개선 전 | 개선 후 |
| --- | ---: | ---: |
| 시각적 위계 | 7/10 | 8/10 |
| 모바일 사용성 | 6/10 | 9/10 |
| 학습 방향 안내 | 6/10 | 9/10 |
| 학생용 언어 | 7/10 | 9/10 |
| 접근성 | 8/10 | 9/10 |

FINDING-001~005는 모두 해결되었고, 별도 구현자와 독립 검토자의 재검토를 통과했습니다.
