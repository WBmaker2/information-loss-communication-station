import type {
  MeaningKind,
  MeaningUnit,
  PhraseSegment,
  TransmissionCase,
  TransmissionStage,
} from "./types.js";

const unit = (
  id: string,
  kind: MeaningKind,
  canonicalMeaning: string,
  requiredForPurpose = true,
): MeaningUnit => ({
  id,
  kind,
  canonicalMeaning,
  studentLabel: canonicalMeaning,
  requiredForPurpose,
  allowedParaphraseIds: [],
});

const segment = (
  id: string,
  text: string,
  meaningUnitIds: string[],
  introducesUnsupportedMeaningIds: string[] = [],
): PhraseSegment => ({
  id,
  text,
  meaningUnitIds,
  introducesUnsupportedMeaningIds,
  accessibilityLabel: text,
});

const stage = (
  id: string,
  order: number,
  medium: TransmissionStage["medium"],
  segments: PhraseSegment[],
): TransmissionStage => ({
  id,
  order,
  senderRole: order === 0 ? "안내 담당" : "전달 담당",
  audienceRole: "받는 사람",
  medium,
  segments,
  expressedMeaningUnitIds: [...new Set(segments.flatMap((item) => item.meaningUnitIds))],
});

export const TUTORIAL_CASE: TransmissionCase = {
  id: "tutorial-same-meaning",
  title: "세 문장이 같은 뜻일까요",
  purpose: "말이 달라도 뜻이 같은지 비교해요.",
  audienceId: "tutorial-learners",
  availableRoutes: ["grade-3-4", "grade-5-6"],
  meaningUnits: [
    unit("tutorial-group", "actor", "각 모둠"),
    unit("tutorial-paper", "action", "색종이 한 묶음을 준비"),
    unit("tutorial-each-person", "actor", "각자", false),
  ],
  stages: [
    stage("tutorial-original", 0, "notice", [
      segment("tutorial-original-group", "각 모둠은", ["tutorial-group"]),
      segment("tutorial-original-paper", "색종이 한 묶음을 준비해요.", ["tutorial-paper"]),
    ]),
    stage("tutorial-a", 1, "spoken", [
      segment("tutorial-a-group", "모둠별로", ["tutorial-group"]),
      segment("tutorial-a-paper", "색종이 한 묶음을 준비해요.", ["tutorial-paper"]),
    ]),
    stage("tutorial-b", 2, "spoken", [
      segment("tutorial-b-group", "각자", ["tutorial-each-person"]),
      segment("tutorial-b-paper", "색종이 한 묶음을 준비해요.", ["tutorial-paper"]),
    ]),
  ],
  expectedChanges: [
    {
      id: "tutorial-preserving",
      fromStageId: "tutorial-original",
      toStageId: "tutorial-a",
      sourceSegmentIds: ["tutorial-original-group"],
      targetSegmentIds: ["tutorial-a-group"],
      meaningUnitIds: ["tutorial-group"],
      type: "meaning-preserving",
      explanation: "모둠별로는 각 모둠과 같은 뜻이에요.",
    },
    {
      id: "tutorial-shift",
      fromStageId: "tutorial-a",
      toStageId: "tutorial-b",
      sourceSegmentIds: ["tutorial-a-group"],
      targetSegmentIds: ["tutorial-b-group"],
      meaningUnitIds: ["tutorial-group", "tutorial-each-person"],
      type: "meaning-shift",
      explanation: "각자는 모둠별과 준비하는 범위가 달라요.",
    },
  ],
  relayOptions: [
    {
      id: "tutorial-relay",
      text: "모둠별로 색종이 한 묶음을 준비해요.",
      meaningUnitIds: ["tutorial-group", "tutorial-paper"],
      unsupportedMeaningIds: [],
      validForAudienceIds: ["tutorial-learners"],
    },
  ],
  requiredMeaningUnitIds: ["tutorial-group", "tutorial-paper"],
  teacherNotes: ["각 모둠과 각자의 범위를 먼저 비교합니다."],
};

const CASE_ONE: TransmissionCase = {
  id: "case-1-rainy-meeting",
  title: "비 오는 날 모임 장소",
  purpose: "비가 올 때 바뀌는 모임 장소를 정확히 전해요.",
  audienceId: "case-1-groups",
  availableRoutes: ["grade-3-4"],
  meaningUnits: [
    unit("case-1-time", "time", "금요일 2시"),
    unit("case-1-place", "place", "운동장"),
    unit("case-1-rain", "condition", "비가 오면 체육관"),
    unit("case-1-board", "detail", "모둠 안내판 앞", false),
  ],
  stages: [
    stage("case-1-original", 0, "notice", [
      segment("case-1-original-time-place", "금요일 2시에 운동장에 모여요.", ["case-1-time", "case-1-place"]),
      segment("case-1-original-rain", "비가 오면 체육관에서 만나요.", ["case-1-rain"]),
      segment("case-1-original-board", "모둠 안내판 앞에 모여요.", ["case-1-board"]),
    ]),
    stage("case-1-first-relay", 1, "spoken", [
      segment("case-1-first-time-place", "금요일 2시에 운동장에 모여요.", ["case-1-time", "case-1-place"]),
      segment("case-1-first-rain", "비가 오면 체육관에서 만나요.", ["case-1-rain"]),
    ]),
    stage("case-1-second-relay", 2, "memo", [
      segment("case-1-second-time-place", "금요일 2시에 운동장에 모여요.", ["case-1-time", "case-1-place"]),
    ]),
  ],
  expectedChanges: [
    {
      id: "case-1-board-omission",
      fromStageId: "case-1-original",
      toStageId: "case-1-first-relay",
      sourceSegmentIds: ["case-1-original-board"],
      targetSegmentIds: ["case-1-first-time-place"],
      meaningUnitIds: ["case-1-board"],
      type: "omission",
      explanation: "모둠 안내판 앞이라는 자세한 위치가 빠졌어요.",
    },
    {
      id: "case-1-rain-omission",
      fromStageId: "case-1-first-relay",
      toStageId: "case-1-second-relay",
      sourceSegmentIds: ["case-1-first-rain"],
      targetSegmentIds: ["case-1-second-time-place"],
      meaningUnitIds: ["case-1-rain"],
      type: "omission",
      explanation: "비가 올 때만 체육관으로 간다는 조건이 빠졌어요.",
    },
  ],
  relayOptions: [
    { id: "case-1-safe-basic", text: "금요일 2시, 비가 오지 않으면 운동장에 모이고 비가 오면 체육관에서 만나요.", meaningUnitIds: ["case-1-time", "case-1-place", "case-1-rain"], unsupportedMeaningIds: [], validForAudienceIds: ["case-1-groups"] },
    { id: "case-1-safe-detail", text: "금요일 2시에 운동장 모둠 안내판 앞에서 모여요. 비가 오면 체육관으로 가요.", meaningUnitIds: ["case-1-time", "case-1-place", "case-1-rain", "case-1-board"], unsupportedMeaningIds: [], validForAudienceIds: ["case-1-groups"] },
  ],
  requiredMeaningUnitIds: ["case-1-time", "case-1-place", "case-1-rain"],
  teacherNotes: ["자세한 위치와 우천 조건의 중요도를 비교합니다."],
};

const CASE_TWO: TransmissionCase = {
  id: "case-2-library-return",
  title: "도서관 반납 안내",
  purpose: "빌린 책의 반납 기한과 장소를 근거 있게 전해요.",
  audienceId: "case-2-borrowers",
  availableRoutes: ["grade-3-4"],
  meaningUnits: [
    unit("case-2-books", "action", "빌린 책을 반납"),
    unit("case-2-wednesday", "time", "수요일까지"),
    unit("case-2-box", "place", "도서관 반납함"),
    unit("case-2-penalty", "detail", "늦으면 대출할 수 없음", false),
  ],
  stages: [
    stage("case-2-original", 0, "notice", [
      segment("case-2-original-all", "빌린 책은 수요일까지 도서관 반납함에 넣어 주세요.", ["case-2-books", "case-2-wednesday", "case-2-box"]),
    ]),
    stage("case-2-first-relay", 1, "spoken", [
      segment("case-2-first-all", "수요일 전까지 빌린 책을 도서관의 반납 상자에 돌려주세요.", ["case-2-books", "case-2-wednesday", "case-2-box"]),
    ]),
    stage("case-2-second-relay", 2, "memo", [
      segment("case-2-second-all", "빌린 책은 수요일까지 도서관 반납함에 넣어 주세요.", ["case-2-books", "case-2-wednesday", "case-2-box"]),
      segment("case-2-second-penalty", "늦으면 책을 더 빌릴 수 없어요.", ["case-2-penalty"], ["case-2-penalty"]),
    ]),
  ],
  expectedChanges: [
    { id: "case-2-preserving", fromStageId: "case-2-original", toStageId: "case-2-first-relay", sourceSegmentIds: ["case-2-original-all"], targetSegmentIds: ["case-2-first-all"], meaningUnitIds: ["case-2-books", "case-2-wednesday", "case-2-box"], type: "meaning-preserving", explanation: "표현은 달라도 반납할 책, 기한, 장소는 같아요." },
    { id: "case-2-penalty-addition", fromStageId: "case-2-first-relay", toStageId: "case-2-second-relay", sourceSegmentIds: ["case-2-first-all"], targetSegmentIds: ["case-2-second-penalty"], meaningUnitIds: ["case-2-penalty"], type: "unsupported-addition", explanation: "대출 불이익은 앞 전달문과 원문에 근거가 없어요." },
  ],
  relayOptions: [
    { id: "case-2-safe", text: "빌린 책을 수요일까지 도서관 반납함에 넣어 주세요.", meaningUnitIds: ["case-2-books", "case-2-wednesday", "case-2-box"], unsupportedMeaningIds: [], validForAudienceIds: ["case-2-borrowers"] },
    { id: "case-2-unsafe", text: "늦으면 책을 빌릴 수 없으니 수요일까지 반납해요.", meaningUnitIds: ["case-2-books", "case-2-wednesday", "case-2-box", "case-2-penalty"], unsupportedMeaningIds: ["case-2-penalty"], validForAudienceIds: ["case-2-borrowers"] },
  ],
  requiredMeaningUnitIds: ["case-2-books", "case-2-wednesday", "case-2-box"],
  teacherNotes: ["그럴듯한 불이익도 원문 근거가 없으면 더한 정보입니다."],
};

const CASE_THREE: TransmissionCase = {
  id: "case-3-craft-cups",
  title: "만들기 재료 수량",
  purpose: "모둠별 최대 수량을 바꾸지 않고 전해요.",
  audienceId: "case-3-makers",
  availableRoutes: ["grade-3-4", "grade-5-6"],
  meaningUnits: [
    unit("case-3-group", "actor", "모둠별"),
    unit("case-3-cups", "action", "종이컵 사용 가능"),
    unit("case-3-maximum-two", "quantity", "최대 두 개"),
    unit("case-3-exactly-two", "quantity", "두 개", false),
    unit("case-3-per-student", "actor", "학생마다 두 개", false),
  ],
  stages: [
    stage("case-3-original", 0, "notice", [segment("case-3-original-all", "모둠별로 종이컵을 최대 두 개까지 사용할 수 있어요.", ["case-3-group", "case-3-cups", "case-3-maximum-two"])]),
    stage("case-3-first-relay", 1, "spoken", [segment("case-3-first-all", "모둠별로 종이컵 두 개를 사용해요.", ["case-3-group", "case-3-cups", "case-3-exactly-two"])]),
    stage("case-3-second-relay", 2, "memo", [segment("case-3-second-all", "학생마다 종이컵 두 개를 사용해요.", ["case-3-per-student", "case-3-cups", "case-3-exactly-two"])]),
  ],
  expectedChanges: [
    { id: "case-3-limit-shift", fromStageId: "case-3-original", toStageId: "case-3-first-relay", sourceSegmentIds: ["case-3-original-all"], targetSegmentIds: ["case-3-first-all"], meaningUnitIds: ["case-3-maximum-two", "case-3-exactly-two"], type: "meaning-shift", explanation: "최대 두 개까지가 꼭 두 개로 달라졌어요." },
    { id: "case-3-unit-shift", fromStageId: "case-3-first-relay", toStageId: "case-3-second-relay", sourceSegmentIds: ["case-3-first-all"], targetSegmentIds: ["case-3-second-all"], meaningUnitIds: ["case-3-group", "case-3-per-student"], type: "meaning-shift", explanation: "모둠별이 학생마다로 바뀌어 나누는 단위가 달라졌어요." },
  ],
  relayOptions: [
    { id: "case-3-safe", text: "종이컵은 모둠별로 최대 두 개까지 사용할 수 있어요.", meaningUnitIds: ["case-3-group", "case-3-cups", "case-3-maximum-two"], unsupportedMeaningIds: [], validForAudienceIds: ["case-3-makers"] },
  ],
  requiredMeaningUnitIds: ["case-3-group", "case-3-cups", "case-3-maximum-two"],
  teacherNotes: ["수량의 최대 범위와 배분 단위를 함께 살핍니다."],
};

const CASE_FOUR: TransmissionCase = {
  id: "case-4-afterschool-schedule",
  title: "방과 후 일정은 아직 예정",
  purpose: "확정되지 않은 일정과 확인 방법을 정확히 전해요.",
  audienceId: "case-4-participants",
  availableRoutes: ["grade-5-6"],
  meaningUnits: [
    unit("case-4-next-week", "time", "다음 주"),
    unit("case-4-tuesday", "time", "화요일로 바뀔 예정"),
    unit("case-4-monday-check", "time", "월요일에 최종 확인"),
    unit("case-4-teacher", "source", "담당 선생님 안내"),
    unit("case-4-planned", "certainty", "예정"),
    unit("case-4-confirmed", "certainty", "확정", false),
  ],
  stages: [
    stage("case-4-original", 0, "notice", [segment("case-4-original-all", "다음 주 방과 후 일정은 화요일로 바뀔 예정이에요. 월요일에 담당 선생님 안내로 최종 확인해요.", ["case-4-next-week", "case-4-tuesday", "case-4-monday-check", "case-4-teacher", "case-4-planned"])]),
    stage("case-4-first-relay", 1, "spoken", [segment("case-4-first-all", "다음 주 방과 후 일정은 화요일로 바뀔 예정이고 월요일에 최종 확인해요.", ["case-4-next-week", "case-4-tuesday", "case-4-monday-check", "case-4-planned"])]),
    stage("case-4-second-relay", 2, "memo", [segment("case-4-second-all", "다음 주 방과 후 일정은 화요일로 확정됐고 월요일에 확인해요.", ["case-4-next-week", "case-4-tuesday", "case-4-monday-check", "case-4-confirmed"])]),
  ],
  expectedChanges: [
    { id: "case-4-source-omission", fromStageId: "case-4-original", toStageId: "case-4-first-relay", sourceSegmentIds: ["case-4-original-all"], targetSegmentIds: ["case-4-first-all"], meaningUnitIds: ["case-4-teacher"], type: "omission", explanation: "담당 선생님 안내라는 출처가 빠졌어요." },
    { id: "case-4-certainty-shift", fromStageId: "case-4-first-relay", toStageId: "case-4-second-relay", sourceSegmentIds: ["case-4-first-all"], targetSegmentIds: ["case-4-second-all"], meaningUnitIds: ["case-4-planned", "case-4-confirmed"], type: "meaning-shift", explanation: "예정이 확정으로 바뀌어 확실한 정도가 달라졌어요." },
  ],
  relayOptions: [
    { id: "case-4-safe", text: "다음 주 방과 후 일정은 화요일로 바뀔 예정이에요. 월요일에 담당 선생님 안내로 최종 확인해요.", meaningUnitIds: ["case-4-next-week", "case-4-tuesday", "case-4-monday-check", "case-4-teacher", "case-4-planned"], unsupportedMeaningIds: [], validForAudienceIds: ["case-4-participants"] },
  ],
  requiredMeaningUnitIds: ["case-4-next-week", "case-4-tuesday", "case-4-monday-check", "case-4-teacher", "case-4-planned"],
  teacherNotes: ["예정과 확정의 차이, 출처의 필요성을 나눠 봅니다."],
};

const CASE_FIVE: TransmissionCase = {
  id: "case-5-broadcast-handover",
  title: "가상 학교 방송 인수인계",
  purpose: "방송 인수인계에서 확인된 조건과 시간을 빠뜨리지 않아요.",
  audienceId: "case-5-broadcast-team",
  availableRoutes: ["grade-5-6"],
  meaningUnits: [
    unit("case-5-broadcast", "action", "방송 내용을 전달"),
    unit("case-5-friday-morning", "time", "금요일 오전"),
    unit("case-5-studio", "place", "가상 방송실"),
    unit("case-5-condition", "condition", "비상 안내가 있을 때만"),
    unit("case-5-source", "source", "담당 안내문"),
    unit("case-5-confirmed", "certainty", "확인된 내용만"),
    unit("case-5-friday-afternoon", "time", "금요일 오후", false),
    unit("case-5-flashlight", "detail", "손전등 준비", false),
  ],
  stages: [
    stage("case-5-original", 0, "notice", [segment("case-5-original-all", "담당 안내문에서 확인된 내용만, 비상 안내가 있을 때 금요일 오전 가상 방송실에서 방송으로 전달해요.", ["case-5-broadcast", "case-5-friday-morning", "case-5-studio", "case-5-condition", "case-5-source", "case-5-confirmed"])]),
    stage("case-5-memo", 1, "memo", [segment("case-5-memo-all", "금요일 오전에 가상 방송실에서, 담당 안내문으로 확인한 비상 안내만 방송해요.", ["case-5-broadcast", "case-5-friday-morning", "case-5-studio", "case-5-condition", "case-5-source", "case-5-confirmed"])]),
    stage("case-5-draft", 2, "broadcast", [
      segment("case-5-draft-main", "금요일 오후 가상 방송실에서 방송 내용을 전달해요.", ["case-5-broadcast", "case-5-friday-afternoon", "case-5-studio"]),
      segment("case-5-draft-source", "담당 안내문에서 확인한 내용이에요.", ["case-5-source", "case-5-confirmed"]),
      segment("case-5-draft-flashlight", "손전등도 준비해요.", ["case-5-flashlight"], ["case-5-flashlight"]),
    ]),
  ],
  expectedChanges: [
    { id: "case-5-preserving", fromStageId: "case-5-original", toStageId: "case-5-memo", sourceSegmentIds: ["case-5-original-all"], targetSegmentIds: ["case-5-memo-all"], meaningUnitIds: ["case-5-broadcast", "case-5-friday-morning", "case-5-studio", "case-5-condition", "case-5-source", "case-5-confirmed"], type: "meaning-preserving", explanation: "문장 순서는 달라도 여섯 뜻 조각이 모두 같아요." },
    { id: "case-5-condition-omission", fromStageId: "case-5-memo", toStageId: "case-5-draft", sourceSegmentIds: ["case-5-memo-all"], targetSegmentIds: ["case-5-draft-main"], meaningUnitIds: ["case-5-condition"], type: "omission", explanation: "비상 안내가 있을 때만 한다는 조건이 빠졌어요." },
    { id: "case-5-time-shift", fromStageId: "case-5-memo", toStageId: "case-5-draft", sourceSegmentIds: ["case-5-memo-all"], targetSegmentIds: ["case-5-draft-main"], meaningUnitIds: ["case-5-friday-morning", "case-5-friday-afternoon"], type: "meaning-shift", explanation: "금요일 오전이 오후로 바뀌었어요." },
    { id: "case-5-flashlight-addition", fromStageId: "case-5-memo", toStageId: "case-5-draft", sourceSegmentIds: ["case-5-memo-all"], targetSegmentIds: ["case-5-draft-flashlight"], meaningUnitIds: ["case-5-flashlight"], type: "unsupported-addition", explanation: "손전등 준비는 앞 전달문과 원문에 근거가 없어요." },
  ],
  relayOptions: [
    { id: "case-5-safe-one-sentence", text: "비상 안내가 있을 때만 담당 안내문에서 확인된 내용을 금요일 오전 가상 방송실에서 방송으로 전달해요.", meaningUnitIds: ["case-5-broadcast", "case-5-friday-morning", "case-5-studio", "case-5-condition", "case-5-source", "case-5-confirmed"], unsupportedMeaningIds: [], validForAudienceIds: ["case-5-broadcast-team"] },
    { id: "case-5-safe-two-sentences", text: "금요일 오전 가상 방송실에서 방송 내용을 전달해요. 비상 안내가 있을 때 담당 안내문으로 확인한 내용만 전해요.", meaningUnitIds: ["case-5-broadcast", "case-5-friday-morning", "case-5-studio", "case-5-condition", "case-5-source", "case-5-confirmed"], unsupportedMeaningIds: [], validForAudienceIds: ["case-5-broadcast-team"] },
    { id: "case-5-unsafe", text: "손전등을 준비하고 오후 방송을 해요.", meaningUnitIds: ["case-5-broadcast", "case-5-friday-afternoon", "case-5-flashlight"], unsupportedMeaningIds: ["case-5-friday-afternoon", "case-5-flashlight"], validForAudienceIds: ["case-5-broadcast-team"] },
  ],
  requiredMeaningUnitIds: ["case-5-broadcast", "case-5-friday-morning", "case-5-studio", "case-5-condition", "case-5-source", "case-5-confirmed"],
  teacherNotes: ["처음 변한 단계와 누적된 손실을 구분합니다."],
};

export const TRANSMISSION_CASES: TransmissionCase[] = [
  CASE_ONE,
  CASE_TWO,
  CASE_THREE,
  CASE_FOUR,
  CASE_FIVE,
];
