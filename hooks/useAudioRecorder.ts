"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAudioRecorderOptions {
  onResult: (blob: Blob, mimeType: string) => void | Promise<void>;
  onError?: () => void;
}

/**
 * MediaRecorder 기반 오디오 녹음 훅
 * 녹음된 오디오를 Blob으로 반환 (Gemini 오디오 분석용)
 * 실시간 음량 레벨(0~1)을 volumeLevel로 제공
 */
export function useAudioRecorder({
  onResult,
  onError,
}: UseAudioRecorderOptions) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<{ context: AudioContext; analyser: AnalyserNode } | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const isSupported =
    typeof window !== "undefined" &&
    typeof navigator?.mediaDevices?.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined";

  const startVolumeMeter = useCallback((stream: MediaStream) => {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = { context, analyser };

    const updateVolume = () => {
      if (!analyserRef.current) return;
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const average = sum / bufferLength;
      // 일반 음성에서 0.3~0.8 범위가 되도록 민감도 조정
      setVolumeLevel(Math.min(1, (average / 80) * 1.2));
      rafRef.current = requestAnimationFrame(updateVolume);
    };
    rafRef.current = requestAnimationFrame(updateVolume);
  }, []);

  const stopVolumeMeter = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.context.close();
      analyserRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  useEffect(() => {
    return () => stopVolumeMeter();
  }, [stopVolumeMeter]);

  const start = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopVolumeMeter();
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          await onResult(blob, mimeType);
        }
        chunksRef.current = [];
      };

      recorder.onerror = () => {
        setIsRecording(false);
        stopVolumeMeter();
        onError?.();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      startVolumeMeter(stream);
      return true;
    } catch {
      setIsRecording(false);
      stopVolumeMeter();
      onError?.();
      return false;
    }
  }, [isSupported, onResult, onError, startVolumeMeter, stopVolumeMeter]);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isRecording) {
      stop();
    } else {
      start();
    }
  }, [isRecording, start, stop]);

  return {
    isRecording,
    isSupported,
    volumeLevel,
    start,
    stop,
    toggle,
  };
}
