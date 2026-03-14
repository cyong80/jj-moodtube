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
import { format } from "date-fns";
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
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setSavedResults([]);
      setIsLoadingSavedResults(false);
      return;
    }
    setIsLoadingSavedResults(true);
    const dateStr = format(date, "yyyy-MM-dd");
    getSavedMoodResults(dateStr)
      .then(setSavedResults)
      .finally(() => setIsLoadingSavedResults(false));
  }, [date, sessionStatus]);

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d ?? new Date());
    setSelectedSavedResult(null);
    setSelectedTrackIndex(0);
    setSavedResults([]);
  };

  const handleSelectResult = (result: MoodPlaylistResult, trackIndex?: number) => {
    setSelectedSavedResult(result);
    setSelectedTrackIndex(trackIndex ?? 0);
  };

  const displayResult = selectedSavedResult;

  if (sessionStatus !== "authenticated") {
    return (
      <main className="min-h-screen bg-background text-foreground px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <div className="w-full max-w-[min(1400px,100%)] mx-auto space-y-8 sm:space-y-10 overflow-x-visible">
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
    <main className="min-h-screen bg-background text-foreground px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      <div className="w-full max-w-[min(1400px,100%)] mx-auto space-y-8 sm:space-y-10 md:space-y-12 overflow-x-visible">
        <MoodHeader />

        {displayResult ? (
          /* 재생 페이지: 달력 없음, 전체 화면으로 재생 */
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
              initialTrackIndex={selectedTrackIndex}
            />
          </div>
        ) : (
          /* 목록 페이지: 달력 + 리스트 */
          <div className="flex flex-col md:flex-row md:gap-8 md:items-start">
            {/* 좌측: 달력 (목록에서만 표시) */}
            <div className="w-full max-md:block md:w-[320px] md:shrink-0 md:sticky md:top-6 md:self-start md:overflow-hidden">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                locale={ko}
                className="max-md:!w-full rounded-xl sm:rounded-2xl border border-border bg-card p-3 md:p-4 md:[--cell-size:2.25rem] lg:[--cell-size:2.5rem] [&_.rdp-caption_label]:md:text-sm [&_.rdp-weekday]:md:text-[0.7rem] md:max-w-full"
              />
            </div>

            {/* 우측: 리스트 */}
            <div className="flex-1 min-w-0 w-full mt-6 md:mt-0">
              {isLoadingSavedResults ? (
                <SavedMoodListSkeleton />
              ) : (
                <SavedMoodList
                  results={savedResults}
                  onSelect={handleSelectResult}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
