import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Result } from "../app/components/Outcome.js";
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

test("결과 요약은 찾은 변화만 보여 주고 이유를 표시한다", () => {
  const item = TRANSMISSION_CASES[0];
  const change = item.expectedChanges[0];
  const html = renderToStaticMarkup(createElement(Result, {
    item,
    relay: [item.relayOptions[0].id],
    findings: [{
      changeId: change.id,
      type: change.type,
      selectedSegmentIds: change.sourceSegmentIds,
      selectedEvidenceMeaningIds: change.meaningUnitIds,
    }],
    onNext: () => {},
    onArchive: () => {},
  }));

  assert.match(html, /처음 달라진 곳/);
  assert.match(html, /다시 넣은 중요한 내용/);
  assert.match(html, /내가 고른 문장/);
  assert.match(html, /내가 찾은 변화/);
  assert.match(html, /이유:/);
  assert.doesNotMatch(html, /근거:/);
  assert.doesNotMatch(html, /확인한 변화가 없어요/);
  assert.equal((html.match(/<article/g) ?? []).length, 1);
});
