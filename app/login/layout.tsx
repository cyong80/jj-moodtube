import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 | MoodTube",
  description: "MoodTube에 로그인하세요",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
