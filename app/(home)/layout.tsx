import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "Google 계정으로 로그인하여 MoodTube를 시작하세요",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
