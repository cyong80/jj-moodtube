"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Mic } from "lucide-react";
import { useRef, useState } from "react";
import Webcam from "react-webcam";
import type { MoodPlaylistResult } from "@/types/mood";
import type { InputMode } from "@/hooks/useMoodInputMode";
import type { MoodStatus } from "@/hooks/useMoodAnalysis";

interface MoodInputCardProps {
  inputMode: InputMode;
  status: MoodStatus;
  result: MoodPlaylistResult | null;
  transcript: string;
  isListening: boolean;
  volumeLevel?: number;
  isScanning: boolean;
  onCapture: (getImage: () => string | null) => void;
  onVoiceClick: () => void;
}

/**
 * 캡처/음성 입력 카드 담당 (SRP: 입력 UI 단일 책임)
 */
export function MoodInputCard({
  inputMode,
  status,
  result,
  transcript,
  isListening,
  volumeLevel = 0,
  isScanning,
  onCapture,
  onVoiceClick,
}: MoodInputCardProps) {
  const webcamRef = useRef<Webcam>(null);
  const [cameraStarted, setCameraStarted] = useState(false);

  const handleCaptureClick = () => {
    if (!cameraStarted) {
      setCameraStarted(true);
      return;
    }
    onCapture(() => webcamRef.current?.getScreenshot() ?? null);
  };

  if (inputMode === "capture") {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="overflow-hidden rounded-xl sm:rounded-2xl md:rounded-[2rem]">
          {!cameraStarted ? (
            <div className="aspect-square flex flex-col items-center justify-center gap-4 sm:gap-6 text-muted-foreground">
              <Camera className="w-16 h-16 sm:w-20 sm:h-20" />
              <p className="text-sm sm:text-base text-center px-4">
                버튼을 누르면 카메라가 켜집니다
              </p>
            </div>
          ) : status === "idle" ? (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full aspect-square object-cover"
            />
          ) : status === "scanning" ? (
            <div className="aspect-square flex flex-col items-center justify-center gap-3 sm:gap-4">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
              <p className="animate-pulse text-sm sm:text-base">
                기분을 읽는 중...
              </p>
            </div>
          ) : (
            <img
              src={result?.capturedImage ?? undefined}
              alt=""
              className="w-full aspect-square object-cover opacity-50"
            />
          )}
        </Card>
        <Button
          onClick={handleCaptureClick}
          disabled={isScanning}
          className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl"
        >
          {isScanning
            ? "분석 중..."
            : cameraStarted
              ? "START SCANNING"
              : "캡처 시작"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="overflow-hidden rounded-xl sm:rounded-2xl md:rounded-[2rem]">
        {status === "listening" ? (
          <div className="aspect-square flex flex-col items-center justify-center gap-4 sm:gap-6 p-6">
            <div className="relative">
              <Mic className="w-20 h-20 sm:w-24 sm:h-24 text-primary animate-pulse" />
              <span className="absolute -inset-2 rounded-full bg-primary/20 animate-ping" />
            </div>
            {/* 음량 레벨 비주얼 - 바 형태 */}
            <div className="flex items-end justify-center gap-1 sm:gap-1.5 h-14 sm:h-16">
              {Array.from({ length: 10 }).map((_, i) => {
                const barStart = i / 10;
                const fillRatio = Math.min(1, Math.max(0, (volumeLevel - barStart) / 0.1));
                const barHeight = 8 + i * 4;
                return (
                  <div
                    key={i}
                    className="w-2 sm:w-2.5 rounded-t bg-muted/30 overflow-hidden"
                    style={{ height: `${barHeight}px` }}
                  >
                    <div
                      className="w-full rounded-t bg-primary transition-all duration-75 ease-out"
                      style={{
                        height: `${Math.max(0, fillRatio * 100)}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
              말씀해 주세요...
            </p>
          </div>
        ) : status === "scanning" ? (
          <div className="aspect-square flex flex-col items-center justify-center gap-3 sm:gap-4">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
            <p className="animate-pulse text-sm sm:text-base">
              기분을 읽는 중...
            </p>
          </div>
        ) : status === "result" && result?.voicePrompt ? (
          <div className="aspect-square flex flex-col items-center justify-center gap-4 p-6 text-muted-foreground">
            <Mic className="w-16 h-16 sm:w-20 sm:h-20 opacity-50" />
            <p className="text-sm sm:text-base text-center line-clamp-4">
              &ldquo;{result.voicePrompt}&rdquo;
            </p>
          </div>
        ) : (
          <div className="aspect-square flex flex-col items-center justify-center gap-4 sm:gap-6 text-muted-foreground">
            <Mic className="w-16 h-16 sm:w-20 sm:h-20" />
            <p className="text-sm sm:text-base text-center px-4">
              버튼을 누르고 기분이나 원하는 분위기를 말해 주세요
            </p>
          </div>
        )}
      </Card>
      <Button
        onClick={onVoiceClick}
        disabled={isScanning}
        className={`w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl ${
          isListening
            ? "bg-red-600 hover:bg-red-500"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {isScanning
          ? "분석 중..."
          : isListening
            ? "녹음 중지"
            : "음성으로 말하기"}
      </Button>
    </div>
  );
}
