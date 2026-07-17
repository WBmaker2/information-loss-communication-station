import type { ChangeType, TransmissionStage } from "../../domain/index";

export const changeNames: Record<ChangeType, string> = {
  omission: "내용이 빠짐",
  "unsupported-addition": "없던 내용이 생김",
  "meaning-shift": "뜻이 바뀜",
  "meaning-preserving": "같은 뜻",
  unchanged: "달라지지 않음",
};

export const labels: Record<string, string> = {
  actor: "누가",
  action: "무엇",
  time: "언제",
  place: "어디서",
  quantity: "수량",
  condition: "조건(어떤 때인지)",
  certainty: "확실성(예정인지 확정인지)",
  source: "출처(누가 알려 줬는지)",
  detail: "도움 정보",
  negation: "아님",
};

export const mediumNames: Record<TransmissionStage["medium"], string> = {
  notice: "안내문",
  spoken: "말",
  memo: "메모",
  broadcast: "방송",
};
