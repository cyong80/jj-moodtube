"use client";

import MusicPlayer from "@/components/MusicPlayer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { Camera, LogIn, Loader2, LogOut, Mic } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";
import { getMoodPlaylist, getMoodPlaylistFromText } from "../actions";

type InputMode = "capture" | "voice";

export default function MoodTubePage() {
  const { status: sessionStatus } = useSession();
  const webcamRef = useRef<Webcam>(null);
  const [inputMode, setInputMode] = useState<InputMode>("capture");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "scanning" | "listening" | "result"
  >("idle");
  const [result, setResult] = useState<any>(null);

  const handleVoiceResult = useCallback(async (text: string) => {
    setStatus("scanning");
    try {
      const data = await getMoodPlaylistFromText(text);
      setResult(data);
      setStatus("result");
    } catch (error) {
      toast.error("오류 발생", {
        description: "분석을 완료할 수 없습니다.",
      });
      setStatus("idle");
    }
  }, []);

  const {
    transcript,
    isListening,
    isSupported,
    toggle: handleVoiceClick,
  } = useVoiceRecognition({
    onResult: handleVoiceResult,
    onEmpty: () => {
      setStatus("idle");
      toast.error("음성을 인식하지 못했습니다", {
        description: "다시 말씀해 주세요.",
      });
    },
    onError: () => {
      setStatus("idle");
      toast.error("음성 인식 오류", {
        description: "마이크 권한을 확인해 주세요.",
      });
    },
  });

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
  }, []);

  const handleVoiceClickWithCheck = useCallback(() => {
    if (!isSupported) {
      toast.error("지원하지 않는 브라우저", {
        description: "Chrome, Edge, Safari에서 음성 인식을 사용할 수 있습니다.",
      });
      return;
    }
    if (!isListening) {
      setStatus("listening");
    }
    handleVoiceClick();
  }, [isSupported, isListening, handleVoiceClick]);

  return (
    <main className="min-h-screen bg-[#030303] text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
        <header className="text-center space-y-2 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter">
              Mood<span className="text-primary">Tube</span>
            </h1>
            <div className="flex-1 flex justify-end">
              {sessionStatus === "authenticated" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  로그아웃
                </Button>
              ) : sessionStatus === "unauthenticated" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signIn("google", { callbackUrl: "/mood" })}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  로그인
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant={inputMode === "capture" ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                setInputMode("capture");
                setStatus("idle");
                setResult(null);
              }}
              className={
                inputMode === "capture" ? "bg-primary" : "border-zinc-600"
              }
            >
              <Camera className="w-4 h-4 mr-1.5" />
              캡처
            </Button>
            <Button
              variant={inputMode === "voice" ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                setInputMode("voice");
                setStatus("idle");
                setResult(null);
              }}
              className={
                inputMode === "voice" ? "bg-primary" : "border-zinc-600"
              }
            >
              <Mic className="w-4 h-4 mr-1.5" />
              음성
            </Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10">
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <Card className="overflow-hidden bg-zinc-900 border-zinc-800 rounded-xl sm:rounded-2xl md:rounded-[2rem]">
              {inputMode === "capture" ? (
                <>
                  {!cameraStarted ? (
                    <div className="aspect-square flex flex-col items-center justify-center gap-4 sm:gap-6 text-zinc-500">
                      <Camera className="w-16 h-16 sm:w-20 sm:h-20" />
                      <p className="text-sm sm:text-base text-center px-4">
                        버튼을 누르면 카메라가 켜집니다
                      </p>
                    </div>
                  ) : status === "idle" ? (
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full aspect-square object-cover"
                    />
                  ) : status === "scanning" ? (
                    <div className="aspect-square flex flex-col items-center justify-center gap-3 sm:gap-4">
                      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
                      <p className="animate-pulse text-sm sm:text-base">
                        기분을 읽는 중...
                      </p>
                    </div>
                  ) : (
                    <img
                      src={result?.capturedImage}
                      alt=""
                      className="w-full aspect-square object-cover opacity-50"
                    />
                  )}
                </>
              ) : (
                <>
                  {status === "listening" ? (
                    <div className="aspect-square flex flex-col items-center justify-center gap-4 sm:gap-6">
                      <div className="relative">
                        <Mic className="w-20 h-20 sm:w-24 sm:h-24 text-primary animate-pulse" />
                        <span className="absolute -inset-2 rounded-full bg-primary/20 animate-ping" />
                      </div>
                      <p className="text-sm sm:text-base text-zinc-400 text-center px-4">
                        말씀해 주세요...
                      </p>
                      {transcript && (
                        <p className="text-base sm:text-lg text-white font-medium text-center px-4 max-h-24 overflow-y-auto">
                          &ldquo;{transcript}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : status === "scanning" ? (
                    <div className="aspect-square flex flex-col items-center justify-center gap-3 sm:gap-4">
                      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
                      <p className="animate-pulse text-sm sm:text-base">
                        기분을 읽는 중...
                      </p>
                    </div>
                  ) : status === "result" && result?.voicePrompt ? (
                    <div className="aspect-square flex flex-col items-center justify-center gap-4 p-6 text-zinc-400">
                      <Mic className="w-16 h-16 sm:w-20 sm:h-20 opacity-50" />
                      <p className="text-sm sm:text-base text-center line-clamp-4">
                        &ldquo;{result.voicePrompt}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="aspect-square flex flex-col items-center justify-center gap-4 sm:gap-6 text-zinc-500">
                      <Mic className="w-16 h-16 sm:w-20 sm:h-20" />
                      <p className="text-sm sm:text-base text-center px-4">
                        버튼을 누르고 기분이나 원하는 분위기를 말해 주세요
                      </p>
                    </div>
                  )}
                </>
              )}
            </Card>
            {inputMode === "capture" ? (
              <Button
                onClick={
                  cameraStarted ? handleCapture : () => setCameraStarted(true)
                }
                disabled={status === "scanning"}
                className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl"
              >
                {status === "scanning"
                  ? "분석 중..."
                  : cameraStarted
                    ? "START SCANNING"
                    : "캡처 시작"}
              </Button>
            ) : (
              <Button
                onClick={handleVoiceClickWithCheck}
                disabled={status === "scanning"}
                className={`w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl ${
                  isListening
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {status === "scanning"
                  ? "분석 중..."
                  : isListening
                    ? "녹음 중지"
                    : "음성으로 말하기"}
              </Button>
            )}
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
              <div className="h-64 sm:h-80 lg:h-full border-2 border-dashed border-zinc-800 rounded-xl sm:rounded-2xl md:rounded-[2rem] flex items-center justify-center text-zinc-600 text-sm sm:text-base px-4 text-center">
                {inputMode === "capture"
                  ? "사진을 촬영하면 여기에 플레이리스트가 나타납니다."
                  : "음성으로 말하면 여기에 플레이리스트가 나타납니다."}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
