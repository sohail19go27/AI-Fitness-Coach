"use client";

import { useEffect, useRef, useState } from "react";

type UseSpeech = {
  speak: (text: string, voice?: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  audioUrl: string | null;
};

export function useSpeech(): UseSpeech {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    const a = audioRef.current;
    const onEnd = () => setIsPlaying(false);
    a.addEventListener("ended", onEnd);
    a.addEventListener("pause", () => setIsPlaying(false));
    a.addEventListener("play", () => setIsPlaying(true));
    return () => {
      a.pause();
      a.removeEventListener("ended", onEnd);
      a.src = "";
      if (audioUrl) {
        try {
          URL.revokeObjectURL(audioUrl);
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function speak(text: string, voice?: string) {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });

      if (!res.ok) {
        const txt = await res.text();
        setError(txt || `TTS request failed (${res.status})`);
        setIsLoading(false);
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.startsWith("audio")) {
        const txt = await res.text();
        setError(txt || "Unexpected TTS response");
        setIsLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // cleanup previous
      if (audioUrl) {
        try {
          URL.revokeObjectURL(audioUrl);
        } catch {}
      }
      setAudioUrl(url);

      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = url;
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setIsLoading(false);
    }
  }

  function stop() {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (audioUrl) {
        try {
          URL.revokeObjectURL(audioUrl);
        } catch {}
        setAudioUrl(null);
      }
    } catch (err) {
      /* ignore */
    }
    setIsPlaying(false);
  }

  return { speak, stop, isPlaying, isLoading, error, audioUrl };
}

export default useSpeech;
