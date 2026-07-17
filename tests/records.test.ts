import assert from "node:assert/strict";
import test from "node:test";

import { buildCompletedRecord, findingsByType } from "../app/records.js";
import { TRANSMISSION_CASES } from "../domain/index.js";

test("완료 기록은 학습자가 확인한 변화와 안전 전달문을 보존한다", () => {
  const item = TRANSMISSION_CASES[0];
  const change = item.expectedChanges[0];
  const record = buildCompletedRecord(item, [{
    changeId: change.id,
    type: change.type,
    selectedSegmentIds: change.sourceSegmentIds,
    selectedEvidenceMeaningIds: change.meaningUnitIds,
  }], [item.relayOptions[0].id]);
  assert.equal(record.firstChangedId, "case-1-board-omission");
  assert.deepEqual(record.selectedRelayOptionIds, [item.relayOptions[0].id]);
  assert.equal(findingsByType(record.findings).omission.length, 1);
  assert.equal(findingsByType(record.findings)["meaning-shift"].length, 0);
});
