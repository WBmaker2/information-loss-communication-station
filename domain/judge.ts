import type {
  StageChange,
  StageChangeAnswer,
  StageChangeJudgement,
  TransmissionCase,
} from "./types.js";

const sameMembers = (selected: string[], required: string[]) => {
  const selectedSet = new Set(selected);
  const requiredSet = new Set(required);
  return selectedSet.size === requiredSet.size && [...requiredSet].every((id) => selectedSet.has(id));
};

export function requiredSegmentIds(change: StageChange): string[] {
  return change.type === "omission" ? change.sourceSegmentIds : change.targetSegmentIds;
}

export function judgeStageChange(
  item: TransmissionCase,
  answer: StageChangeAnswer,
): StageChangeJudgement {
  const fromStage = item.stages.find((stage) => stage.id === answer.fromStageId);
  const toStage = item.stages.find((stage) => stage.id === answer.toStageId);
  if (!fromStage || !toStage || toStage.order !== fromStage.order + 1) {
    return {
      isCorrect: false,
      status: "invalid-content",
      feedback: "이 사건의 바로 다음 전달문끼리만 비교할 수 있어요.",
      matchingChangeIds: [],
    };
  }

  const candidates = item.expectedChanges.filter(
    (change) =>
      change.fromStageId === answer.fromStageId &&
      change.toStageId === answer.toStageId,
  );
  const matchingChangeIds = candidates.map(({ id }) => id);
  const matchingType = candidates.filter((change) => change.type === answer.changeType);
  const selectedSegmentCount = new Set(answer.selectedSegmentIds).size;
  const maximumRequiredSegmentCount = Math.max(
    0,
    ...candidates.map((change) => new Set(requiredSegmentIds(change)).size),
  );

  if (selectedSegmentCount === 0) {
    return {
      isCorrect: false,
      status: "needs-review",
      feedback: "먼저 달라진 말을 하나 고르고, 그 이유도 골라 보세요.",
      matchingChangeIds,
    };
  }
  if (selectedSegmentCount > maximumRequiredSegmentCount) {
    return {
      isCorrect: false,
      status: "needs-review",
      feedback: "말을 너무 많이 골랐어요. 달라진 말만 남겨 보세요.",
      matchingChangeIds,
    };
  }
  if (matchingType.length === 0) {
    return {
      isCorrect: false,
      status: "needs-review",
      feedback: "고른 말은 다시 살펴볼 수 있어요. 어떻게 달라졌는지 한 번 더 생각해 보세요.",
      matchingChangeIds,
    };
  }
  const correct = matchingType.some(
    (change) =>
      sameMembers(answer.selectedSegmentIds, requiredSegmentIds(change)) &&
      answer.evidenceMeaningUnitIds.length > 0 &&
      answer.evidenceMeaningUnitIds.every((id) => change.meaningUnitIds.includes(id)),
  );

  if (correct) {
    return {
      isCorrect: true,
      status: "correct",
      feedback: "잘 찾았어요. 고른 말과 이유가 서로 맞아요.",
      matchingChangeIds,
    };
  }
  if (matchingType.length > 0) {
    return {
      isCorrect: false,
      status: "needs-review",
      feedback: "고른 말과 이유를 다시 살펴보고 한 번 더 골라 보세요.",
      matchingChangeIds,
    };
  }
  return {
    isCorrect: false,
    status: "needs-review",
    feedback: "고른 말과 이유를 다시 살펴보고 한 번 더 골라 보세요.",
    matchingChangeIds,
  };
}
