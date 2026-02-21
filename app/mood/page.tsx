"use client";

import { MoodHeader } from "@/components/mood/MoodHeader";
import { MoodInputCard } from "@/components/mood/MoodInputCard";
import { MoodInputSelector } from "@/components/mood/MoodInputSelector";
import { MoodResultArea } from "@/components/mood/MoodResultArea";
import { SavedMoodList } from "@/components/mood/SavedMoodList";
import { SavedMoodListSkeleton } from "@/components/mood/SavedMoodListSkeleton";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useMoodAnalysis } from "@/hooks/useMoodAnalysis";
import { useMoodDate } from "@/hooks/useMoodDate";
import { useMoodInputMode } from "@/hooks/useMoodInputMode";
import { useMoodVoice } from "@/hooks/useMoodVoice";
import { ko } from "react-day-picker/locale";
import { RotateCcw, Save, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { saveMoodResult, getSavedMoodResults } from "@/app/actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import type { MoodPlaylistResult } from "@/types/mood";

export default function MoodTubePage() {
  const { status: sessionStatus } = useSession();
  const { date, setDate } = useMoodDate();
  const {
    status,
    setStatus,
    result,
    analyzeFromImage,
    analyzeFromAudio,
    reset,
  } = useMoodAnalysis();
  const { inputMode, switchMode } = useMoodInputMode({
    onModeChange: reset,
  });
  const { transcript, isListening, volumeLevel, handleVoiceClick } =
    useMoodVoice({
      onAnalyze: analyzeFromAudio,
      setStatus,
    });

  const handleCapture = useCallback(
    (getImage: () => string | null) => {
      const imageSrc = getImage();
      if (!imageSrc) return;
      analyzeFromImage(imageSrc);
    },
    [analyzeFromImage],
  );

  const handleModeChange = useCallback(
    (mode: "capture" | "voice") => {
      switchMode(mode);
    },
    [switchMode],
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedResults, setSavedResults] = useState<MoodPlaylistResult[]>([]);
  const [isLoadingSavedResults, setIsLoadingSavedResults] = useState(false);
  const [selectedSavedResult, setSelectedSavedResult] =
    useState<MoodPlaylistResult | null>(null);

  const handleSave = useCallback(async () => {
    if (!result) return;
    const today = new Date();
    setIsSaving(true);
    try {
      const { success, error } = await saveMoodResult(result);
      if (success) {
        toast.success("저장되었습니다.");
        const refreshed = await getSavedMoodResults(today);
        setSavedResults(refreshed);
        setDate(today); // 저장 후 당일 날짜로 이동하여 새로 저장된 결과 표시
      } else {
        toast.error("저장 실패", { description: error });
      }
    } finally {
      setIsSaving(false);
    }
  }, [result, setDate]);

  const handleDateSelect = useCallback(
    (d: Date | undefined) => {
      setDate(d ?? new Date());
      reset();
      setSelectedSavedResult(null);
      setSavedResults([]);
    },
    [setDate, reset],
  );

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

  const displayResult = result ?? selectedSavedResult;

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
          sessionStatus === "authenticated" &&
          (isLoadingSavedResults ? (
            <div className="w-full">
              <SavedMoodListSkeleton />
            </div>
          ) : (
            savedResults.length > 0 && (
              <div className="w-full">
                <SavedMoodList
                  results={savedResults}
                  onSelect={setSelectedSavedResult}
                />
              </div>
            )
          ))}

        {!displayResult && (
          <MoodInputSelector
            inputMode={inputMode}
            onModeChange={handleModeChange}
          />
        )}

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10">
          {displayResult ? (
            <div className="lg:col-span-12 space-y-4">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedSavedResult ? setSelectedSavedResult(null) : reset()
                  }
                >
                  {selectedSavedResult ? (
                    <>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      목록으로
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      다시 하기
                    </>
                  )}
                </Button>
                {sessionStatus === "authenticated" && result && (
                  <Button
                    variant="default"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "저장 중..." : "저장하기"}
                  </Button>
                )}
              </div>
              <MoodResultArea result={displayResult} inputMode={inputMode} />
            </div>
          ) : (
            <>
              <div className="lg:col-span-5">
                <MoodInputCard
                  inputMode={inputMode}
                  status={status}
                  result={result}
                  transcript={transcript}
                  isListening={isListening}
                  volumeLevel={volumeLevel}
                  isScanning={status === "scanning"}
                  onCapture={handleCapture}
                  onVoiceClick={handleVoiceClick}
                />
              </div>
              <div className="lg:col-span-7">
                <MoodResultArea result={result} inputMode={inputMode} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
