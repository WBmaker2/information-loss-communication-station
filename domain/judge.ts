import type {
  StageChangeAnswer,
  StageChangeJudgement,
  TransmissionCase,
} from "./types.js";

const includesEvery = (available: Set<string>, needed: string[]) =>
  needed.every((id) => available.has(id));

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

  const selectedSegments = new Set(answer.selectedSegmentIds);
  const selectedEvidence = new Set(answer.evidenceMeaningUnitIds);
  const candidates = item.expectedChanges.filter(
    (change) =>
      change.fromStageId === answer.fromStageId &&
      change.toStageId === answer.toStageId &&
      change.targetSegmentIds.some((id) => selectedSegments.has(id)),
  );
  const matchingChangeIds = candidates.map(({ id }) => id);
  const matchingType = candidates.filter((change) => change.type === answer.changeType);
  const correct = matchingType.some(
    (change) =>
      includesEvery(selectedSegments, change.targetSegmentIds) &&
      change.meaningUnitIds.some((id) => selectedEvidence.has(id)),
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
