import assert from "node:assert/strict";
import test from "node:test";

import {
  canAdvanceTransition,
  clearCaseSession,
  firstChangedStageChange,
  resolvedChangeIdsForAnswer,
} from "../app/progress.js";
import { TRANSMISSION_CASES, judgeStageChange } from "../domain/index.js";

const caseTwo = TRANSMISSION_CASES[1];
const caseFive = TRANSMISSION_CASES[4];

test("한 인접 전이의 모든 변화가 해결되기 전에는 다음으로 갈 수 없다", () => {
  const transition = 1;
  const expected = caseFive.expectedChanges.filter(
    (change) => change.fromStageId === caseFive.stages[transition].id,
  );
  assert.equal(expected.length, 3);
  assert.equal(canAdvanceTransition(caseFive, transition, []), false);
  assert.equal(canAdvanceTransition(caseFive, transition, [expected[0].id]), false);
  assert.equal(canAdvanceTransition(caseFive, transition, expected.map(({ id }) => id)), true);
});

test("올바른 답만 정확한 변화 ID를 해결하고, 같은 표현의 다른 변화도 각각 확인한다", () => {
  const transition = 1;
  const change = caseFive.expectedChanges.find(({ id }) => id === "case-5-time-shift")!;
  const answer = {
    fromStageId: caseFive.stages[transition].id,
    toStageId: caseFive.stages[transition + 1].id,
    selectedSegmentIds: change.targetSegmentIds,
    changeType: change.type,
    evidenceMeaningUnitIds: change.meaningUnitIds,
  };
  const judgement = judgeStageChange(caseFive, answer);
  assert.deepEqual(resolvedChangeIdsForAnswer(caseFive, transition, answer, judgement.isCorrect), [change.id]);
  assert.deepEqual(resolvedChangeIdsForAnswer(caseFive, transition, answer, false), []);
});

test("사건 초기화는 현재 사건과 답안·전달문을 함께 비운다", () => {
  assert.deepEqual(clearCaseSession(), {
    caseId: null,
    transition: 0,
    segments: [],
    evidence: [],
    relay: [],
  });
});

test("첫 변화는 뜻 유지가 아닌 첫 변화로 찾는다", () => {
  assert.equal(firstChangedStageChange(caseTwo)?.id, "case-2-penalty-addition");
  assert.equal(firstChangedStageChange(caseFive)?.id, "case-5-condition-omission");
});
