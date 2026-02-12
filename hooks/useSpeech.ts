
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export const useSpeech = (): UseSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;

    // Cancel any current speaking
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // improved voice selection: prefer 'Google US English' or acceptable default
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => voice.name === 'Google US English') || voices.find(voice => voice.lang.startsWith('en')) || null;
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
};
