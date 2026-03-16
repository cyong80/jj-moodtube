"use client";

import { MoodHeader } from "@/components/mood/MoodHeader";
import { MoodInputCard } from "@/components/mood/MoodInputCard";
import { MoodInputSelector } from "@/components/mood/MoodInputSelector";
import { MoodResultArea } from "@/components/mood/MoodResultArea";
import { Button } from "@/components/ui/button";
import { useMoodAnalysis } from "@/hooks/useMoodAnalysis";
import { useMoodInputMode } from "@/hooks/useMoodInputMode";
import { useMoodVoice } from "@/hooks/useMoodVoice";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { saveMoodResult } from "@/app/actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

/**
 * 사진/음성으로 기분 분석하는 페이지
 */
export default function MoodAnalysisPage() {
  const { status: sessionStatus } = useSession();
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

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const dateStr = format(new Date(), "yyyy-MM-dd");
      const { success, error } = await saveMoodResult(result, dateStr);
      if (success) {
        toast.success("저장되었습니다.");
      } else {
        toast.error("저장 실패", { description: error });
      }
    } finally {
      setIsSaving(false);
    }
  }, [result]);

  return (
    <main className="min-h-screen bg-background text-foreground pl-4 pr-6 py-6 sm:pl-6 sm:pr-8 sm:py-8 md:pl-8 md:pr-10 md:py-10 overflow-x-hidden">
      <div className="w-full max-w-[min(1400px,100%)] mx-auto space-y-8 sm:space-y-10 md:space-y-12 min-w-0 overflow-visible">
        <MoodHeader />

        {!result && (
          <MoodInputSelector
            inputMode={inputMode}
            onModeChange={switchMode}
          />
        )}

        {result ? (
          <section className="space-y-4 min-w-0" aria-label="분석 결과">
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                aria-label="다시 하기"
              >
                <RotateCcw className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">다시 하기</span>
              </Button>
              {sessionStatus === "authenticated" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                  aria-label={isSaving ? "저장 중" : "저장하기"}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin sm:mr-1.5" />
                  ) : (
                    <Save className="w-4 h-4 sm:mr-1.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isSaving ? "저장 중..." : "저장하기"}
                  </span>
                </Button>
              )}
            </div>
            <MoodResultArea result={result} inputMode={inputMode} />
          </section>
        ) : (
          <section
            className="max-w-xl mx-auto min-w-0"
            aria-label={inputMode === "capture" ? "사진 촬영" : "음성 입력"}
          >
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
          </section>
        )}
      </div>
    </main>
  );
}
