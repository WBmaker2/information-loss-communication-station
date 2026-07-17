import type {
  ContentValidationResult,
  SafeRelayValidation,
  StageMeaningLedger,
  TransmissionCase,
} from "./types.js";

const unique = (ids: string[]) => [...new Set(ids)];
const sameMembers = (left: string[], right: string[]) => {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  return leftSet.size === rightSet.size && [...leftSet].every((id) => rightSet.has(id));
};

const idsFromStage = (item: TransmissionCase, stageId: string) =>
  item.stages.find((stage) => stage.id === stageId)?.expressedMeaningUnitIds ?? [];

export function validateCaseContent(item: TransmissionCase): ContentValidationResult {
  const errors: string[] = [];
  const allIds = [
    ...item.meaningUnits.map(({ id }) => id),
    ...item.stages.flatMap((stage) => [
      stage.id,
      ...stage.segments.map(({ id }) => id),
    ]),
    ...item.expectedChanges.map(({ id }) => id),
    ...item.relayOptions.map(({ id }) => id),
  ];
  if (new Set(allIds).size !== allIds.length) errors.push("duplicate-id");

  if (item.stages.length < 2) errors.push("minimum-stage-count");
  const ordered = [...item.stages].sort((left, right) => left.order - right.order);
  if (!ordered.every((stage, index) => stage.order === index)) errors.push("stage-order");

  const meaningIds = new Set(item.meaningUnits.map(({ id }) => id));
  const stageIds = new Set(item.stages.map(({ id }) => id));
  const segmentIds = new Set(item.stages.flatMap((stage) => stage.segments.map(({ id }) => id)));
  const relayOptionIds = new Set(item.relayOptions.map(({ id }) => id));
  const selectableExpressionIds = new Set([...segmentIds, ...relayOptionIds]);
  const audienceIds = new Set([
    item.audienceId,
    ...item.stages.map((stage) => stage.audienceRole),
  ]);
  const firstStage = ordered[0];
  const originalIds = new Set(firstStage?.expressedMeaningUnitIds ?? []);

  for (const meaning of item.meaningUnits) {
    for (const paraphraseId of meaning.allowedParaphraseIds) {
      if (!selectableExpressionIds.has(paraphraseId)) {
        errors.push(`unknown-allowed-paraphrase:${meaning.id}:${paraphraseId}`);
      }
    }
  }

  for (const id of item.requiredMeaningUnitIds) {
    if (!meaningIds.has(id)) errors.push(`unknown-required-meaning:${id}`);
    if (!originalIds.has(id)) errors.push(`required-not-in-original:${id}`);
  }

  for (const stage of item.stages) {
    const segmentMeaningIds = unique(stage.segments.flatMap((segment) => segment.meaningUnitIds));
    if (!sameMembers(segmentMeaningIds, stage.expressedMeaningUnitIds)) {
      errors.push(`stage-meaning-mismatch:${stage.id}`);
    }
    for (const segment of stage.segments) {
      if (!segment.text || !segment.accessibilityLabel) errors.push(`incomplete-segment:${segment.id}`);
      for (const id of [...segment.meaningUnitIds, ...segment.introducesUnsupportedMeaningIds]) {
        if (!meaningIds.has(id)) errors.push(`unknown-segment-meaning:${segment.id}:${id}`);
      }
    }
  }

  for (const change of item.expectedChanges) {
    const source = item.stages.find((stage) => stage.id === change.fromStageId);
    const target = item.stages.find((stage) => stage.id === change.toStageId);
    if (!stageIds.has(change.fromStageId) || !stageIds.has(change.toStageId)) {
      errors.push(`unknown-change-stage:${change.id}`);
      continue;
    }
    if (target!.order !== source!.order + 1) errors.push(`non-adjacent-change:${change.id}`);
    for (const id of change.sourceSegmentIds) {
      if (!segmentIds.has(id) || !source!.segments.some((segment) => segment.id === id)) {
        errors.push(`invalid-source-segment:${change.id}:${id}`);
      }
    }
    for (const id of change.targetSegmentIds) {
      if (!segmentIds.has(id) || !target!.segments.some((segment) => segment.id === id)) {
        errors.push(`invalid-target-segment:${change.id}:${id}`);
      }
    }
    for (const id of change.meaningUnitIds) {
      if (!meaningIds.has(id)) errors.push(`unknown-change-meaning:${change.id}:${id}`);
    }

    const sourceIds = new Set(source!.expressedMeaningUnitIds);
    const targetIds = new Set(target!.expressedMeaningUnitIds);
    if (change.type === "omission" && !change.meaningUnitIds.every((id) => sourceIds.has(id) && !targetIds.has(id))) {
      errors.push(`invalid-omission:${change.id}`);
    }
    if (change.type === "unsupported-addition" && !change.meaningUnitIds.every((id) => targetIds.has(id) && !sourceIds.has(id) && !originalIds.has(id))) {
      errors.push(`invalid-unsupported-addition:${change.id}`);
    }
    if (change.type === "meaning-preserving" && !sameMembers(source!.expressedMeaningUnitIds, target!.expressedMeaningUnitIds)) {
      errors.push(`invalid-meaning-preserving:${change.id}`);
    }
    if (change.type === "meaning-shift") {
      const appearsOnBothSides = change.meaningUnitIds.some((id) => sourceIds.has(id)) && change.meaningUnitIds.some((id) => targetIds.has(id));
      if (!appearsOnBothSides || sameMembers(source!.expressedMeaningUnitIds, target!.expressedMeaningUnitIds)) {
        errors.push(`invalid-meaning-shift:${change.id}`);
      }
    }
  }

  for (const option of item.relayOptions) {
    for (const id of [...option.meaningUnitIds, ...option.unsupportedMeaningIds]) {
      if (!meaningIds.has(id)) errors.push(`unknown-relay-meaning:${option.id}:${id}`);
    }
    const actualUnsupportedMeaningIds = option.meaningUnitIds.filter(
      (id) => !originalIds.has(id),
    );
    if (!sameMembers(actualUnsupportedMeaningIds, option.unsupportedMeaningIds)) {
      errors.push(`relay-unsupported-metadata-mismatch:${option.id}`);
    }
    for (const audienceId of option.validForAudienceIds) {
      if (!audienceIds.has(audienceId)) {
        errors.push(`unknown-relay-audience:${option.id}:${audienceId}`);
      }
    }
  }
  if (!item.relayOptions.some((option) => validateSafeRelay(item, [option.id]).valid)) {
    errors.push("missing-safe-relay");
  }

  return { valid: errors.length === 0, errors };
}

export function validateSafeRelay(
  item: TransmissionCase,
  selectedOptionIds: string[],
): SafeRelayValidation {
  const selectedIds = new Set(selectedOptionIds);
  const selected = item.relayOptions.filter((option) => selectedIds.has(option.id));
  const meaningIds = unique(selected.flatMap((option) => option.meaningUnitIds));
  const originalMeaningIds = new Set(
    item.stages.find((stage) => stage.order === 0)?.expressedMeaningUnitIds ?? [],
  );
  const unsupportedMeaningIds = meaningIds.filter((id) => !originalMeaningIds.has(id));
  const meaningSet = new Set(meaningIds);
  const missingMeaningUnitIds = item.requiredMeaningUnitIds.filter((id) => !meaningSet.has(id));
  const invalidAudienceOptionIds = selected
    .filter((option) => !option.validForAudienceIds.includes(item.audienceId))
    .map(({ id }) => id);
  return {
    valid: missingMeaningUnitIds.length === 0 && unsupportedMeaningIds.length === 0 && invalidAudienceOptionIds.length === 0,
    missingMeaningUnitIds,
    unsupportedMeaningIds,
    invalidAudienceOptionIds,
  };
}

export function calculateMeaningLedger(item: TransmissionCase): StageMeaningLedger[] {
  const originalIds = new Set(
    item.stages.find((stage) => stage.order === 0)?.expressedMeaningUnitIds ?? [],
  );
  return [...item.stages]
    .sort((left, right) => left.order - right.order)
    .map((stage) => {
      const currentIds = new Set(stage.expressedMeaningUnitIds);
      return {
        stageId: stage.id,
        preservedMeaningUnitIds: [...currentIds].filter((id) => originalIds.has(id)),
        omittedMeaningUnitIds: [...originalIds].filter((id) => !currentIds.has(id)),
        addedMeaningUnitIds: [...currentIds].filter((id) => !originalIds.has(id)),
      };
    });
}

export const getStageMeaningIds = idsFromStage;
