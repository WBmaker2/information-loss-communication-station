# Task 1 Implementer Report

Status: DONE

- RED: `npm_config_cache=/tmp/codex-npm-cache npm exec -- tsx --test tests/domain.test.ts`에서 새 피드백 및 5~6학년 풀이 테스트 2개 실패 확인.
- GREEN: 같은 명령 19/19 통과.
- 전체: `npm_config_cache=/tmp/codex-npm-cache npm test` 28/28 통과.
- 추가: `npm run typecheck`, `git diff --check` 통과.
- 자체 검토: 단계 연결, 빈 선택, 과다 선택, 종류 불일치, 정답, 기타 오답 순서와 중복 선택 정답 보존, ID 및 matchingChangeIds 유지 확인.
- 커밋: `e178229 feat: simplify learner vocabulary and feedback`
- 변경: `domain/judge.ts`, `domain/cases.ts`, `app/components/shared.ts`, `app/components/WelcomeTutorial.tsx`, `app/CommunicationStation.tsx`, `tests/domain.test.ts`, `tests/rendered-html.test.mjs`.
- 브라우저 시각 검증은 최종 통합 단계에서 수행 예정.

## Fix Report

### Review fixes

- 문장 선택 또는 이유 선택 중 하나라도 비어 있으면, 빈 선택 안내를 반환하도록 보완했습니다.
- 종류 불일치는 문장과 이유가 같은 후보 변화에 맞고 변화 종류만 다를 때에만 반환하도록 좁혔습니다.
- 관련 없는 문장·이유와 틀린 종류 조합은 일반 재검토 안내를 반환합니다.
- 중복 선택 허용, 기존 정답 규칙, 사건 ID와 `matchingChangeIds`는 유지했습니다.
- 재검토 응답 생성과 도달 불가 중복 분기를 `needsReview`와 후보 답안 필터로 정리했습니다.

### TDD and verification

- RED: `npm_config_cache=/tmp/codex-npm-cache npm exec -- tsx --test tests/domain.test.ts`에서 문장만 고르고 이유가 빈 새 테스트가 실패하는 것을 확인했습니다.
- GREEN: 같은 명령 19/19 통과.
- 전체: `npm_config_cache=/tmp/codex-npm-cache npm test` 28/28 통과.
- 추가: `npm run typecheck`, `git diff --check` 통과.
