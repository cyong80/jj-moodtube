import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기분 분석",
  description: "오늘의 기분을 분석하고 맞춤 플레이리스트를 받아보세요",
};

export default function MoodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
