import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

/** Display: 로고·헤딩용 – 기하학적, 감각적 */
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/** Body: 본문·UI용 – 읽기 편하고 따뜻한 톤 */
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** 한글 본문 폴백 */
const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "MoodTube",
    template: "%s | MoodTube",
  },
  description: "기분에 맞는 음악을 추천해드립니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${plusJakartaSans.variable} ${notoSansKR.variable} antialiased`}
      >
        <div className="relative z-10 min-h-screen">
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </div>
      </body>
    </html>
  );
}
