"use client";

import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Camera, History } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 헤더 영역 담당 (SRP: 인증 UI 단일 책임)
 */
export function MoodHeader() {
  const { status: sessionStatus } = useSession();
  const pathname = usePathname();

  return (
    <header className="text-center space-y-2 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-start gap-1">
          <Link href="/mood">
            <Button
              variant={pathname === "/mood" ? "secondary" : "ghost"}
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Camera className="w-4 h-4 mr-1.5" />
              분석하기
            </Button>
          </Link>
          <Link href="/mood/history">
            <Button
              variant={pathname === "/mood/history" ? "secondary" : "ghost"}
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <History className="w-4 h-4 mr-1.5" />
              이전 내역
            </Button>
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center space-y-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter">
            Mood<span className="text-primary">Tube</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            오늘의 기분을 분석해보세요
          </p>
        </div>
        <div className="flex-1 flex justify-end">
          {sessionStatus === "authenticated" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              로그아웃
            </Button>
          ) : sessionStatus === "unauthenticated" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signIn("google", { callbackUrl: "/mood" })}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              로그인
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
