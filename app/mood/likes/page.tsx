"use client";

import { MoodHeader } from "@/components/mood/MoodHeader";
import { MoodResultArea } from "@/components/mood/MoodResultArea";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { getLikedVideos } from "@/app/actions";
import { useSession } from "next-auth/react";
import type { MoodPlaylistResult } from "@/types/mood";
import Link from "next/link";

/**
 * 좋아요한 노래 목록 플레이리스트 페이지
 */
export default function LikesPage() {
  const { status: sessionStatus } = useSession();
  const [likedResult, setLikedResult] = useState<MoodPlaylistResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setLikedResult(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getLikedVideos()
      .then(setLikedResult)
      .finally(() => setIsLoading(false));
  }, [sessionStatus]);

  if (sessionStatus !== "authenticated") {
    return (
      <main className="min-h-screen bg-background text-foreground px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <div className="w-full max-w-[min(1400px,100%)] mx-auto space-y-8 sm:space-y-10 overflow-x-visible">
          <MoodHeader />
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-muted-foreground text-center">
            <p>좋아요한 노래를 보려면 로그인이 필요합니다.</p>
            <Link href="/mood">
              <Button variant="default">
                <Heart className="w-4 h-4 mr-2" />
                기분 분석하기
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      <div className="w-full max-w-[min(1400px,100%)] mx-auto space-y-8 sm:space-y-10 md:space-y-12 overflow-x-visible">
        <MoodHeader />

        {isLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : likedResult ? (
          <MoodResultArea result={likedResult} inputMode="capture" />
        ) : (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-muted-foreground text-center">
            <Heart className="w-16 h-16 text-muted-foreground/50" strokeWidth={1.5} />
            <p className="text-base">아직 좋아요한 노래가 없어요</p>
            <p className="text-sm">플레이리스트에서 하트를 눌러 마음에 드는 곡을 추가해보세요</p>
            <Link href="/mood">
              <Button variant="default">
                기분 분석하기
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
