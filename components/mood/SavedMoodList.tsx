"use client";

import { Card } from "@/components/ui/card";
import { ChevronRight, Disc3, Sparkles } from "lucide-react";
import type { MoodPlaylistResult } from "@/types/mood";

interface SavedMoodListProps {
  results: MoodPlaylistResult[];
  onSelect: (result: MoodPlaylistResult, trackIndex?: number) => void;
}

/**
 * 저장된 기분 기록 목록 - 라이너 노트 스타일, 모든 곡 노출 + 아이콘
 */
export function SavedMoodList({ results, onSelect }: SavedMoodListProps) {
  if (results.length === 0) {
    return (
      <div className="h-48 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center gap-3 text-muted-foreground px-4 text-center">
        <Disc3 className="w-10 h-10 opacity-30" strokeWidth={1.5} />
        <p className="text-sm">이 날짜에 저장된 기록이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-baseline gap-2">
        <Sparkles className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          저장된 기록
        </h3>
        <span className="text-xs font-mono text-muted-foreground/80 tabular-nums">
          {results.length}건
        </span>
      </div>

      <div className="w-full space-y-4">
        {results.map((result, index) => {
          const videosWithId = result.videos.filter(
            (v): v is typeof v & { id: string } => !!v.id
          );
          return (
            <Card
              key={`${result.mood}-${index}`}
              className="group cursor-pointer overflow-hidden w-full transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.2)] border-l-[3px] border-l-primary/40"
              onClick={() => onSelect(result, undefined)}
            >
              <div className="relative p-4 sm:p-5 pl-5 sm:pl-6">
                {/* hover 시 좌측 그라데이션 강조 */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary/80 via-primary/50 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-[1px]" />
                {/* 기분 제목 + 화살표 */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h4 className="font-display text-lg sm:text-xl font-bold text-foreground truncate">
                    {result.mood}
                  </h4>
                  <ChevronRight className="w-5 h-5 text-primary/60 shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>

                {/* 트랙리스트: 모든 곡 + Disc3 아이콘 */}
                <ul className="space-y-2">
                  {videosWithId.map((video, trackIndex) => (
                    <li
                      key={video.id}
                      className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-md group/track hover:bg-muted/60 transition-colors duration-150 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(result, trackIndex);
                      }}
                    >
                      <span className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-semibold tabular-nums group-hover/track:bg-primary/20 transition-colors">
                        {String(trackIndex + 1).padStart(2, "0")}
                      </span>
                      <Disc3 className="w-3.5 h-3.5 text-primary/50 shrink-0" strokeWidth={2} />
                      <div className="flex-1 min-w-0 truncate">
                        <span className="font-medium text-foreground/95 text-sm">
                          {video.channel ?? "-"}
                        </span>
                        <span className="mx-1.5 text-muted-foreground/50 text-xs">·</span>
                        <span className="text-sm text-muted-foreground truncate">
                          {video.title ?? "-"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
