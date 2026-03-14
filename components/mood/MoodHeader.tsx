"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogIn, LogOut, Camera, History } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 헤더 영역 담당 (SRP: 인증 UI 단일 책임)
 * 모바일: 아이콘만 표시하여 공간 절약
 */
export function MoodHeader() {
  const { status: sessionStatus } = useSession();
  const pathname = usePathname();

  const iconBtnClass =
    "h-8 w-8 shrink-0 p-0 sm:h-9 sm:w-9 sm:px-3 sm:py-2 text-muted-foreground hover:text-foreground hover:bg-accent";

  return (
    <header className="space-y-2 sm:space-y-4 overflow-visible">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* 좌측: 분석/내역 */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Link href="/mood" aria-label="분석하기">
            <Button
              variant={pathname === "/mood" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-2 text-muted-foreground hover:text-foreground"
            >
              <Camera className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">분석하기</span>
            </Button>
          </Link>
          <Link href="/mood/history" aria-label="이전 내역">
            <Button
              variant={pathname === "/mood/history" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-2 text-muted-foreground hover:text-foreground"
            >
              <History className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">이전 내역</span>
            </Button>
          </Link>
        </div>

        {/* 중앙: 로고 + 태그라인(데스크톱만) */}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 sm:px-2">
          <h1 className="truncate text-xl font-black tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Mood<span className="text-primary">Tube</span>
          </h1>
          <p className="hidden text-muted-foreground sm:block sm:text-sm md:text-base">
            오늘의 기분을 분석해보세요
          </p>
        </div>

        {/* 우측: 테마 + 인증 - isolate로 겹침/호버 분리 */}
        <div className="flex shrink-0 flex-nowrap items-center justify-end gap-3">
          <div className="relative isolate shrink-0">
            <ThemeToggle />
          </div>
          {sessionStatus === "authenticated" ? (
            <div className="relative isolate shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="shrink-0 rounded-md border-border/50 bg-transparent hover:bg-accent/50 hover:border-border"
                aria-label="로그아웃"
              >
                <LogOut className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </Button>
            </div>
          ) : sessionStatus === "unauthenticated" ? (
            <div className="relative isolate shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => signIn("google", { callbackUrl: "/mood" })}
                className="shrink-0 rounded-md border-border/50 bg-transparent hover:bg-accent/50 hover:border-border"
                aria-label="로그인"
              >
                <LogIn className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">로그인</span>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
