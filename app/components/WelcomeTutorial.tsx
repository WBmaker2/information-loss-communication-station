import { useState } from "react";
import { TUTORIAL_CASE } from "../../domain/index";
import type { GradeRoute } from "../../domain/index";
import { MessageCard } from "./Compare";

export function Welcome({ route, setRoute, onStart }: { route: GradeRoute; setRoute: (value: GradeRoute) => void; onStart: () => void }) {
  return <section className="hero card"><p className="eyebrow">가상 통신 기록실</p><h1>전해지는 동안 달라진 뜻을 찾아 안전하게 다시 보내요</h1><p className="lead">문장이 짧아져도 중요한 뜻은 남아 있을까요? 기록을 나란히 보고, 근거를 찾아 다시 전해 봐요.</p><fieldset><legend>오늘의 항로를 골라요</legend><div className="route-grid"><button className={route === "grade-3-4" ? "route selected" : "route"} onClick={() => setRoute("grade-3-4")} aria-pressed={route === "grade-3-4"}><strong>3~4학년 기본 항로</strong><span>시간·장소·수량처럼 보이는 뜻을 찾습니다.</span></button><button className={route === "grade-5-6" ? "route selected" : "route"} onClick={() => setRoute("grade-5-6")} aria-pressed={route === "grade-5-6"}><strong>5~6학년 확장 항로</strong><span>조건·출처·확실한 정도까지 살핍니다.</span></button></div></fieldset><p className="privacy">🔒 개인정보를 모으거나 저장하지 않아요. 가상 사건만 다룹니다.</p><button className="primary" onClick={onStart}>통신 임무 시작</button></section>;
}

export function Tutorial({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const stages = TUTORIAL_CASE.stages;
  return <section className="card lesson"><p className="eyebrow">안내 활동 · {step + 1}/2</p><h1>{TUTORIAL_CASE.title}</h1><p>{TUTORIAL_CASE.purpose}</p><div className="comparison"><MessageCard title="앞 문장" stage={stages[step]} /><MessageCard title="다음 문장" stage={stages[step + 1]} /></div><aside className="hint"><strong>{step === 0 ? "✓ 뜻 유지" : "! 범위가 바뀜"}</strong><p>{TUTORIAL_CASE.expectedChanges[step].explanation}</p></aside><div className="button-row"><button onClick={() => setStep(0)}>다시 보기</button><button className="primary" onClick={() => step === 0 ? setStep(1) : onDone()}>{step === 0 ? "다음 비교" : "사건 임무로"}</button></div><button className="text-button" onClick={onDone}>안내 활동 건너뛰기</button></section>;
}
