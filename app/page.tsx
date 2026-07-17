import CommunicationStation from "./CommunicationStation";

export const metadata = {
  title: "정보 손실 통신소",
  description: "전해지는 동안 달라진 뜻을 찾아 안전하게 다시 보내요.",
};

export default function Home() {
  return <CommunicationStation />;
}
