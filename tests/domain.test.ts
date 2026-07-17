import assert from "node:assert/strict";
import test from "node:test";

import {
  TUTORIAL_CASE,
  TRANSMISSION_CASES,
  calculateMeaningLedger,
  judgeStageChange,
  validateCaseContent,
  validateSafeRelay,
} from "../domain/index.js";

const allCases = [TUTORIAL_CASE, ...TRANSMISSION_CASES];

test("검수된 안내 활동과 고정 사건은 참조 ID 및 단계 규칙을 만족한다", () => {
  assert.equal(TRANSMISSION_CASES.length, 5);
  assert.deepEqual(
    new Set(TRANSMISSION_CASES.flatMap((item) => item.availableRoutes)),
    new Set(["grade-3-4", "grade-5-6"]),
  );

  for (const item of allCases) {
    assert.deepEqual(validateCaseContent(item), { valid: true, errors: [] });
  }
});

test("인접하지 않은 단계를 비교하면 학생 오답이 아닌 콘텐츠 입력 오류로 돌려준다", () => {
  const item = TRANSMISSION_CASES[0];
  const change = item.expectedChanges[0];

  const result = judgeStageChange(item, {
    fromStageId: item.stages[0].id,
    toStageId: item.stages[2].id,
    selectedSegmentIds: change.targetSegmentIds,
    changeType: change.type,
    evidenceMeaningUnitIds: change.meaningUnitIds,
  });

  assert.equal(result.status, "invalid-content");
  assert.equal(result.isCorrect, false);
});

test("답안 상태에 따라 학생이 고칠 수 있는 피드백을 돌려준다", () => {
  const item = TRANSMISSION_CASES[0];
  const change = item.expectedChanges.find(({ type }) => type === "omission")!;
  const answer = {
    fromStageId: change.fromStageId,
    toStageId: change.toStageId,
    changeType: change.type,
    evidenceMeaningUnitIds: change.meaningUnitIds,
  };

  const empty = judgeStageChange(item, { ...answer, selectedSegmentIds: [] });
  assert.equal(empty.feedback, "먼저 달라진 말을 하나 고르고, 그 이유도 골라 보세요.");
  assert.deepEqual(empty.matchingChangeIds, [change.id]);

  const tooMany = judgeStageChange(item, {
    ...answer,
    selectedSegmentIds: [...change.sourceSegmentIds, ...change.targetSegmentIds],
  });
  assert.equal(tooMany.feedback, "말을 너무 많이 골랐어요. 달라진 말만 남겨 보세요.");
  assert.deepEqual(tooMany.matchingChangeIds, [change.id]);

  const wrongType = judgeStageChange(item, {
    ...answer,
    selectedSegmentIds: change.sourceSegmentIds,
    changeType: "meaning-shift",
  });
  assert.equal(wrongType.feedback, "고른 말은 다시 살펴볼 수 있어요. 어떻게 달라졌는지 한 번 더 생각해 보세요.");
  assert.deepEqual(wrongType.matchingChangeIds, [change.id]);

  const correct = judgeStageChange(item, {
    ...answer,
    selectedSegmentIds: change.sourceSegmentIds,
  });
  assert.equal(correct.feedback, "잘 찾았어요. 고른 말과 이유가 서로 맞아요.");
  assert.deepEqual(correct.matchingChangeIds, [change.id]);
});

test("5~6학년 사건의 예정과 확정에는 처음부터 쉬운 풀이가 붙는다", () => {
  const schedule = TRANSMISSION_CASES.find(({ id }) => id === "case-4-afterschool-schedule")!;
  const broadcast = TRANSMISSION_CASES.find(({ id }) => id === "case-5-broadcast-handover")!;

  assert.equal(schedule.title, "방과 후 일정은 아직 예정(아직 바뀔 수 있음)");
  assert.equal(schedule.meaningUnits.find(({ id }) => id === "case-4-planned")?.studentLabel, "예정(아직 바뀔 수 있음)");
  assert.equal(schedule.meaningUnits.find(({ id }) => id === "case-4-confirmed")?.studentLabel, "확정(이제 정해짐)");
  assert.equal(broadcast.title, "가상 학교 방송 이어 전하기");
  assert.equal(broadcast.purpose, "방송 내용을 이어 전할 때, 어떤 때인지와 시간을 빠뜨리지 않아요.");
});

test("빠진 의미는 omission으로 판정한다", () => {
  const item = TRANSMISSION_CASES[0];
  const change = item.expectedChanges.find(({ type }) => type === "omission")!;

  const result = judgeStageChange(item, {
    fromStageId: change.fromStageId,
    toStageId: change.toStageId,
    selectedSegmentIds: change.sourceSegmentIds,
    changeType: "omission",
    evidenceMeaningUnitIds: change.meaningUnitIds,
  });

  assert.equal(result.status, "correct");
  assert.equal(result.isCorrect, true);
});

test("빠짐에서 다음 문장의 그대로인 조각이나 관련 없는 조각을 고르면 막는다", () => {
  const item = TRANSMISSION_CASES[0];
  const change = item.expectedChanges.find(({ type }) => type === "omission")!;
  for (const selectedSegmentIds of [change.targetSegmentIds, [...change.sourceSegmentIds, ...change.targetSegmentIds]]) {
    assert.equal(judgeStageChange(item, {
      fromStageId: change.fromStageId,
      toStageId: change.toStageId,
      selectedSegmentIds,
      changeType: change.type,
      evidenceMeaningUnitIds: change.meaningUnitIds,
    }).isCorrect, false);
  }
});

test("변화 근거에는 그 변화의 뜻만 고를 수 있다", () => {
  const item = TRANSMISSION_CASES[0];
  const change = item.expectedChanges.find(({ type }) => type === "omission")!;
  assert.equal(judgeStageChange(item, {
    fromStageId: change.fromStageId,
    toStageId: change.toStageId,
    selectedSegmentIds: change.sourceSegmentIds,
    changeType: change.type,
    evidenceMeaningUnitIds: [...change.meaningUnitIds, "case-1-time"],
  }).isCorrect, false);
});

test("근거 없는 불이익 정보는 unsupported-addition으로 판정한다", () => {
  const item = TRANSMISSION_CASES[1];
  const change = item.expectedChanges.find(
    ({ type }) => type === "unsupported-addition",
  )!;

  const result = judgeStageChange(item, {
    fromStageId: change.fromStageId,
    toStageId: change.toStageId,
    selectedSegmentIds: change.targetSegmentIds,
    changeType: "unsupported-addition",
    evidenceMeaningUnitIds: change.meaningUnitIds,
  });

  assert.equal(result.status, "correct");
});

test("수량 또는 범위가 달라지면 같은 낱말이 남아도 meaning-shift로 판정한다", () => {
  const item = TRANSMISSION_CASES[2];
  const change = item.expectedChanges.find(
    ({ type }) => type === "meaning-shift",
  )!;

  const result = judgeStageChange(item, {
    fromStageId: change.fromStageId,
    toStageId: change.toStageId,
    selectedSegmentIds: change.targetSegmentIds,
    changeType: "meaning-shift",
    evidenceMeaningUnitIds: change.meaningUnitIds,
  });

  assert.equal(result.status, "correct");
});

test("문자열이 달라도 의미 ID 집합이 같으면 meaning-preserving으로 판정한다", () => {
  const item = TRANSMISSION_CASES[1];
  const change = item.expectedChanges.find(
    ({ type }) => type === "meaning-preserving",
  )!;

  const result = judgeStageChange(item, {
    fromStageId: change.fromStageId,
    toStageId: change.toStageId,
    selectedSegmentIds: change.targetSegmentIds,
    changeType: "meaning-preserving",
    evidenceMeaningUnitIds: change.meaningUnitIds,
  });

  assert.equal(result.status, "correct");
});

test("선택 순서와 중복은 변화 판정에 영향을 주지 않는다", () => {
  const item = TRANSMISSION_CASES[0];
  const change = item.expectedChanges[0];
  const segmentIds = change.type === "omission" ? change.sourceSegmentIds : change.targetSegmentIds;
  const selection = [...segmentIds, ...segmentIds].reverse();
  const evidence = [...change.meaningUnitIds, ...change.meaningUnitIds].reverse();

  const result = judgeStageChange(item, {
    fromStageId: change.fromStageId,
    toStageId: change.toStageId,
    selectedSegmentIds: selection,
    changeType: change.type,
    evidenceMeaningUnitIds: evidence,
  });

  assert.equal(result.status, "correct");
});

test("사건 5의 서로 다른 안전 전달문 조합을 모두 인정한다", () => {
  const item = TRANSMISSION_CASES[4];
  const validOptions = item.relayOptions.filter((option) =>
    validateSafeRelay(item, [option.id]).valid,
  );

  assert.ok(validOptions.length >= 2);
  for (const option of validOptions.slice(0, 2)) {
    assert.equal(validateSafeRelay(item, [option.id, option.id]).valid, true);
  }
});

test("사건 1의 우천 조건 없는 전달문은 의도된 오답이며 콘텐츠 오류가 아니다", () => {
  const item = TRANSMISSION_CASES[0];
  const unsafe = item.relayOptions.find(
    (option) => option.id === "case-1-unsafe-no-rain",
  )!;

  assert.deepEqual(validateCaseContent(item), { valid: true, errors: [] });
  const result = validateSafeRelay(item, [unsafe.id]);
  assert.equal(result.valid, false);
  assert.deepEqual(result.missingMeaningUnitIds, ["case-1-rain"]);
  assert.deepEqual(result.unsupportedMeaningIds, []);
});

test("필수 의미가 모두 있어도 근거 없는 의미가 하나면 안전 전달문을 막는다", () => {
  const item = TRANSMISSION_CASES[1];
  const valid = item.relayOptions.find((option) =>
    validateSafeRelay(item, [option.id]).valid,
  )!;
  const unsafe = item.relayOptions.find(
    (option) => option.unsupportedMeaningIds.length > 0,
  )!;

  const result = validateSafeRelay(item, [valid.id, unsafe.id]);
  assert.equal(result.valid, false);
  assert.deepEqual(result.unsupportedMeaningIds, unsafe.unsupportedMeaningIds);
});

test("안전 전달문 메타데이터가 비어 있어도 원문에 없는 의미를 막는다", () => {
  const item = structuredClone(TRANSMISSION_CASES[1]);
  const valid = item.relayOptions.find((option) => option.id === "case-2-safe")!;
  valid.meaningUnitIds.push("case-2-penalty");

  const result = validateSafeRelay(item, [valid.id]);
  assert.equal(result.valid, false);
  assert.deepEqual(result.unsupportedMeaningIds, ["case-2-penalty"]);
});

test("의미 장부는 원문과 비교해 보존, 누락, 추가를 계산한다", () => {
  const item = TRANSMISSION_CASES[4];
  const finalLedger = calculateMeaningLedger(item).at(-1)!;

  assert.ok(finalLedger.omittedMeaningUnitIds.includes("case-5-condition"));
  assert.ok(finalLedger.addedMeaningUnitIds.includes("case-5-flashlight"));
  assert.ok(finalLedger.preservedMeaningUnitIds.includes("case-5-source"));
});

test("잘못된 단계 순서는 콘텐츠 오류로 검출한다", () => {
  const invalid = structuredClone(TRANSMISSION_CASES[0]);
  invalid.stages[1].order = 4;

  const result = validateCaseContent(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("stage-order")));
});

test("존재하지 않는 바꾸어 쓰기 조각 참조는 콘텐츠 오류로 검출한다", () => {
  const invalid = structuredClone(TRANSMISSION_CASES[0]);
  invalid.meaningUnits[0].allowedParaphraseIds.push("missing-phrase");

  const result = validateCaseContent(invalid);
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.includes(
      "unknown-allowed-paraphrase:case-1-time:missing-phrase",
    ),
  );
});

test("존재하지 않는 전달 대상 참조는 콘텐츠 오류로 검출한다", () => {
  const invalid = structuredClone(TRANSMISSION_CASES[0]);
  invalid.relayOptions[0].validForAudienceIds.push("missing-audience");

  const result = validateCaseContent(invalid);
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.includes("unknown-relay-audience:case-1-safe-basic:missing-audience"),
  );
});
