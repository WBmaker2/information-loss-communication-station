"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TRANSMISSION_CASES, judgeStageChange } from "../domain/index";
import type { ChangeType, GradeRoute, TransmissionCase } from "../domain/index";
import { Compare } from "./components/Compare";
import { InfoDialog } from "./components/InfoDialog";
import { Mission } from "./components/Mission";
import { Archive, Ledger, Relay, Result } from "./components/Outcome";
import { Tutorial, Welcome } from "./components/WelcomeTutorial";
import { WorkflowProgress } from "./components/WorkflowProgress";
import { canAdvanceTransition, clearCaseSession, resolvedChangeIdsForAnswer, transitionChanges } from "./progress";
import { buildCompletedRecord } from "./records";
import type { CompletedCaseRecord, LearnerFinding } from "./records";

type View = "welcome" | "tutorial" | "mission" | "compare" | "ledger" | "relay" | "result" | "archive";
type Dialog = "teacher" | "updates" | null;

const workflowStepByView: Partial<Record<View, number>> = {
  mission: 0,
  compare: 1,
  ledger: 2,
  relay: 3,
  result: 4,
};

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
  const [findingsByCase, setFindingsByCase] = useState<Record<string, LearnerFinding[]>>({});
  const [completedRecords, setCompletedRecords] = useState<CompletedCaseRecord[]>([]);
  const [resolvedByCase, setResolvedByCase] = useState<Record<string, string[]>>({});
  const [dialog, setDialog] = useState<Dialog>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const item = TRANSMISSION_CASES.find((entry) => entry.id === caseId) ?? null;
  const routeCases = useMemo(
    () => TRANSMISSION_CASES.filter((entry) => entry.availableRoutes.includes(route)),
    [route],
  );
  const workflowStep = item ? workflowStepByView[view] : undefined;

  useEffect(() => { if (dialog) closeRef.current?.focus(); }, [dialog]);
  useEffect(() => { window.scrollTo(0, 0); }, [view, transition]);

  const toggle = (id: string, values: string[], save: (next: string[]) => void) =>
    save(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]);
  const resetAnswer = () => {
    setSegments([]); setEvidence([]); setFeedback(""); setChangeType("omission");
  };
  const clearCurrentSelection = () => {
    setSegments([]); setEvidence([]); setFeedback("");
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
    if (!item) return false;
    const answer = {
      fromStageId: item.stages[transition].id,
      toStageId: item.stages[transition + 1].id,
      selectedSegmentIds: segments,
      changeType,
      evidenceMeaningUnitIds: evidence,
    };
    const judgement = judgeStageChange(item, answer);
    const newlyResolved = resolvedChangeIdsForAnswer(item, transition, answer, judgement.isCorrect);
    if (!judgement.isCorrect || !newlyResolved.length) { setFeedback(judgement.feedback); return false; }
    const current = resolvedByCase[item.id] ?? [];
    const nextResolved = [...new Set([...current, ...newlyResolved])];
    const needed = transitionChanges(item, transition).length;
    const found = transitionChanges(item, transition).filter((change) => nextResolved.includes(change.id)).length;
    setResolvedByCase((all) => ({ ...all, [item.id]: nextResolved }));
    setFindingsByCase((all) => {
      const prior = all[item.id] ?? [];
      const additions = newlyResolved.filter((id) => !prior.some((finding) => finding.changeId === id)).map((changeId) => ({
        changeId, type: item.expectedChanges.find((change) => change.id === changeId)!.type,
        selectedSegmentIds: answer.selectedSegmentIds, selectedEvidenceMeaningIds: answer.evidenceMeaningUnitIds,
      }));
      return { ...all, [item.id]: [...prior, ...additions] };
    });
    setSegments([]); setEvidence([]); setChangeType("omission");
    setFeedback(`${judgement.feedback} ${canAdvanceTransition(item, transition, nextResolved) ? "이번 비교의 변화를 모두 찾았어요." : `이번 비교에서 ${found}/${needed}개를 찾았어요.`}`);
    return true;
  };
  const advanceComparison = () => {
    const resolved = item ? resolvedByCase[item.id] ?? [] : [];
    if (!item || !canAdvanceTransition(item, transition, resolved)) {
      setFeedback("이번 비교에서 달라진 뜻을 모두 확인한 뒤 다음으로 갈 수 있어요.");
      return;
    }
    if (transition + 2 < item.stages.length) { setTransition(transition + 1); resetAnswer(); } else setView("ledger");
  };
  const openDialog = (nextDialog: Exclude<Dialog, null>, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setDialog(nextDialog);
  };
  const closeDialog = () => {
    setDialog(null);
    queueMicrotask(() => openerRef.current?.focus());
  };

  return <main className="station-shell">
    <header className="station-header mobile-header">
      <div className="header-top">
        <button className="wordmark" onClick={() => clearCurrentCase("welcome")}>정보 손실 통신소</button>
        <div className="header-actions"><button onClick={(event) => openDialog("teacher", event.currentTarget)}>교사용 안내</button><button onClick={(event) => openDialog("updates", event.currentTarget)}>업데이트 내역</button></div>
      </div>
      <p className="header-status" aria-live="polite">
        <span>{route === "grade-3-4" ? "3~4학년 기본 활동" : "5~6학년 도전 활동"}</span>
        {item && workflowStep !== undefined && <span>사건 {routeCases.findIndex((entry) => entry.id === item.id) + 1}/{routeCases.length}</span>}
      </p>
    </header>
    {workflowStep !== undefined && <WorkflowProgress currentStep={workflowStep} />}
    {view === "welcome" && <Welcome route={route} setRoute={(nextRoute) => { clearCurrentCase("welcome"); setRoute(nextRoute); }} onStart={() => setView("tutorial")} />}
    {view === "tutorial" && <Tutorial onDone={() => setView("mission")} onBack={() => clearCurrentCase("welcome")} />}
    {view === "mission" && <Mission cases={routeCases} current={item} completed={completedRecords.map(({ caseId }) => caseId)} onOpen={openCase} onCompare={() => setView("compare")} onBack={() => clearCurrentCase("mission")} />}
    {view === "compare" && item && <Compare item={item} transition={transition} resolvedIds={resolvedByCase[item.id] ?? []} segments={segments} evidence={evidence} changeType={changeType} feedback={feedback} onSegment={(id) => toggle(id, segments, setSegments)} onEvidence={(id) => toggle(id, evidence, setEvidence)} onType={setChangeType} onCheck={checkChange} onClear={clearCurrentSelection} onBack={() => { resetAnswer(); setView("mission"); }} onNext={advanceComparison} />}
    {view === "ledger" && item && <Ledger item={item} onNext={() => setView("relay")} onBack={() => setView("compare")} />}
    {view === "relay" && item && <Relay item={item} selected={relay} onToggle={(id) => toggle(id, relay, setRelay)} onDone={() => { const record = buildCompletedRecord(item, findingsByCase[item.id] ?? [], relay); setCompletedRecords((records) => [...records.filter(({ caseId }) => caseId !== item.id), record]); setView("result"); }} onBack={() => setView("ledger")} />}
    {view === "result" && item && <Result item={item} relay={relay} findings={findingsByCase[item.id] ?? []} onNext={() => clearCurrentCase("mission")} onArchive={() => clearCurrentCase("archive")} />}
    {view === "archive" && <Archive cases={TRANSMISSION_CASES} records={completedRecords} onMission={() => clearCurrentCase("mission")} />}
    {dialog && <InfoDialog kind={dialog} closeRef={closeRef} onClose={closeDialog} />}
  </main>;
}
