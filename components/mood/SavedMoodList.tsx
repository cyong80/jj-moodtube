"use client";

import { Card } from "@/components/ui/card";
import { Music2, Play } from "lucide-react";
import type { MoodPlaylistResult } from "@/types/mood";

interface SavedMoodListProps {
  results: MoodPlaylistResult[];
  onSelect: (result: MoodPlaylistResult) => void;
}

/**
 * 저장된 기분 기록 목록 (날짜별 조회) - 가로 전체, 모든 정보 표시
 */
export function SavedMoodList({ results, onSelect }: SavedMoodListProps) {
  if (results.length === 0) {
    return (
      <div className="h-64 sm:h-80 border-2 border-dashed border-border rounded-xl sm:rounded-2xl flex items-center justify-center text-muted-foreground text-sm sm:text-base px-4 text-center">
        이 날짜에 저장된 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        저장된 기록 ({results.length}건)
      </h3>
      <div className="w-full space-y-6">
        {results.map((result, index) => {
          const videosWithId = result.videos.filter(
            (v): v is typeof v & { id: string } => !!v.id
          );
          return (
            <Card
              key={`${result.mood}-${index}`}
              className="group cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/50 overflow-hidden w-full"
              onClick={() => onSelect(result)}
            >
              <div className="p-6 sm:p-8 space-y-6">
                {/* 기분 & 설명 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Music2 className="w-8 h-8 text-primary flex-shrink-0" />
                    <h4 className="text-xl sm:text-2xl font-bold text-foreground">
                      {result.mood}
                    </h4>
                  </div>
                  <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-wrap">
                    {result.description}
                  </p>
                </div>

                {/* 플레이리스트 전체 */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-muted-foreground">
                    추천 플레이리스트 ({videosWithId.length}곡)
                  </h5>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {videosWithId.map((video) => (
                      <div
                        key={video.id}
                        className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-md overflow-hidden">
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Music2 className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-white" fill="currentColor" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="font-medium text-sm text-foreground line-clamp-2">
                            {video.title ?? "-"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {video.channel ?? "-"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
