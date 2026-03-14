"use client";

import MusicPlayer from "@/components/MusicPlayer";
import type { MoodPlaylistResult } from "@/types/mood";
import type { InputMode } from "@/hooks/useMoodInputMode";
import { motion } from "framer-motion";

interface MoodResultAreaProps {
  result: MoodPlaylistResult | null;
  inputMode: InputMode;
  /** 저장된 기록에서 특정 곡 클릭 시 해당 곡부터 재생 */
  initialTrackIndex?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/**
 * 분석 결과 또는 플레이스홀더 영역 담당 (SRP: 결과 표시 단일 책임)
 */
export function MoodResultArea({ result, inputMode, initialTrackIndex }: MoodResultAreaProps) {
  if (result) {
    const videoIds = result.videos
      .filter((v): v is typeof v & { id: string } => !!v.id)
      .map((v) => v.id)
      .join(",");
    return (
      <motion.div
        className="flex flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <MusicPlayer
          key={`${result.mood}-${videoIds}-${initialTrackIndex ?? 0}`}
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
          itemVariants={itemVariants}
          initialTrackIndex={initialTrackIndex}
        />
      </motion.div>
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
