"use client";

import { useCallback, useState } from "react";

export type InputMode = "capture" | "voice";

interface UseMoodInputModeOptions {
  onModeChange?: () => void;
}

/**
 * 입력 모드(캡처/음성) 전환을 담당하는 훅 (SRP: 입력 모드 상태 단일 책임)
 */
export function useMoodInputMode({ onModeChange }: UseMoodInputModeOptions = {}) {
  const [inputMode, setInputMode] = useState<InputMode>("capture");

  const switchMode = useCallback(
    (mode: InputMode) => {
      setInputMode(mode);
      onModeChange?.();
    },
    [onModeChange]
  );

  return { inputMode, switchMode };
}
