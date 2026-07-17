"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TRANSMISSION_CASES, judgeStageChange } from "../domain/index";
import type { ChangeType, GradeRoute, TransmissionCase } from "../domain/index";
import { Compare } from "./components/Compare";
import { InfoDialog } from "./components/InfoDialog";
import { Mission } from "./components/Mission";
import { Archive, Ledger, Relay, Result } from "./components/Outcome";
import { Tutorial, Welcome } from "./components/WelcomeTutorial";
import { canAdvanceTransition, clearCaseSession, resolvedChangeIdsForAnswer, transitionChanges } from "./progress";

type View = "welcome" | "tutorial" | "mission" | "compare" | "ledger" | "relay" | "result" | "archive";
type Dialog = "teacher" | "updates" | null;

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
  const [resolvedByCase, setResolvedByCase] = useState<Record<string, string[]>>({});
  const [dialog, setDialog] = useState<Dialog>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = TRANSMISSION_CASES.find((entry) => entry.id === caseId) ?? null;
  const routeCases = useMemo(
    () => TRANSMISSION_CASES.filter((entry) => entry.availableRoutes.includes(route)),
    [route],
  );

  useEffect(() => { if (dialog) closeRef.current?.focus(); }, [dialog]);

  const toggle = (id: string, values: string[], save: (next: string[]) => void) =>
    save(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]);
  const resetAnswer = () => {
    setSegments([]); setEvidence([]); setFeedback(""); setChangeType("omission");
  };
  const clearCurrentCase = (nextView: View) => {
    const cleared = clearCaseSession();
    setCaseId(cleared.caseId); setTransition(cleared.transition); setSegments(cleared.segments);
    setEvidence(cleared.evidence); setRelay(cleared.relay); setFeedback(""); setChangeType("omission");
    setView(nextView);
  };
  const openCase = (next: TransmissionCase) => {
    setCaseId(next.id); setTransition(0); resetAnswer(); setRelay([]); setView("mission");
  };
  const checkChange = () => {
    if (!item) return;
    const answer = {
      fromStageId: item.stages[transition].id,
      toStageId: item.stages[transition + 1].id,
      selectedSegmentIds: segments,
      changeType,
      evidenceMeaningUnitIds: evidence,
    };
    const judgement = judgeStageChange(item, answer);
    const newlyResolved = resolvedChangeIdsForAnswer(item, transition, answer, judgement.isCorrect);
    if (!judgement.isCorrect || !newlyResolved.length) { setFeedback(judgement.feedback); return; }
    const current = resolvedByCase[item.id] ?? [];
    const nextResolved = [...new Set([...current, ...newlyResolved])];
    const needed = transitionChanges(item, transition).length;
    const found = transitionChanges(item, transition).filter((change) => nextResolved.includes(change.id)).length;
    setResolvedByCase((all) => ({ ...all, [item.id]: nextResolved }));
    setSegments([]); setEvidence([]); setChangeType("omission");
    setFeedback(`${judgement.feedback} ${canAdvanceTransition(item, transition, nextResolved) ? "이 전이의 변화를 모두 찾았어요." : `이 전이에서 ${found}/${needed}개를 찾았어요.`}`);
  };
  const advanceComparison = () => {
    const resolved = item ? resolvedByCase[item.id] ?? [] : [];
    if (!item || !canAdvanceTransition(item, transition, resolved)) {
      setFeedback("이 전이에서 달라진 뜻을 모두 확인한 뒤 다음으로 갈 수 있어요.");
      return;
    }
    if (transition + 2 < item.stages.length) { setTransition(transition + 1); resetAnswer(); } else setView("ledger");
  };

  return <main className="station-shell">
    <header className="station-header">
      <button className="wordmark" onClick={() => clearCurrentCase("welcome")}>정보 손실 통신소</button>
      <p aria-live="polite" aria-current={item && view !== "welcome" ? "step" : undefined}>
        {route === "grade-3-4" ? "3~4학년 기본 항로" : "5~6학년 확장 항로"}
        {item && view !== "welcome" ? ` · 사건 ${routeCases.findIndex((entry) => entry.id === item.id) + 1}/${routeCases.length}` : ""}
      </p>
      <div className="header-actions"><button onClick={() => setDialog("teacher")}>교사용 안내</button><button onClick={() => setDialog("updates")}>업데이트 내역</button></div>
    </header>
    {view === "welcome" && <Welcome route={route} setRoute={(nextRoute) => { clearCurrentCase("welcome"); setRoute(nextRoute); }} onStart={() => setView("tutorial")} />}
    {view === "tutorial" && <Tutorial onDone={() => setView("mission")} />}
    {view === "mission" && <Mission cases={routeCases} current={item} completed={completed} onOpen={openCase} onCompare={() => setView("compare")} onBack={() => clearCurrentCase("mission")} />}
    {view === "compare" && item && <Compare item={item} transition={transition} resolvedIds={resolvedByCase[item.id] ?? []} segments={segments} evidence={evidence} changeType={changeType} feedback={feedback} onSegment={(id) => toggle(id, segments, setSegments)} onEvidence={(id) => toggle(id, evidence, setEvidence)} onType={setChangeType} onCheck={checkChange} onNext={advanceComparison} />}
    {view === "ledger" && item && <Ledger item={item} onNext={() => setView("relay")} />}
    {view === "relay" && item && <Relay item={item} selected={relay} onToggle={(id) => toggle(id, relay, setRelay)} onDone={() => { setCompleted((ids) => ids.includes(item.id) ? ids : [...ids, item.id]); setView("result"); }} />}
    {view === "result" && item && <Result item={item} relay={relay} onNext={() => clearCurrentCase("mission")} onArchive={() => clearCurrentCase("archive")} />}
    {view === "archive" && <Archive cases={TRANSMISSION_CASES} completed={completed} onMission={() => clearCurrentCase("mission")} />}
    {dialog && <InfoDialog kind={dialog} closeRef={closeRef} onClose={() => setDialog(null)} />}
  </main>;
}
