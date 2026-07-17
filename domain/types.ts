export type GradeRoute = "grade-3-4" | "grade-5-6";

export type MeaningKind =
  | "actor"
  | "action"
  | "time"
  | "place"
  | "quantity"
  | "condition"
  | "negation"
  | "certainty"
  | "source"
  | "detail";

export type ChangeType =
  | "omission"
  | "unsupported-addition"
  | "meaning-shift"
  | "meaning-preserving"
  | "unchanged";

export interface MeaningUnit {
  id: string;
  kind: MeaningKind;
  canonicalMeaning: string;
  studentLabel: string;
  requiredForPurpose: boolean;
  allowedParaphraseIds: string[];
}

export interface PhraseSegment {
  id: string;
  text: string;
  meaningUnitIds: string[];
  introducesUnsupportedMeaningIds: string[];
  accessibilityLabel: string;
}

export interface TransmissionStage {
  id: string;
  order: number;
  senderRole: string;
  audienceRole: string;
  medium: "spoken" | "memo" | "notice" | "broadcast";
  segments: PhraseSegment[];
  expressedMeaningUnitIds: string[];
}

export interface StageChange {
  id: string;
  fromStageId: string;
  toStageId: string;
  sourceSegmentIds: string[];
  targetSegmentIds: string[];
  meaningUnitIds: string[];
  type: ChangeType;
  explanation: string;
}

export interface RelayOption {
  id: string;
  text: string;
  meaningUnitIds: string[];
  unsupportedMeaningIds: string[];
  validForAudienceIds: string[];
}

export interface TransmissionCase {
  id: string;
  title: string;
  purpose: string;
  audienceId: string;
  availableRoutes: GradeRoute[];
  meaningUnits: MeaningUnit[];
  stages: TransmissionStage[];
  expectedChanges: StageChange[];
  relayOptions: RelayOption[];
  requiredMeaningUnitIds: string[];
  teacherNotes: string[];
}

export interface ContentValidationResult {
  valid: boolean;
  errors: string[];
}

export interface StageChangeAnswer {
  fromStageId: string;
  toStageId: string;
  selectedSegmentIds: string[];
  changeType: ChangeType;
  evidenceMeaningUnitIds: string[];
}

export interface StageChangeJudgement {
  isCorrect: boolean;
  status: "correct" | "needs-review" | "invalid-content";
  feedback: string;
  matchingChangeIds: string[];
}

export interface SafeRelayValidation {
  valid: boolean;
  missingMeaningUnitIds: string[];
  unsupportedMeaningIds: string[];
  invalidAudienceOptionIds: string[];
}

export interface StageMeaningLedger {
  stageId: string;
  preservedMeaningUnitIds: string[];
  omittedMeaningUnitIds: string[];
  addedMeaningUnitIds: string[];
}
