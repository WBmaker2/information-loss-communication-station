type SelectionSummaryProps = {
  selectedSegmentCount: number;
  selectedEvidenceCount: number;
  onClear: () => void;
  guidanceId?: string;
  showNextGuidance?: boolean;
};

export function SelectionSummary({
  selectedSegmentCount,
  selectedEvidenceCount,
  onClear,
  guidanceId,
  showNextGuidance = false,
}: SelectionSummaryProps) {
  return (
    <div className="selection-summary">
      <p>문장 선택 {selectedSegmentCount}개 · 이유 선택 {selectedEvidenceCount}개</p>
      <button type="button" onClick={onClear}>고른 것 지우기</button>
      {showNextGuidance && guidanceId && (
        <p id={guidanceId} className="next-guidance">먼저 내 답 확인을 눌러요.</p>
      )}
    </div>
  );
}
