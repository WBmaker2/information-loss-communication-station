import type { ChangeType } from "../../domain/index";

export const changeNames: Record<ChangeType, string> = {
  omission: "빠짐",
  "unsupported-addition": "근거 없는 추가",
  "meaning-shift": "뜻이 달라짐",
  "meaning-preserving": "뜻 유지",
  unchanged: "달라지지 않음",
};

export const labels: Record<string, string> = {
  actor: "누가",
  action: "무엇",
  time: "언제",
  place: "어디서",
  quantity: "수량",
  condition: "조건",
  certainty: "확실성",
  source: "출처",
  detail: "도움 정보",
  negation: "아님",
};
