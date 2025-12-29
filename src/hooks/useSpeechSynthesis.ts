import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  UseSpeechSynthesisOptions,
  UseSpeechSynthesisResult,
} from '../Bubble/MessagesContent/VoiceButton/types';

export const useSpeechSynthesis = (
  options: UseSpeechSynthesisOptions,
): UseSpeechSynthesisResult => {
  const { text, defaultRate = 1 } = options;

  const isSupported = useMemo(
    () => typeof window !== 'undefined' && !!window.speechSynthesis,
    [],
  );

  const [rate, setRate] = useState<number>(defaultRate);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      if (utterRef.current) {
        utterRef.current.onend = null;
        utterRef.current.onerror = null;
      }
      window.speechSynthesis.cancel();
    } catch (e) {}
    utterRef.current = null;
    setIsPlaying(false);
  }, [isSupported]);

  const start = useCallback(() => {
    if (!isSupported) return;
    if (!text) return;

    try {
      if (utterRef.current) {
        utterRef.current.onend = null;
        utterRef.current.onerror = null;
      }
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utterRef.current = utter;

      utter.onend = () => {
        setIsPlaying(false);
        utterRef.current = null;
      };
      utter.onerror = () => {
        setIsPlaying(false);
        utterRef.current = null;
      };

      window.speechSynthesis.speak(utter);
      setIsPlaying(true);
    } catch (e) {
      setIsPlaying(false);
    }
  }, [isSupported, text, rate]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.pause();
    } catch (e) {}
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.resume();
    } catch (e) {}
  }, [isSupported]);

  // 变更倍速：若正在播报，重启使之生效
  useEffect(() => {
    if (!isSupported) return;
    if (!isPlaying) return;
    start();
  }, [rate]);

  // 卸载时清理（不触发 onStop）
  useEffect(() => {
    if (!isSupported) return;
    return () => {
      if (utterRef.current) {
        try {
          utterRef.current.onend = null;
          utterRef.current.onerror = null;
          window.speechSynthesis.cancel();
        } catch (e) {}
        utterRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [isSupported]);

  return {
    isSupported,
    isPlaying,
    rate,
    setRate,
    start,
    stop,
    pause,
    resume,
  };
};

export default useSpeechSynthesis;
