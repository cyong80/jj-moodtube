"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, LogOut, Camera, History, Heart } from "lucide-react";
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

  return (
    <header className="space-y-3 sm:space-y-4 overflow-visible">
      {/* 첫 번째 라인: 제목만 */}
      <h1 className="font-display text-center text-xl font-black tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
        Mood<span className="text-primary">Tube</span>
      </h1>

      {/* 두 번째 라인: 서브타이틀 */}
      <p className="text-center text-sm text-muted-foreground sm:text-base">
        오늘의 기분을 분석해보세요
      </p>

      {/* 세 번째 라인: 네비 + 테마/인증 */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
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
          <Link href="/mood/likes" aria-label="좋아요한 노래">
            <Button
              variant={pathname === "/mood/likes" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-2 text-muted-foreground hover:text-foreground"
            >
              <Heart className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">좋아요</span>
            </Button>
          </Link>
        </div>

        {/* 우측: 테마 + 인증 */}
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
                <LogOut className="h-4 w-4 sm:mr-1.5 text-muted-foreground" strokeWidth={2} />
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
                <User className="h-4 w-4 sm:mr-1.5 text-primary" strokeWidth={2} />
                <span className="hidden sm:inline">로그인</span>
              </Button>
            </div>
          ) : (
            <div
              className="h-8 w-20 shrink-0 rounded-md bg-muted/80 sm:h-9 sm:w-24 overflow-hidden"
              aria-hidden="true"
            >
              <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
