"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseVoiceRecognitionOptions {
  onResult: (text: string) => void | Promise<void>;
  onEmpty?: () => void;
  onError?: () => void;
  lang?: string;
}

export function useVoiceRecognition({
  onResult,
  onEmpty,
  onError,
  lang = "ko-KR",
}: UseVoiceRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const SpeechRecognitionAPI =
    typeof window !== "undefined" &&
    (window.SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition);

  const isSupported = !!SpeechRecognitionAPI;

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI) return false;

    const recognition = new (SpeechRecognitionAPI as typeof SpeechRecognition)();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onaudiostart = () => {
      setTranscript("");
      transcriptRef.current = "";
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = finalTranscript;
      setTranscript(finalTranscript);
    };

    recognition.onend = async () => {
      setIsListening(false);
      const finalText = transcriptRef.current.trim();
      if (finalText) {
        await onResult(finalText);
      } else {
        onEmpty?.();
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      onError?.();
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript("");
    transcriptRef.current = "";
    recognition.start();
    return true;
  }, [SpeechRecognitionAPI, lang, onResult, onEmpty, onError]);

  const stop = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    start,
    stop,
    toggle,
  };
}
