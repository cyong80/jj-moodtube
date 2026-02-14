"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getMoodPlaylist, getMoodPlaylistFromText } from "@/app/actions";
import type { MoodPlaylistResult } from "@/types/mood";

export type MoodStatus = "idle" | "scanning" | "listening" | "result";

/**
 * 기분 분석 로직을 담당하는 훅 (SRP: 분석 상태 및 API 호출 단일 책임)
 */
export function useMoodAnalysis() {
  const [status, setStatus] = useState<MoodStatus>("idle");
  const [result, setResult] = useState<MoodPlaylistResult | null>(null);

  const analyzeFromImage = useCallback(async (imageSrc: string) => {
    setStatus("scanning");
    try {
      const data = await getMoodPlaylist(imageSrc);
      setResult(data);
      setStatus("result");
    } catch {
      toast.error("오류 발생", { description: "분석을 완료할 수 없습니다." });
      setStatus("idle");
    }
  }, []);

  const analyzeFromText = useCallback(async (text: string) => {
    setStatus("scanning");
    try {
      const data = await getMoodPlaylistFromText(text);
      setResult(data);
      setStatus("result");
    } catch {
      toast.error("오류 발생", {
        description: "분석을 완료할 수 없습니다.",
      });
      setStatus("idle");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  return {
    status,
    setStatus,
    result,
    analyzeFromImage,
    analyzeFromText,
    reset,
  };
}
