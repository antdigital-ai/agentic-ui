import { useCallback, useEffect, useRef, useState } from 'react';
import {
  UseSpeechSynthesisOptions,
  UseSpeechSynthesisResult,
} from '../Bubble/MessagesContent/VoiceButton/types';

export const useSpeechSynthesis = (
  options: UseSpeechSynthesisOptions,
): UseSpeechSynthesisResult => {
  const { text, defaultRate = 1 } = options;

  // 仅依赖宿主环境特性，无任何依赖；直接 const 即可，无需 useMemo
  const isSupported =
    typeof window !== 'undefined' && !!window.speechSynthesis;

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
    } catch (e) {
      // 浏览器拒绝 cancel（如未授权 / 焦点丢失）。降级为不抛错，但需可观测
      console.warn('[useSpeechSynthesis] cancel failed', e);
    }
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
      // 常见原因：缺少用户手势、quota 超限、voices 尚未加载完成
      console.warn('[useSpeechSynthesis] speak failed', e);
      setIsPlaying(false);
    }
  }, [isSupported, text, rate]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.pause();
    } catch (e) {
      console.warn('[useSpeechSynthesis] pause failed', e);
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.resume();
    } catch (e) {
      console.warn('[useSpeechSynthesis] resume failed', e);
    }
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
        } catch (e) {
          console.warn('[useSpeechSynthesis] cleanup cancel failed', e);
        }
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
