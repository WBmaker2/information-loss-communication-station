import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정보 손실 통신소",
  description: "전해지는 동안 달라진 뜻을 찾아 안전하게 다시 보내요.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
