"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TRANSMISSION_CASES, TUTORIAL_CASE, calculateMeaningLedger, judgeStageChange, validateSafeRelay } from "../domain/index";
import type { ChangeType, GradeRoute, TransmissionCase } from "../domain/index";

type View = "welcome" | "tutorial" | "mission" | "compare" | "ledger" | "relay" | "result" | "archive";
type Dialog = "teacher" | "updates" | null;
const changeNames: Record<ChangeType, string> = { omission: "빠짐", "unsupported-addition": "근거 없는 추가", "meaning-shift": "뜻이 달라짐", "meaning-preserving": "뜻 유지", unchanged: "달라지지 않음" };
const labels: Record<string, string> = { actor: "누가", action: "무엇", time: "언제", place: "어디서", quantity: "수량", condition: "조건", certainty: "확실성", source: "출처", detail: "도움 정보", negation: "아님" };

export default function CommunicationStation() {
  const [route, setRoute] = useState<GradeRoute>("grade-3-4");
  const [view, setView] = useState<View>("welcome");
  const [caseId, setCaseId] = useState<string | null>(null);
  const [transition, setTransition] = useState(0);
  const [segments, setSegments] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [changeType, setChangeType] = useState<ChangeType>("omission");
  const [feedback, setFeedback] = useState("");
  const [relay, setRelay] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = TRANSMISSION_CASES.find((entry) => entry.id === caseId) ?? null;
  const routeCases = useMemo(() => TRANSMISSION_CASES.filter((entry) => entry.availableRoutes.includes(route)), [route]);
  useEffect(() => { if (dialog) closeRef.current?.focus(); }, [dialog]);
  const toggle = (id: string, values: string[], save: (next: string[]) => void) => save(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]);
  const resetAnswer = () => { setSegments([]); setEvidence([]); setFeedback(""); setChangeType("omission"); };
  const openCase = (next: TransmissionCase) => { setCaseId(next.id); setTransition(0); resetAnswer(); setRelay([]); setView("mission"); };
  const checkChange = () => {
    if (!item) return;
    setFeedback(judgeStageChange(item, { fromStageId: item.stages[transition].id, toStageId: item.stages[transition + 1].id, selectedSegmentIds: segments, changeType, evidenceMeaningUnitIds: evidence }).feedback);
  };
  return <main className="station-shell">
    <header className="station-header"><button className="wordmark" onClick={() => setView("welcome")}>정보 손실 통신소</button><p aria-live="polite" aria-current={item && view !== "welcome" ? "step" : undefined}>{route === "grade-3-4" ? "3~4학년 기본 항로" : "5~6학년 확장 항로"}{item && view !== "welcome" ? ` · 사건 ${routeCases.findIndex((entry) => entry.id === item.id) + 1}/${routeCases.length}` : ""}</p><div className="header-actions"><button onClick={() => setDialog("teacher")}>교사용 안내</button><button onClick={() => setDialog("updates")}>업데이트 내역</button></div></header>
    {view === "welcome" && <Welcome route={route} setRoute={setRoute} onStart={() => setView("tutorial")} />}
    {view === "tutorial" && <Tutorial onDone={() => setView("mission")} />}
    {view === "mission" && <Mission cases={routeCases} current={item} completed={completed} onOpen={openCase} onCompare={() => setView("compare")} />}
    {view === "compare" && item && <Compare item={item} transition={transition} segments={segments} evidence={evidence} changeType={changeType} feedback={feedback} onSegment={(id) => toggle(id, segments, setSegments)} onEvidence={(id) => toggle(id, evidence, setEvidence)} onType={setChangeType} onCheck={checkChange} onNext={() => { if (transition + 2 < item.stages.length) { setTransition(transition + 1); resetAnswer(); } else setView("ledger"); }} />}
    {view === "ledger" && item && <Ledger item={item} onNext={() => setView("relay")} />}
    {view === "relay" && item && <Relay item={item} selected={relay} onToggle={(id) => toggle(id, relay, setRelay)} onDone={() => { setCompleted((ids) => ids.includes(item.id) ? ids : [...ids, item.id]); setView("result"); }} />}
    {view === "result" && item && <Result item={item} relay={relay} onNext={() => setView("mission")} onArchive={() => setView("archive")} />}
    {view === "archive" && <Archive cases={TRANSMISSION_CASES} completed={completed} onMission={() => setView("mission")} />}
    {dialog && <InfoDialog kind={dialog} closeRef={closeRef} onClose={() => setDialog(null)} />}
  </main>;
}

function Welcome({ route, setRoute, onStart }: { route: GradeRoute; setRoute: (value: GradeRoute) => void; onStart: () => void }) {
  return <section className="hero card"><p className="eyebrow">가상 통신 기록실</p><h1>전해지는 동안 달라진 뜻을 찾아 안전하게 다시 보내요</h1><p className="lead">문장이 짧아져도 중요한 뜻은 남아 있을까요? 기록을 나란히 보고, 근거를 찾아 다시 전해 봐요.</p><fieldset><legend>오늘의 항로를 골라요</legend><div className="route-grid"><button className={route === "grade-3-4" ? "route selected" : "route"} onClick={() => setRoute("grade-3-4")} aria-pressed={route === "grade-3-4"}><strong>3~4학년 기본 항로</strong><span>시간·장소·수량처럼 보이는 뜻을 찾습니다.</span></button><button className={route === "grade-5-6" ? "route selected" : "route"} onClick={() => setRoute("grade-5-6")} aria-pressed={route === "grade-5-6"}><strong>5~6학년 확장 항로</strong><span>조건·출처·확실한 정도까지 살핍니다.</span></button></div></fieldset><p className="privacy">🔒 개인정보를 모으거나 저장하지 않아요. 가상 사건만 다룹니다.</p><button className="primary" onClick={onStart}>통신 임무 시작</button></section>;
}

function Tutorial({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0); const stages = TUTORIAL_CASE.stages;
  return <section className="card lesson"><p className="eyebrow">안내 활동 · {step + 1}/2</p><h1>{TUTORIAL_CASE.title}</h1><p>{TUTORIAL_CASE.purpose}</p><div className="comparison"><MessageCard title="앞 문장" stage={stages[step]} /><MessageCard title="다음 문장" stage={stages[step + 1]} /></div><aside className="hint"><strong>{step === 0 ? "✓ 뜻 유지" : "! 범위가 바뀜"}</strong><p>{TUTORIAL_CASE.expectedChanges[step].explanation}</p></aside><div className="button-row"><button onClick={() => setStep(0)}>다시 보기</button><button className="primary" onClick={() => step === 0 ? setStep(1) : onDone()}>{step === 0 ? "다음 비교" : "사건 임무로"}</button></div><button className="text-button" onClick={onDone}>안내 활동 건너뛰기</button></section>;
}

function Mission({ cases, current, completed, onOpen, onCompare }: { cases: TransmissionCase[]; current: TransmissionCase | null; completed: string[]; onOpen: (item: TransmissionCase) => void; onCompare: () => void }) {
  if (current) return <section className="card mission"><p className="eyebrow">사건 임무</p><h1>{current.title}</h1><p className="lead">{current.purpose}</p><dl className="facts"><div><dt>보내는 역할</dt><dd>{current.stages[0].senderRole}</dd></div><div><dt>받는 역할</dt><dd>{current.stages[0].audienceRole}</dd></div><div><dt>매체</dt><dd>{current.stages.map((stage) => stage.medium).join(" → ")}</dd></div></dl><h2>원문 뜻 펼치기</h2><div className="meaning-list">{current.meaningUnits.map((unit) => <span key={unit.id} className={unit.requiredForPurpose ? "meaning required" : "meaning"}><b>{labels[unit.kind]}</b> {unit.canonicalMeaning}{unit.requiredForPurpose ? " · 필수" : " · 도움"}</span>)}</div><button className="primary" onClick={onCompare}>인접 전달문 비교하기</button></section>;
  return <section className="card"><p className="eyebrow">사건 목록</p><h1>통신 기록을 열어 보세요</h1><p>완료한 사건은 ✓로 표시됩니다. 어떤 사건부터 해도 괜찮아요.</p><div className="case-list">{cases.map((item, index) => <button key={item.id} className="case-button" onClick={() => onOpen(item)}><span>{completed.includes(item.id) ? "✓ 완료" : `기록 ${index + 1}`}</span><strong>{item.title}</strong><small>{item.purpose}</small></button>)}</div></section>;
}

function Compare({ item, transition, segments, evidence, changeType, feedback, onSegment, onEvidence, onType, onCheck, onNext }: { item: TransmissionCase; transition: number; segments: string[]; evidence: string[]; changeType: ChangeType; feedback: string; onSegment: (id: string) => void; onEvidence: (id: string) => void; onType: (type: ChangeType) => void; onCheck: () => void; onNext: () => void }) {
  const from = item.stages[transition], to = item.stages[transition + 1];
  return <section className="card compare"><p className="eyebrow">인접 단계 비교 · {transition + 1}/{item.stages.length - 1}</p><h1>바로 다음 전달문만 비교해요</h1><div className="compare-layout"><div className="comparison"><MessageCard title={`이전 · ${from.medium}`} stage={from} /><MessageCard title={`다음 · ${to.medium}`} stage={to} selectable selected={segments} onSelect={onSegment} /></div><aside className="meaning-reference"><h2>뜻 장부</h2>{item.meaningUnits.map((unit) => <p key={unit.id}><b>{labels[unit.kind]}</b> {unit.canonicalMeaning}</p>)}</aside></div><fieldset><legend>다음 문장에서 달라진 표현 조각을 눌러요</legend><p className="muted">선택한 조각: {segments.length ? `${segments.length}개` : "아직 없음"}</p></fieldset><fieldset><legend>변화 종류를 하나 고르세요</legend><div className="choice-row">{(["omission", "unsupported-addition", "meaning-shift", "meaning-preserving"] as ChangeType[]).map((type) => <label key={type}><input type="radio" name="change-type" checked={changeType === type} onChange={() => onType(type)} />{changeNames[type]}</label>)}</div></fieldset><fieldset><legend>근거가 되는 뜻을 모두 고르세요</legend><div className="check-grid">{item.meaningUnits.map((unit) => <label key={unit.id}><input type="checkbox" checked={evidence.includes(unit.id)} onChange={() => onEvidence(unit.id)} />{labels[unit.kind]} · {unit.canonicalMeaning}</label>)}</div></fieldset><div className="button-row"><button className="primary" onClick={onCheck}>판정 확인</button><button onClick={onNext}>{transition + 2 < item.stages.length ? "다음 비교" : "전체 사슬 점검"}</button></div><p className="feedback" aria-live="polite">{feedback}</p></section>;
}

function MessageCard({ title, stage, selectable = false, selected = [], onSelect }: { title: string; stage: TransmissionCase["stages"][number]; selectable?: boolean; selected?: string[]; onSelect?: (id: string) => void }) {
  return <article className="message-card"><h2>{title}</h2><p>{stage.senderRole} → {stage.audienceRole}</p><div>{stage.segments.map((segment) => selectable ? <button key={segment.id} className={selected.includes(segment.id) ? "phrase pressed" : "phrase"} aria-pressed={selected.includes(segment.id)} aria-label={segment.accessibilityLabel} onClick={() => onSelect?.(segment.id)}>{segment.text}</button> : <p key={segment.id} className="message-text">{segment.text}</p>)}</div></article>;
}

function Ledger({ item, onNext }: { item: TransmissionCase; onNext: () => void }) {
  const names = Object.fromEntries(item.meaningUnits.map((unit) => [unit.id, unit.canonicalMeaning])); const ledger = calculateMeaningLedger(item); const first = item.expectedChanges[0];
  return <section className="card"><p className="eyebrow">전체 사슬 점검</p><h1>원문에서 끝 전달문까지</h1><p>처음 달라진 지점: <strong>{first ? first.explanation : "뜻이 유지되었어요."}</strong></p><div className="ledger">{ledger.map((entry, index) => <article key={entry.stageId}><h2>{index === 0 ? "원문" : `${index}차 전달`}</h2><p>✓ 보존: {entry.preservedMeaningUnitIds.map((id) => names[id]).join(" · ") || "없음"}</p><p>− 빠짐: {entry.omittedMeaningUnitIds.map((id) => names[id]).join(" · ") || "없음"}</p><p>+ 추가: {entry.addedMeaningUnitIds.map((id) => names[id]).join(" · ") || "없음"}</p></article>)}</div><button className="primary" onClick={onNext}>안전 전달문 고르기</button></section>;
}

function Relay({ item, selected, onToggle, onDone }: { item: TransmissionCase; selected: string[]; onToggle: (id: string) => void; onDone: () => void }) {
  const check = validateSafeRelay(item, selected); const message = check.valid ? "✓ 필요한 뜻을 모두 지키고, 원문에 없는 뜻도 없어요." : [check.missingMeaningUnitIds.length ? "필수 뜻이 빠졌어요." : "", check.unsupportedMeaningIds.length ? "원문에 없는 뜻이 더해졌어요." : "", check.invalidAudienceOptionIds.length ? "받는 사람에게 맞지 않아요." : ""].filter(Boolean).join(" ");
  return <section className="card"><p className="eyebrow">안전 전달문</p><h1>문장 블록을 골라 안전하게 다시 보내요</h1><p>하나 이상을 고를 수 있어요. 맞는 답은 여러 개일 수 있습니다.</p><div className="relay-list">{item.relayOptions.map((option) => <button key={option.id} className={selected.includes(option.id) ? "relay selected" : "relay"} aria-pressed={selected.includes(option.id)} onClick={() => onToggle(option.id)}>{option.text}</button>)}</div><p className="feedback" aria-live="polite">{selected.length ? message : "전달문을 하나 이상 골라 보세요."}</p><button className="primary" disabled={!check.valid} onClick={onDone}>사건 기록 완성</button></section>;
}

function Result({ item, relay, onNext, onArchive }: { item: TransmissionCase; relay: string[]; onNext: () => void; onArchive: () => void }) {
  const names = Object.fromEntries(item.meaningUnits.map((unit) => [unit.id, unit.canonicalMeaning])); const first = item.expectedChanges[0]; const recovery = item.relayOptions.filter((option) => relay.includes(option.id)).flatMap((option) => option.meaningUnitIds).filter((id) => item.requiredMeaningUnitIds.includes(id));
  return <section className="card result"><p className="eyebrow">사건 결과</p><h1>뜻을 지키는 전달 기록을 남겼어요</h1><dl><div><dt>뜻을 지킨 정보</dt><dd>{item.requiredMeaningUnitIds.map((id) => names[id]).join(" · ")}</dd></div><div><dt>처음 달라진 정보</dt><dd>{first?.explanation ?? "없음"}</dd></div><div><dt>복구한 정보</dt><dd>{[...new Set(recovery)].map((id) => names[id]).join(" · ")}</dd></div><div><dt>내가 고른 안전 전달문</dt><dd>{item.relayOptions.filter((option) => relay.includes(option.id)).map((option) => option.text).join(" ")}</dd></div></dl><div className="button-row"><button className="primary" onClick={onNext}>다음 사건으로</button><button onClick={onArchive}>전달 보존 기록 보기</button></div></section>;
}

function Archive({ cases, completed, onMission }: { cases: TransmissionCase[]; completed: string[]; onMission: () => void }) {
  return <section className="card"><p className="eyebrow">전달 보존 기록</p><h1>완료한 사건만 모아 봐요</h1>{completed.length ? <ul className="archive">{cases.filter((item) => completed.includes(item.id)).map((item) => <li key={item.id}>✓ {item.title} · {item.purpose}</li>)}</ul> : <p>아직 완료한 사건이 없어요.</p>}<button className="primary" onClick={onMission}>사건 목록으로</button></section>;
}

function InfoDialog({ kind, closeRef, onClose }: { kind: Exclude<Dialog, null>; closeRef: React.RefObject<HTMLButtonElement | null>; onClose: () => void }) {
  const teacher = kind === "teacher";
  return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button ref={closeRef} className="close" onClick={onClose} aria-label="안내 닫기">×</button><h2 id="dialog-title">{teacher ? "교사용 안내" : "업데이트 내역"}</h2>{teacher ? <ul><li>이 활동은 학생의 기억력이나 말하기를 평가하는 도구가 아닙니다.</li><li>실제 친구 이야기는 입력하지 말고, 가상 사건만 사용합니다.</li><li>사건 내용은 수업에서 검수한 가상 학교 상황 범위입니다.</li><li>실제 긴급 안내나 안전 판단을 대신하지 않습니다.</li></ul> : <p>2026-07-17 · v0.1.0 · 최초 교육용 MVP 구현: 두 학년군 항로, 5개 사건, 의미 보존 판정과 안전 전달문 활동</p>}<button className="primary" onClick={onClose}>닫기</button></section></div>;
}
