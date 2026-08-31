import { requiredSegmentIds } from "../../domain/index";
import type { StageChange, TransmissionStage } from "../../domain/index";

export type SelectionSide = "from" | "to";

export function firstPendingChange(
  changes: StageChange[],
  resolvedIds: string[],
): StageChange | undefined {
  const resolved = new Set(resolvedIds);
  return changes.find((change) => !resolved.has(change.id));
}

export function selectionSide(change: StageChange): SelectionSide {
  return change.type === "omission" ? "from" : "to";
}

export function selectionIds(change: StageChange): string[] {
  return requiredSegmentIds(change);
}

export function selectionInstruction(
  change: StageChange,
  from: TransmissionStage,
  to: TransmissionStage,
): string {
  const side = selectionSide(change);
  const stage = side === "from" ? from : to;
  const selectedText = selectionIds(change)
    .map((id) => stage.segments.find((segment) => segment.id === id)?.text)
    .filter((text): text is string => Boolean(text))
    .join(" · ");
  const textHint = selectedText ? ` ‘${selectedText}’을 하나 눌러요.` : " 달라진 말을 하나 눌러요.";
  if (side === "from") return `이전 문장에서 사라진 말을 골라요.${textHint}`;
  return `다음 문장에서 달라진 말을 골라요.${textHint}`;
}
