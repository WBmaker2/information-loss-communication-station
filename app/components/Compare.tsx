import { useRef } from "react";
import type { ChangeType, TransmissionCase } from "../../domain/index";
import { canAdvanceTransition, transitionChanges } from "../progress";
import { SelectionSummary } from "./SelectionSummary";
import { SolutionGuide } from "./SolutionGuide";
import {
  firstPendingChange,
  selectionIds,
  selectionInstruction,
} from "./selectionGuidance";
import { changeNames, labels, mediumNames } from "./shared";

type CompareProps = {
  item: TransmissionCase;
  transition: number;
  resolvedIds: string[];
  segments: string[];
  evidence: string[];
  changeType: ChangeType;
  feedback: string;
  onSegment: (id: string) => void;
  onEvidence: (id: string) => void;
  onType: (type: ChangeType) => void;
  onCheck: () => boolean;
  onClear: () => void;
  onBack: () => void;
  onNext: () => void;
};

export function Compare({
  item,
  transition,
  resolvedIds,
  segments,
  evidence,
  changeType,
  feedback,
  onSegment,
  onEvidence,
  onType,
  onCheck,
  onClear,
  onBack,
  onNext,
}: CompareProps) {
  const from = item.stages[transition];
  const to = item.stages[transition + 1];
  const expected = transitionChanges(item, transition);
  const resolved = new Set(resolvedIds);
  const pending = firstPendingChange(expected, resolvedIds);
  const canAdvance = canAdvanceTransition(item, transition, resolvedIds);
  const nextGuidanceId = "compare-next-guidance";
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  // 안내 문구: 이전 문장에서 사라진 말을 골라요.
  const selectionPrompt = pending
    ? selectionInstruction(pending, from, to)
    : "이번 비교의 변화를 모두 찾았어요. 다음 비교 버튼을 눌러요.";
  const hintedIds = pending ? selectionIds(pending) : [];
  const guideStep = !segments.length ? 1 : !evidence.length ? 2 : 4;
  const nextAction = !segments.length
    ? selectionPrompt
    : !evidence.length
      ? "변화 종류를 하나 고르고, 이유를 찾아요."
      : canAdvance
        ? "잘했어요. 다음 비교 버튼을 눌러 계속해요."
        : feedback
        ? "틀렸어요. 고른 말과 변화 종류를 다시 살펴보고, 내 답 확인을 눌러요."
        : "내 답 확인을 눌러 맞는지 살펴봐요.";
  const example = expected.some((change) => change.type === "omission")
    ? "‘비가 오면’이 사라졌다면 조건이 빠진 거예요."
    : "‘최대 두 개’가 ‘두 개’가 되면 뜻의 범위가 달라져요.";
  const check = () => {
    if (!onCheck()) feedbackRef.current?.focus();
  };

  return (
    <section className="card compare">
      <p className="eyebrow">문장 비교 · {transition + 1}/{item.stages.length - 1}</p>
      <h1>바로 다음 문장을 비교해요</h1>
      <p className="muted">두 문장을 보고, 안내된 말 하나부터 찾아요.</p>
      <p className="task-hint" aria-live="polite">
        <strong>지금 할 일:</strong> {nextAction}
      </p>

      <div className="compare-layout">
        <div className="comparison">
          <MessageCard
            title={`이전 · ${mediumNames[from.medium]}`}
            stage={from} selectable
            selected={segments}
            hintedIds={hintedIds}
            selectionTarget={pending ? pending.type === "omission" : false}
            onSelect={onSegment}
          />
          <MessageCard
            title={`다음 · ${mediumNames[to.medium]}`}
            stage={to}
            selectable
            selected={segments}
            hintedIds={hintedIds}
            selectionTarget={pending ? pending.type !== "omission" : false}
            onSelect={onSegment}
          />
        </div>
        <aside className="meaning-reference">
          <h2>중요한 내용</h2>
          <p className="muted">누가·언제·어디서·무엇을 했는지 비교할 때 써 보세요.</p>
          {item.meaningUnits.map((unit) => (
            <p key={unit.id}>
              <b>{labels[unit.kind]}</b> {unit.canonicalMeaning}
            </p>
          ))}
        </aside>
      </div>

      <SolutionGuide activeStep={guideStep} example={example} compact />
      <ol className="activity-steps" aria-label="비교 활동 순서">
        <li><b>1.</b> 달라진 말 고르기</li>
        <li><b>2.</b> 어떻게 달라졌나요?</li>
        <li><b>3.</b> 왜 그렇게 생각했나요?</li>
      </ol>

      <aside className="progress-checklist" aria-live="polite">
        <strong>찾은 변화 {expected.filter((change) => resolved.has(change.id)).length}/{expected.length}</strong>
        <ul>
          {expected.map((change) => (
            <li key={change.id}>
              {resolved.has(change.id) ? "✓ 확인함" : "○ 아직 확인"} · {changeNames[change.type]}
            </li>
          ))}
        </ul>
      </aside>

      <fieldset>
        <legend>1. 달라진 말 고르기</legend>
        <p className="muted">{selectionPrompt} 한 번에 한 변화만 찾아요.</p>
      </fieldset>
      <fieldset>
        <legend>2. 어떻게 달라졌나요?</legend>
        <p className="muted">고른 말이 빠짐·추가·뜻 바뀜·같은 뜻 중 어디인지 골라요.</p>
        <div className="choice-row">
          {(["omission", "unsupported-addition", "meaning-shift", "meaning-preserving"] as ChangeType[]).map((type) => (
            <label key={type}>
              <input type="radio" name="change-type" checked={changeType === type} onChange={() => onType(type)} />
              {changeNames[type]}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>3. 왜 그렇게 생각했나요?</legend>
        <p className="muted">문장에서 이유가 되는 말을 골라요.</p>
        <div className="check-grid">
          {item.meaningUnits.map((unit) => (
            <label key={unit.id}>
              <input type="checkbox" checked={evidence.includes(unit.id)} onChange={() => onEvidence(unit.id)} />
              {labels[unit.kind]} · {unit.canonicalMeaning}
            </label>
          ))}
        </div>
      </fieldset>

      <SelectionSummary
        selectedSegmentCount={segments.length}
        selectedEvidenceCount={evidence.length}
        onClear={onClear}
        guidanceId={nextGuidanceId}
        showNextGuidance={!canAdvance}
      />
      <div className="button-row">
        <button className="primary gi-pulse" onClick={check}>내 답 확인</button>
        <button
          className={canAdvance ? "gi-pulse" : ""}
          disabled={!canAdvance}
          aria-describedby={!canAdvance ? nextGuidanceId : undefined}
          onClick={onNext}
        >
          {transition + 2 < item.stages.length ? "다음 비교" : "처음부터 끝까지 보기"}
        </button>
      </div>
      <p ref={feedbackRef} tabIndex={-1} className="feedback" aria-live="polite">{feedback}</p>
      <div className="back-row">
        <button className="text-button" onClick={onBack}>사건 설명으로</button>
      </div>
    </section>
  );
}

type MessageCardProps = {
  title: string;
  stage: TransmissionCase["stages"][number];
  selectable?: boolean;
  selected?: string[];
  hintedIds?: string[];
  selectionTarget?: boolean;
  onSelect?: (id: string) => void;
};

export function MessageCard({
  title,
  stage,
  selectable = false,
  selected = [],
  hintedIds = [],
  selectionTarget = false,
  onSelect,
}: MessageCardProps) {
  const cardClassName = selectionTarget ? "message-card selection-target" : "message-card";
  return (
    <article className={cardClassName}>
      <h2>{title}</h2>
      <p>{stage.senderRole} → {stage.audienceRole}</p>
      {selectionTarget && <p className="selection-target-label">여기서 찾아요</p>}
      <div>
        {stage.segments.map((segment) => {
          const isSelected = selected.includes(segment.id);
          const isHinted = hintedIds.includes(segment.id) && !isSelected;
          const className = isSelected ? "phrase pressed" : isHinted ? "phrase gi-pulse" : "phrase";
          return selectable ? (
            <button
              key={segment.id}
              className={className}
              aria-pressed={isSelected}
              aria-label={segment.accessibilityLabel}
              onClick={() => onSelect?.(segment.id)}
            >
              {segment.text}
            </button>
          ) : (
            <p key={segment.id} className="message-text">{segment.text}</p>
          );
        })}
      </div>
    </article>
  );
}
