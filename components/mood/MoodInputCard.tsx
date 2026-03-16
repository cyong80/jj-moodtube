"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, FlipHorizontal, Loader2, Mic } from "lucide-react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
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
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

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
        <Card
          className={`overflow-hidden rounded-xl sm:rounded-2xl md:rounded-[2rem] transition-all duration-200 ${
            !cameraStarted && !isScanning
              ? "cursor-pointer sm:hover:scale-[1.01] hover:border-primary/50 hover:bg-muted/30 active:scale-[0.99]"
              : ""
          }`}
          onClick={!cameraStarted && !isScanning ? () => setCameraStarted(true) : undefined}
          onKeyDown={
            !cameraStarted && !isScanning
              ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCameraStarted(true); } }
              : undefined
          }
          role={!cameraStarted && !isScanning ? "button" : undefined}
          tabIndex={!cameraStarted && !isScanning ? 0 : undefined}
        >
          {!cameraStarted ? (
            <div className="aspect-square flex flex-col items-center justify-center gap-4 sm:gap-6 text-muted-foreground">
              <Camera className="w-16 h-16 sm:w-20 sm:h-20" />
              <p className="text-sm sm:text-base text-center px-4">
                탭하여 카메라 켜기
              </p>
            </div>
          ) : status === "idle" ? (
            <div className="relative aspect-square">
              <Webcam
                ref={webcamRef}
                key={facingMode}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-3 size-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 border-0 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
                }}
                aria-label={facingMode === "user" ? "후면 카메라로 전환" : "전면 카메라로 전환"}
              >
                <FlipHorizontal className="size-5" />
              </Button>
            </div>
          ) : status === "scanning" ? (
            <div className="aspect-square flex flex-col items-center justify-center gap-3 sm:gap-4">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
              </motion.div>
              <motion.p
                className="text-sm sm:text-base text-muted-foreground"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                기분을 읽는 중...
              </motion.p>
            </div>
          ) : (
            <img
              src={result?.capturedImage ?? undefined}
              alt=""
              className="w-full aspect-square object-cover opacity-50"
            />
          )}
        </Card>
        {cameraStarted && (
          <Button
            onClick={handleCaptureClick}
            disabled={isScanning}
            className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl"
          >
            {isScanning ? "분석 중..." : "START SCANNING"}
          </Button>
        )}
      </div>
    );
  }

  const isPlaceholderClickable = !isListening && !isScanning;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card
        className={`overflow-hidden rounded-xl sm:rounded-2xl md:rounded-[2rem] transition-all duration-200 ${
          isPlaceholderClickable
            ? "cursor-pointer sm:hover:scale-[1.01] hover:border-primary/50 hover:bg-muted/30 active:scale-[0.99]"
            : ""
        }`}
        onClick={isPlaceholderClickable ? onVoiceClick : undefined}
        onKeyDown={
          isPlaceholderClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onVoiceClick();
                }
              }
            : undefined
        }
        role={isPlaceholderClickable ? "button" : undefined}
        tabIndex={isPlaceholderClickable ? 0 : undefined}
      >
        {status === "listening" ? (
          <div className="aspect-square flex flex-col items-center justify-center gap-4 sm:gap-6 p-6">
            <div className="relative">
              <Mic className="w-20 h-20 sm:w-24 sm:h-24 text-primary animate-pulse" />
              <span className="absolute -inset-2 rounded-full bg-primary/20 animate-ping" />
            </div>
            {/* 음량 레벨 비주얼 - 바 형태 (bounce) */}
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
                    <motion.div
                      className="w-full rounded-t bg-primary"
                      initial={false}
                      animate={{ height: `${Math.max(0, fillRatio * 100)}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
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
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
            </motion.div>
            <motion.p
              className="text-sm sm:text-base text-muted-foreground"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              기분을 읽는 중...
            </motion.p>
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
              탭하여 기분이나 원하는 분위기를 말해 보세요
            </p>
          </div>
        )}
      </Card>
      {isListening && (
        <Button
          onClick={onVoiceClick}
          disabled={isScanning}
          className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-500"
        >
          녹음 중지
        </Button>
      )}
    </div>
  );
}
