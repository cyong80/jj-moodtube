"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/mood");
    }
  }, [status, router]);

  const searchParams = useSearchParams();

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="relative min-h-screen bg-background flex items-center justify-center">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </main>
    );
  }
  const callbackUrl = searchParams.get("callbackUrl") ?? "/mood";
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked:
      "이 이메일은 이미 다른 소셜 계정과 연결되어 있습니다.",
    OAuthCallback: "로그인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.",
    OAuthCreateAccount: "계정 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
    OAuthSignin: "로그인을 시작하는 데 실패했습니다. 다시 시도해 주세요.",
    CredentialsSignin: "인증 정보가 올바르지 않습니다.",
    SessionRequired: "로그인이 필요합니다.",
    Default: "로그인 중 오류가 발생했습니다. 다시 시도해 주세요.",
  };

  const errorMessage =
    error && (errorMessages[error] ?? errorMessages.Default);

  const handleGoogleSignIn = useCallback(() => {
    signIn("google", { callbackUrl });
  }, [callbackUrl]);

  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8 text-center">
        <header className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">
            Mood<span className="text-primary">Tube</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Google 계정으로 로그인하여 시작하세요
          </p>
        </header>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-card hover:bg-accent rounded-xl flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </Button>

          <Link
            href="/mood"
            className="block w-full py-3 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            로그인 없이 둘러보기
          </Link>

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">로딩 중...</div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
