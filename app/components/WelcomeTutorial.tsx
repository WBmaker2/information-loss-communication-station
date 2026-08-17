import { useRef, useState } from "react";
import { TUTORIAL_CASE, judgeStageChange } from "../../domain/index";
import type { ChangeType, GradeRoute } from "../../domain/index";
import { MessageCard } from "./Compare";
import { SelectionSummary } from "./SelectionSummary";
import { SolutionGuide } from "./SolutionGuide";
import { changeNames, labels } from "./shared";

export function Welcome({ route, setRoute, onStart }: { route: GradeRoute; setRoute: (value: GradeRoute) => void; onStart: () => void }) {
  return <section className="hero card"><p className="eyebrow">가상 통신 기록실</p><h1>전해지는 동안 달라진 뜻을 찾아 안전하게 다시 보내요</h1><p className="lead">문장이 짧아져도 중요한 뜻은 남아 있을까요? 기록을 나란히 보고, 이유를 찾아 다시 전해 봐요.</p><fieldset><legend>오늘 할 활동을 골라요</legend><div className="route-grid"><button className={route === "grade-3-4" ? "route selected" : "route"} onClick={() => setRoute("grade-3-4")} aria-pressed={route === "grade-3-4"}><strong>3~4학년 기본 활동</strong><span>시간·장소·수량처럼 보이는 뜻을 찾습니다.</span></button><button className={route === "grade-5-6" ? "route selected" : "route"} onClick={() => setRoute("grade-5-6")} aria-pressed={route === "grade-5-6"}><strong>5~6학년 도전 활동</strong><span>조건, 누가 알려 줬는지, 아직 바뀔 수 있는지도 살펴봐요.</span></button></div></fieldset><p className="privacy">🔒 개인정보를 모으거나 저장하지 않아요. 가상 사건만 다룹니다.</p><button className="primary gi-pulse" onClick={onStart}>연습 시작</button></section>;
}

export function Tutorial({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0), [segments, setSegments] = useState<string[]>([]), [evidence, setEvidence] = useState<string[]>([]), [changeType, setChangeType] = useState<ChangeType>("meaning-preserving"), [feedback, setFeedback] = useState(""), [canAdvance, setCanAdvance] = useState(false);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const stages = TUTORIAL_CASE.stages;
  const toggle = (id: string, values: string[], save: (next: string[]) => void) => save(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]);
  const clearSelections = () => { setSegments([]); setEvidence([]); setFeedback(""); setCanAdvance(false); };
  const resetAnswer = () => { clearSelections(); setChangeType("meaning-preserving"); };
  const restart = () => { setStep(0); resetAnswer(); };
  const check = () => {
    const answer = { fromStageId: stages[step].id, toStageId: stages[step + 1].id, selectedSegmentIds: segments, changeType, evidenceMeaningUnitIds: evidence };
    const result = judgeStageChange(TUTORIAL_CASE, answer);
    setFeedback(result.feedback);
    setCanAdvance(result.isCorrect);
    if (!result.isCorrect) feedbackRef.current?.focus();
  };
  const next = () => { if (step === 0) { setStep(1); resetAnswer(); } else onDone(); };
  const nextGuidanceId = "tutorial-next-guidance";
  const guideStep = !segments.length ? 1 : !evidence.length ? 2 : 4;
  const example = step === 0 ? "‘각 모둠’과 ‘모둠별’은 말이 달라도 같은 뜻이에요." : "‘각자’는 ‘모둠별’과 범위가 달라서 뜻이 바뀌어요.";
  return <section className="card lesson"><p className="eyebrow">연습 활동 · {step + 1}/2</p><h1>연습 활동</h1><p>{TUTORIAL_CASE.purpose}</p><p className="muted">막히면 아래 순서를 한 칸씩 따라가 보세요.</p><SolutionGuide activeStep={guideStep} example={example} /><ol className="activity-steps" aria-label="연습 활동 순서"><li><b>1.</b> 달라진 말 고르기</li><li><b>2.</b> 어떻게 달라졌나요?</li><li><b>3.</b> 왜 그렇게 생각했나요?</li></ol><fieldset className="expression-choice"><legend>1. 달라진 말 고르기</legend><p className="muted">이전과 다음 문장에서 관련 말을 눌러 보세요. 빠진 말은 이전 문장에서 찾아요.</p><div className="comparison"><MessageCard title="이전 문장" stage={stages[step]} selectable selected={segments} onSelect={(id) => toggle(id, segments, setSegments)} /><MessageCard title="다음 문장" stage={stages[step + 1]} selectable selected={segments} onSelect={(id) => toggle(id, segments, setSegments)} /></div></fieldset><fieldset><legend>2. 어떻게 달라졌나요?</legend><p className="muted">고른 말이 빠졌는지, 새로 생겼는지, 뜻이 바뀌었는지 생각해요.</p><div className="choice-row">{(["omission", "unsupported-addition", "meaning-shift", "meaning-preserving"] as ChangeType[]).map((type) => <label key={type}><input type="radio" name="tutorial-change-type" checked={changeType === type} onChange={() => setChangeType(type)} />{changeNames[type]}</label>)}</div></fieldset><fieldset><legend>3. 왜 그렇게 생각했나요?</legend><p className="muted">내 생각을 뒷받침하는 ‘이유가 되는 말’을 골라요.</p><div className="check-grid">{TUTORIAL_CASE.meaningUnits.map((unit) => <label key={unit.id}><input type="checkbox" checked={evidence.includes(unit.id)} onChange={() => toggle(unit.id, evidence, setEvidence)} />{labels[unit.kind]} · {unit.canonicalMeaning}</label>)}</div></fieldset><SelectionSummary selectedSegmentCount={segments.length} selectedEvidenceCount={evidence.length} onClear={clearSelections} guidanceId={nextGuidanceId} showNextGuidance={!canAdvance} /><div className="button-row"><button className="primary gi-pulse" onClick={check}>내 답 확인</button><button className={canAdvance ? "gi-pulse" : ""} disabled={!canAdvance} aria-describedby={!canAdvance ? nextGuidanceId : undefined} onClick={next}>{step === 0 ? "다음 비교" : "사건 임무로"}</button><button onClick={restart}>처음부터 다시</button></div><p ref={feedbackRef} tabIndex={-1} className="feedback" aria-live="polite">{feedback}</p><div className="back-row"><button className="text-button" onClick={onBack}>시작 화면으로</button><button className="text-button" onClick={onDone}>연습 활동 건너뛰기</button></div></section>;
}
