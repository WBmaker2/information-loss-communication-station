const WORKFLOW_STEPS = ["사건 선택", "비교", "전체 점검", "안전 전달", "결과"];

export function WorkflowProgress({ currentStep }: { currentStep: number }) {
  return <nav className="workflow-progress" aria-label="사건 활동 진행">
    <ol>
      {WORKFLOW_STEPS.map((step, index) => <li key={step} className={index === currentStep ? "current" : index < currentStep ? "complete" : ""} aria-current={index === currentStep ? "step" : undefined}>
        <span className="workflow-step-number" aria-hidden="true">{index + 1}</span>
        <span>{step}</span>
      </li>)}
    </ol>
  </nav>;
}
