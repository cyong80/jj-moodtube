"use client";

import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

/**
 * 헤더 영역 담당 (SRP: 인증 UI 단일 책임)
 */
export function MoodHeader() {
  const { status: sessionStatus } = useSession();

  return (
    <header className="text-center space-y-2 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter">
          Mood<span className="text-primary">Tube</span>
        </h1>
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
