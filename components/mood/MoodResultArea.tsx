"use client";

import MusicPlayer from "@/components/MusicPlayer";
import type { MoodPlaylistResult } from "@/types/mood";
import type { InputMode } from "@/hooks/useMoodInputMode";

interface MoodResultAreaProps {
  result: MoodPlaylistResult | null;
  inputMode: InputMode;
}

/**
 * 분석 결과 또는 플레이스홀더 영역 담당 (SRP: 결과 표시 단일 책임)
 */
export function MoodResultArea({ result, inputMode }: MoodResultAreaProps) {
  if (result) {
    const videoIds = result.videos
      .filter((v): v is typeof v & { id: string } => !!v.id)
      .map((v) => v.id)
      .join(",");
    return (
      <div className="animate-in fade-in slide-in-from-right-4">
        <MusicPlayer
          key={`${result.mood}-${videoIds}`}
          videos={result.videos
            .filter((v): v is typeof v & { id: string } => !!v.id)
            .map((v) => ({
              id: v.id,
              title: v.title ?? "",
              channel: v.channel ?? "",
              thumbnail: v.thumbnail ?? "",
            }))}
          mood={result.mood}
          description={result.description}
        />
      </div>
    );
  }

  return (
    <div className="h-64 sm:h-80 lg:h-full border-2 border-dashed border-border rounded-xl sm:rounded-2xl md:rounded-[2rem] flex items-center justify-center text-muted-foreground text-sm sm:text-base px-4 text-center">
      {inputMode === "capture"
        ? "사진을 촬영하면 여기에 플레이리스트가 나타납니다."
        : "음성으로 말하면 여기에 플레이리스트가 나타납니다."}
    </div>
  );
}
