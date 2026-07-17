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
- `npm run test:e2e -- --reporter=line`: 통과: 처음에는 `reuseExistingServer: true`가 4173 포트의 다른 앱을 재사용해 시작 버튼을 찾지 못했습니다. 전용 43817 포트와 production 서버, 재사용 금지로 분리한 뒤 최종 3개 E2E가 4.9초에 통과했습니다. 사건 1의 두 빠짐부터 결과·보존 기록 완주, 5~6학년의 예정→확정 복구, 사건 5의 두 유효 안전 전달문, Tab·Enter·Space, axe, reduced-motion, 200% page scale, 360px overflow, 저장소/cookie, 동일 출처 요청을 확인했습니다.
- `git diff --check`: 통과.
