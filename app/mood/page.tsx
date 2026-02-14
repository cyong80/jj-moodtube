"use client";

import { MoodHeader } from "@/components/mood/MoodHeader";
import { MoodInputCard } from "@/components/mood/MoodInputCard";
import { MoodInputSelector } from "@/components/mood/MoodInputSelector";
import { MoodResultArea } from "@/components/mood/MoodResultArea";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useMoodAnalysis } from "@/hooks/useMoodAnalysis";
import { useMoodDate } from "@/hooks/useMoodDate";
import { useMoodInputMode } from "@/hooks/useMoodInputMode";
import { useMoodVoice } from "@/hooks/useMoodVoice";
import { ko } from "react-day-picker/locale";
import { RotateCcw } from "lucide-react";
import { useCallback } from "react";

export default function MoodTubePage() {
  const { date, setDate } = useMoodDate();
  const {
    status,
    setStatus,
    result,
    analyzeFromImage,
    analyzeFromText,
    reset,
  } = useMoodAnalysis();
  const { inputMode, switchMode } = useMoodInputMode({
    onModeChange: reset,
  });
  const {
    transcript,
    isListening,
    handleVoiceClick,
  } = useMoodVoice({
    onAnalyze: analyzeFromText,
    setStatus,
  });

  const handleCapture = useCallback(
    (getImage: () => string | null) => {
      const imageSrc = getImage();
      if (!imageSrc) return;
      analyzeFromImage(imageSrc);
    },
    [analyzeFromImage]
  );

  const handleModeChange = useCallback(
    (mode: "capture" | "voice") => {
      switchMode(mode);
    },
    [switchMode]
  );

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
        <MoodHeader />

        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ko}
            className="rounded-xl sm:rounded-2xl border border-border bg-card"
          />
        </div>

        {!result && (
          <MoodInputSelector inputMode={inputMode} onModeChange={handleModeChange} />
        )}

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10">
          {result ? (
            <div className="lg:col-span-12 space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={reset}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  다시 하기
                </Button>
              </div>
              <MoodResultArea result={result} inputMode={inputMode} />
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
