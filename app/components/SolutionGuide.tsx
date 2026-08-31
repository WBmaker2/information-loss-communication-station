type SolutionGuideProps = {
  activeStep?: number;
  example?: string;
  compact?: boolean;
};

const SOLUTION_STEPS = [
  {
    title: "두 문장을 읽어요",
    body: "누가, 언제, 어디서, 무엇을 하는지 천천히 찾아요.",
  },
  {
    title: "달라진 말을 눌러요",
    body: "빠진 말은 이전, 바뀌거나 새로 생긴 말은 다음에서 골라요.",
  },
  {
    title: "변화 모습을 골라요",
    body: "빠짐·추가·뜻 바뀜·같은 뜻 중 하나를 골라요.",
  },
  {
    title: "문장 속 근거를 골라요",
    body: "왜 그렇게 생각했는지 보여 주는 말을 골라요.",
  },
  {
    title: "내 답을 확인해요",
    body: "맞으면 다음으로 가요. 틀리면 고른 말을 다시 살펴봐요.",
  },
];

export function SolutionGuide({ activeStep = 1, example, compact = false }: SolutionGuideProps) {
  const safeActiveStep = Math.min(Math.max(activeStep, 0), SOLUTION_STEPS.length - 1);
  return (
    <aside className={compact ? "solution-guide compact" : "solution-guide"} aria-labelledby="solution-guide-title">
      <div className="solution-guide-heading">
        <span className="guide-kicker">풀이 도움말</span>
        <h2 id="solution-guide-title">이렇게 찾으면 쉬워요</h2>
        <p>한 번에 하나씩만 해도 괜찮아요.</p>
      </div>
      <ol className="solution-steps">
        {SOLUTION_STEPS.map((step, index) => (
          <li key={step.title} className={index === safeActiveStep ? "active" : index < safeActiveStep ? "done" : ""}>
            <span className="solution-step-number" aria-hidden="true">{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      {example && <p className="solution-example"><strong>작은 예:</strong> {example}</p>}
    </aside>
  );
}
