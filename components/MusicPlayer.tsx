"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Play, Music2 } from "lucide-react";

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
}

interface MusicPlayerProps {
  videos: Video[];
  mood: string;
  description: string;
}

export default function MusicPlayer({ videos, mood, description }: MusicPlayerProps) {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(
    videos.length > 0 ? videos[0].id : null
  );

  return (
    <div className="space-y-6">
      {/* 기분 분석 결과 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Music2 className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold">
            당신은 오늘 <span className="text-purple-500">{mood}</span> 하군요!
          </h2>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
      </div>

      {/* 유튜브 플레이어 */}
      {currentVideoId && (
        <Card className="overflow-hidden bg-zinc-900 border-zinc-800 rounded-2xl">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </Card>
      )}

      {/* 플레이리스트 */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-zinc-300">추천 플레이리스트</h3>
        <div className="space-y-3">
          {videos.map((video) => (
            <Card
              key={video.id}
              className={`
                cursor-pointer transition-all duration-200 overflow-hidden
                ${
                  currentVideoId === video.id
                    ? "bg-purple-600/20 border-purple-500"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                }
              `}
              onClick={() => setCurrentVideoId(video.id)}
            >
              <div className="flex gap-4 p-4">
                {/* 썸네일 */}
                <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {currentVideoId !== video.id && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <Play className="w-8 h-8 text-white" fill="white" />
                    </div>
                  )}
                </div>

                {/* 비디오 정보 */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                    {video.title}
                  </h4>
                  <p className="text-xs text-zinc-500">{video.channel}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
