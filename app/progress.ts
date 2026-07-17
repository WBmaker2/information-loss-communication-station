import type { StageChange, StageChangeAnswer, TransmissionCase } from "../domain/index";

export interface ClearedCaseSession {
  caseId: null;
  transition: number;
  segments: string[];
  evidence: string[];
  relay: string[];
}

export function clearCaseSession(): ClearedCaseSession {
  return { caseId: null, transition: 0, segments: [], evidence: [], relay: [] };
}

export function transitionChanges(item: TransmissionCase, transition: number): StageChange[] {
  const from = item.stages[transition];
  const to = item.stages[transition + 1];
  if (!from || !to) return [];
  return item.expectedChanges.filter(
    (change) => change.fromStageId === from.id && change.toStageId === to.id,
  );
}

export function canAdvanceTransition(
  item: TransmissionCase,
  transition: number,
  resolvedIds: string[],
): boolean {
  const resolved = new Set(resolvedIds);
  return transitionChanges(item, transition).every((change) => resolved.has(change.id));
}

export function resolvedChangeIdsForAnswer(
  item: TransmissionCase,
  transition: number,
  answer: StageChangeAnswer,
  isCorrect: boolean,
): string[] {
  if (!isCorrect) return [];
  const selected = new Set(answer.selectedSegmentIds);
  const evidence = new Set(answer.evidenceMeaningUnitIds);
  return transitionChanges(item, transition)
    .filter((change) => change.type === answer.changeType)
    .filter((change) => change.targetSegmentIds.every((id) => selected.has(id)))
    .filter((change) => change.meaningUnitIds.some((id) => evidence.has(id)))
    .map(({ id }) => id);
}

export function firstChangedStageChange(item: TransmissionCase): StageChange | undefined {
  return item.expectedChanges.find(
    (change) => change.type !== "meaning-preserving" && change.type !== "unchanged",
  );
}
