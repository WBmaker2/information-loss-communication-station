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
      feedback: "잘 찾았어요. 선택한 뜻 조각이 이 변화의 근거가 돼요.",
      matchingChangeIds,
    };
  }
  if (matchingType.length > 0) {
    return {
      isCorrect: false,
      status: "needs-review",
      feedback: "변화 종류는 맞아요. 달라진 표현 조각과 뜻 근거를 한 번 더 골라 보세요.",
      matchingChangeIds,
    };
  }
  return {
    isCorrect: false,
    status: "needs-review",
    feedback: "앞 문장과 다음 문장을 나란히 읽고, 무엇이 빠지거나 달라졌는지 찾아보세요.",
    matchingChangeIds,
  };
}
