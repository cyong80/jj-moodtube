"use client";

import { MoodHeader } from "@/components/mood/MoodHeader";
import { MoodInputCard } from "@/components/mood/MoodInputCard";
import { MoodInputSelector } from "@/components/mood/MoodInputSelector";
import { MoodResultArea } from "@/components/mood/MoodResultArea";
import { Button } from "@/components/ui/button";
import { useMoodAnalysis } from "@/hooks/useMoodAnalysis";
import { useMoodInputMode } from "@/hooks/useMoodInputMode";
import { useMoodVoice } from "@/hooks/useMoodVoice";
import { RotateCcw, Save } from "lucide-react";
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

        <MoodInputSelector
          inputMode={inputMode}
          onModeChange={switchMode}
        />

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10 min-w-0">
          {result ? (
            <div className="lg:col-span-12 space-y-4 min-w-0">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 하기
                </Button>
                {sessionStatus === "authenticated" && (
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
              <MoodResultArea result={result} inputMode={inputMode} />
            </div>
          ) : (
            <>
              <div className="lg:col-span-5 min-w-0">
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
              <div className="lg:col-span-7 min-w-0">
                <MoodResultArea result={result} inputMode={inputMode} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
