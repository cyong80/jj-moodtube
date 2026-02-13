"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Play, Music2, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// YouTube IFrame API 타입 정의
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function MusicPlayer({ videos, mood, description }: MusicPlayerProps) {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(
    videos.length > 0 ? videos[0].id : null
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  console.log(videos);

  // YouTube IFrame API 로드
  useEffect(() => {
    // 이미 로드되어 있으면 스킵
    if (window.YT) {
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  // 플레이어 초기화
  useEffect(() => {
    if (!currentVideoId || !playerContainerRef.current) return;

    const initPlayer = () => {
      // 기존 플레이어가 있으면 제거
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: currentVideoId,
        playerVars: {
          autoplay: 1,
          enablejsapi: 1,
        },
        events: {
          onStateChange: (event: any) => {
            // 재생 상태 업데이트
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
            
            // 비디오 재생이 끝났을 때
            if (event.data === window.YT.PlayerState.ENDED) {
              playNextVideo();
            }
          },
        },
      });
    };

    // YouTube API가 로드되었는지 확인
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [currentVideoId]);

  // 다음 곡 재생
  const playNextVideo = () => {
    const nextIndex = (currentIndex + 1) % videos.length;
    setCurrentIndex(nextIndex);
    setCurrentVideoId(videos[nextIndex].id);
  };

  // 이전 곡 재생
  const playPreviousVideo = () => {
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    setCurrentIndex(prevIndex);
    setCurrentVideoId(videos[prevIndex].id);
  };

  // 재생/멈춤 토글
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // 수동으로 비디오 선택
  const handleVideoSelect = (videoId: string, index: number) => {
    setCurrentIndex(index);
    setCurrentVideoId(videoId);
  };

  return (
    <div className="space-y-6">
      {/* 기분 분석 결과 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Music2 className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-white">
            당신은 오늘 <span className="text-primary">{mood}</span> 하군요!
          </h2>
        </div>
        <p className="text-zinc-300 text-base leading-relaxed">{description}</p>
      </div>

      {/* 유튜브 플레이어 */}
      {currentVideoId && (
        <Card className="overflow-hidden bg-zinc-900 border-zinc-800 rounded-2xl">
          <div className="aspect-video">
            <div
              ref={playerContainerRef}
              className="w-full h-full"
            />
          </div>
          
          {/* 플레이어 컨트롤 */}
          <div className="p-6 bg-zinc-900/50 border-t border-zinc-800">
            <div className="flex items-center justify-center gap-4">
              {/* 이전 곡 버튼 */}
              <Button
                variant="outline"
                size="icon"
                onClick={playPreviousVideo}
                className="h-12 w-12 rounded-full border-zinc-700 hover:border-primary hover:bg-primary/10 transition-all"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              {/* 재생/멈춤 버튼 */}
              <Button
                variant="default"
                size="icon"
                onClick={togglePlayPause}
                className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7" fill="currentColor" />
                ) : (
                  <Play className="h-7 w-7" fill="currentColor" />
                )}
              </Button>

              {/* 다음 곡 버튼 */}
              <Button
                variant="outline"
                size="icon"
                onClick={playNextVideo}
                className="h-12 w-12 rounded-full border-zinc-700 hover:border-primary hover:bg-primary/10 transition-all"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* 현재 재생 중인 곡 정보 */}
            <div className="mt-4 text-center">
              <p className="text-base font-semibold text-white line-clamp-1">
                {videos[currentIndex]?.title}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                {videos[currentIndex]?.channel}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 플레이리스트 */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white">추천 플레이리스트</h3>
        <div className="space-y-3">
          {videos.map((video, index) => (
            <Card
              key={video.id}
              className={`
                cursor-pointer transition-all duration-200 overflow-hidden
                ${
                  currentVideoId === video.id
                    ? "bg-primary/20 border-primary"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                }
              `}
              onClick={() => handleVideoSelect(video.id, index)}
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
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1 text-white">
                    {video.title}
                  </h4>
                  <p className="text-xs text-zinc-400">{video.channel}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
