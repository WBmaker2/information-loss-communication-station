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
- `npm run test:e2e`: Chromium과 테스트는 설치·발견됐으나, 샌드박스에서는 macOS Mach 포트 권한 오류로 실행이 중단됐습니다. 비샌드박스 재시도도 테스트 시작 뒤 결과를 반환하지 않아, 실제 브라우저 통과 주장은 보류합니다.
- `git diff --check`: 통과.
