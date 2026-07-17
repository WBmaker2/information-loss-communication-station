import assert from "node:assert/strict";
import test from "node:test";

import { TUTORIAL_CASE, judgeStageChange } from "../domain/index.js";

test("안내 활동도 정답 판정 전에는 다음 단계로 갈 수 없는 두 비교를 제공한다", () => {
  assert.equal(TUTORIAL_CASE.expectedChanges.length, 2);
  for (const change of TUTORIAL_CASE.expectedChanges) {
    const segmentIds = change.type === "omission" ? change.sourceSegmentIds : change.targetSegmentIds;
    assert.equal(judgeStageChange(TUTORIAL_CASE, {
      fromStageId: change.fromStageId,
      toStageId: change.toStageId,
      selectedSegmentIds: segmentIds,
      changeType: change.type,
      evidenceMeaningUnitIds: change.meaningUnitIds,
    }).isCorrect, true);
  }
});
