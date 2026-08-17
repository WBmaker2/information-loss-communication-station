import { useRef } from "react";
import type { KeyboardEvent, RefObject } from "react";

export function InfoDialog({ kind, closeRef, onClose }: { kind: "teacher" | "updates"; closeRef: RefObject<HTMLButtonElement | null>; onClose: () => void }) {
  const teacher = kind === "teacher";
  const dialogRef = useRef<HTMLElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
    if (event.key !== "Tab") return;
    const controls = dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), [href], input:not(:disabled)") ?? [];
    const first = controls[0], last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return <div className="modal-backdrop" role="presentation"><section ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onKeyDown={onKeyDown}><button ref={closeRef} className="close" onClick={onClose} aria-label="안내 닫기">×</button><h2 id="dialog-title">{teacher ? "교사용 안내" : "업데이트 내역"}</h2>{teacher ? <ul><li>이 활동은 학생의 기억력이나 말하기를 평가하는 도구가 아닙니다.</li><li>실제 친구 이야기는 입력하지 말고, 가상 사건만 사용합니다.</li><li>사건 내용은 수업에서 검수한 가상 학교 상황 범위입니다.</li><li>실제 긴급 안내나 안전 판단을 대신하지 않습니다.</li></ul> : <ul className="update-history"><li><strong>2026-08-16 · 풀이 안내 개선</strong><br />단계별 풀이 도움말, 다음 행동 안내, 중요한 버튼 주목 효과를 더했습니다.</li><li><strong>2026-07-18 · v0.3.0</strong><br />쉬운 문구, 선택 복구, 뒤로가기, 간결한 결과 화면을 더했습니다.</li><li><strong>2026-07-17 · v0.2.0</strong><br />사건 활동 진행 표시, 한국어 매체명, 비교 1·2·3 안내와 44px 터치 목표를 더했습니다.</li><li><strong>2026-07-17 · v0.1.0</strong><br />두 학년군 활동, 5개 사건, 중요한 내용 확인과 다시 전하기 활동을 처음 만들었습니다.</li></ul>}<button className="primary" onClick={onClose}>닫기</button></section></div>;
}
