"use client";

import { Button } from "@/components/ui/button";
import { Camera, Mic } from "lucide-react";
import type { InputMode } from "@/hooks/useMoodInputMode";

interface MoodInputSelectorProps {
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

/**
 * 입력 모드 선택 버튼 담당 (SRP: 모드 선택 UI 단일 책임)
 */
export function MoodInputSelector({ inputMode, onModeChange }: MoodInputSelectorProps) {
  return (
    <div className="flex justify-center gap-2">
      <Button
        variant={inputMode === "capture" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("capture")}
      >
        <Camera className="w-4 h-4 mr-1.5" />
        캡처
      </Button>
      <Button
        variant={inputMode === "voice" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("voice")}
      >
        <Mic className="w-4 h-4 mr-1.5" />
        음성
      </Button>
    </div>
  );
}
