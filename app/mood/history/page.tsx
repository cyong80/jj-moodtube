"use client";

import { MoodHeader } from "@/components/mood/MoodHeader";
import { MoodResultArea } from "@/components/mood/MoodResultArea";
import { SavedMoodList } from "@/components/mood/SavedMoodList";
import { SavedMoodListSkeleton } from "@/components/mood/SavedMoodListSkeleton";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useMoodDate } from "@/hooks/useMoodDate";
import { ko } from "react-day-picker/locale";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getSavedMoodResults } from "@/app/actions";
import { useSession } from "next-auth/react";
import type { MoodPlaylistResult } from "@/types/mood";
import Link from "next/link";

/**
 * 날짜를 선택해 이전 기분 기록을 조회하는 페이지
 */
export default function MoodHistoryPage() {
  const { status: sessionStatus } = useSession();
  const { date, setDate } = useMoodDate();
  const [savedResults, setSavedResults] = useState<MoodPlaylistResult[]>([]);
  const [isLoadingSavedResults, setIsLoadingSavedResults] = useState(false);
  const [selectedSavedResult, setSelectedSavedResult] =
    useState<MoodPlaylistResult | null>(null);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setSavedResults([]);
      setIsLoadingSavedResults(false);
      return;
    }
    setIsLoadingSavedResults(true);
    getSavedMoodResults(date)
      .then(setSavedResults)
      .finally(() => setIsLoadingSavedResults(false));
  }, [date, sessionStatus]);

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d ?? new Date());
    setSelectedSavedResult(null);
    setSavedResults([]);
  };

  const displayResult = selectedSavedResult;

  if (sessionStatus !== "authenticated") {
    return (
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-[min(1400px,100vw)] mx-auto space-y-6">
          <MoodHeader />
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-muted-foreground text-center">
            <p>이전 내역을 보려면 로그인이 필요합니다.</p>
            <Link href="/mood">
              <Button variant="default">
                <Camera className="w-4 h-4 mr-2" />
                기분 분석하기
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[min(1400px,100vw)] mx-auto space-y-6 sm:space-y-8 md:space-y-10">
        <MoodHeader />

        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            locale={ko}
            className="rounded-xl sm:rounded-2xl border border-border bg-card"
          />
        </div>

        {!displayResult &&
          (isLoadingSavedResults ? (
            <div className="w-full">
              <SavedMoodListSkeleton />
            </div>
          ) : (
            <div className="w-full">
              <SavedMoodList
                results={savedResults}
                onSelect={setSelectedSavedResult}
              />
            </div>
          ))}

        {displayResult && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedSavedResult(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </div>
            <MoodResultArea
              result={displayResult}
              inputMode="capture"
            />
          </div>
        )}
      </div>
    </main>
  );
}
