"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import type { MoodStatus } from "./useMoodAnalysis";

interface UseMoodVoiceOptions {
  onAnalyze: (blob: Blob, mimeType: string) => Promise<void>;
  setStatus: (status: MoodStatus) => void;
}

/**
 * 오디오 녹음과 기분 분석을 연동하는 훅
 * 녹음된 음성(오디오)을 Gemini에 전달해 말한 내용 + 목소리 톤을 함께 분석
 */
export function useMoodVoice({ onAnalyze, setStatus }: UseMoodVoiceOptions) {
  const handleVoiceClickWithCheck = useCallback(
    (toggle: () => void, isSupported: boolean, isRecording: boolean) => {
      if (!isSupported) {
        toast.error("지원하지 않는 브라우저", {
          description: "Chrome, Edge, Safari에서 음성 녹음을 사용할 수 있습니다.",
        });
        return;
      }
      if (!isRecording) {
        setStatus("listening");
      }
      toggle();
    },
    [setStatus]
  );

  const { isRecording, isSupported, volumeLevel, toggle } = useAudioRecorder({
    onResult: async (blob, mimeType) => {
      if (blob.size < 1000) {
        setStatus("idle");
        toast.error("녹음이 너무 짧습니다", {
          description: "1초 이상 말씀해 주세요.",
        });
        return;
      }
      await onAnalyze(blob, mimeType);
    },
    onError: () => {
      setStatus("idle");
      toast.error("녹음 오류", {
        description: "마이크 권한을 확인해 주세요.",
      });
    },
  });

  const handleVoiceClick = useCallback(() => {
    handleVoiceClickWithCheck(toggle, isSupported, isRecording);
  }, [handleVoiceClickWithCheck, toggle, isSupported, isRecording]);

  return {
    transcript: "", // 오디오 모드에서는 실시간 전사 없음
    isListening: isRecording,
    volumeLevel,
    isSupported,
    handleVoiceClick,
  };
}
