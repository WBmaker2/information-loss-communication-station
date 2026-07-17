import type { ChangeType, TransmissionCase } from "../domain/index";
import { firstChangedStageChange } from "./progress";

export interface LearnerFinding {
  changeId: string;
  type: ChangeType;
  selectedSegmentIds: string[];
  selectedEvidenceMeaningIds: string[];
}

export interface CompletedCaseRecord {
  caseId: string;
  firstChangedId: string | null;
  findings: LearnerFinding[];
  selectedRelayOptionIds: string[];
}

export function buildCompletedRecord(
  item: TransmissionCase,
  findings: LearnerFinding[],
  selectedRelayOptionIds: string[],
): CompletedCaseRecord {
  return {
    caseId: item.id,
    firstChangedId: firstChangedStageChange(item)?.id ?? null,
    findings,
    selectedRelayOptionIds,
  };
}

export function findingsByType(findings: LearnerFinding[]): Record<ChangeType, LearnerFinding[]> {
  const grouped: Record<ChangeType, LearnerFinding[]> = {
    omission: [], "unsupported-addition": [], "meaning-shift": [], "meaning-preserving": [], unchanged: [],
  };
  for (const finding of findings) grouped[finding.type].push(finding);
  return grouped;
}
