"use client";

import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { getMoodPlaylist } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";
import MusicPlayer from "@/components/MusicPlayer";

export default function MoodTubePage() {
  const webcamRef = useRef<Webcam>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "result">("idle");
  const [result, setResult] = useState<any>(null);

  const handleCapture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setStatus("scanning");
    try {
      const data = await getMoodPlaylist(imageSrc);
      setResult(data);
      setStatus("result");
    } catch (error) {
      toast.error("오류 발생", { description: "분석을 완료할 수 없습니다." });
      setStatus("idle");
    }
  }, [webcamRef]);

  return (
    <main className="min-h-screen bg-[#030303] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <h1 className="text-6xl font-black tracking-tighter">Mood<span className="text-purple-600">Tube</span></h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <Card className="overflow-hidden bg-zinc-900 border-zinc-800 rounded-[2rem]">
              {status === "idle" ? (
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full aspect-square object-cover"
                />
              ) : status === "scanning" ? (
                <div className="aspect-square flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                  <p className="animate-pulse">기분을 읽는 중...</p>
                </div>
              ) : (
                <img src={result.capturedImage} className="w-full aspect-square object-cover opacity-50" />
              )}
            </Card>
            <Button onClick={handleCapture} disabled={status === "scanning"} className="w-full h-16 text-xl font-bold bg-purple-600 hover:bg-purple-500 rounded-2xl">
              {status === "scanning" ? "분석 중..." : "START SCANNING"}
            </Button>
          </div>

          <div className="lg:col-span-7">
            {status === "result" && result ? (
              <div className="animate-in fade-in slide-in-from-right-4">
                <MusicPlayer
                  videos={result.videos}
                  mood={result.mood}
                  description={result.description}
                />
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-zinc-800 rounded-[2rem] flex items-center justify-center text-zinc-600">
                사진을 촬영하면 여기에 플레이리스트가 나타납니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}