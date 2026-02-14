"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import type { MoodStatus } from "./useMoodAnalysis";

interface UseMoodVoiceOptions {
  onAnalyze: (text: string) => Promise<void>;
  setStatus: (status: MoodStatus) => void;
}

/**
 * 음성 인식과 기분 분석을 연동하는 훅 (SRP: 음성 입력 처리 단일 책임)
 */
export function useMoodVoice({ onAnalyze, setStatus }: UseMoodVoiceOptions) {
  const handleVoiceClickWithCheck = useCallback(
    (toggle: () => void, isSupported: boolean, isListening: boolean) => {
      if (!isSupported) {
        toast.error("지원하지 않는 브라우저", {
          description: "Chrome, Edge, Safari에서 음성 인식을 사용할 수 있습니다.",
        });
        return;
      }
      if (!isListening) {
        setStatus("listening");
      }
      toggle();
    },
    [setStatus]
  );

  const {
    transcript,
    isListening,
    isSupported,
    toggle,
  } = useVoiceRecognition({
    onResult: onAnalyze,
    onEmpty: () => {
      setStatus("idle");
      toast.error("음성을 인식하지 못했습니다", {
        description: "다시 말씀해 주세요.",
      });
    },
    onError: () => {
      setStatus("idle");
      toast.error("음성 인식 오류", {
        description: "마이크 권한을 확인해 주세요.",
      });
    },
  });

  const handleVoiceClick = useCallback(() => {
    handleVoiceClickWithCheck(toggle, isSupported, isListening);
  }, [handleVoiceClickWithCheck, toggle, isSupported, isListening]);

  return {
    transcript,
    isListening,
    isSupported,
    handleVoiceClick,
  };
}
