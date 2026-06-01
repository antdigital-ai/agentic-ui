import { useCallback, useEffect, useRef, useState } from 'react';
import {
  UseSpeechSynthesisOptions,
  UseSpeechSynthesisResult,
} from '../Bubble/MessagesContent/VoiceButton/types';

/**
 * voices 异步加载等待超时（ms）：超过该时间仍未触发 voiceschanged，
 * 强制走「无 voice 匹配」路径 speak，避免 UI 永久卡在 isPlaying=true 但实际不响。
 * 1500ms 是 Chrome 实测的安全上限（实际通常 < 200ms）。
 */
const VOICES_PENDING_TIMEOUT_MS = 1500;

/**
 * 在 voices 列表中按 voiceURI 精确查找匹配的 voice；找不到时返回 null
 * 不抛错，让调用方安静地回退到默认音色
 */
const findVoice = (
  voices: SpeechSynthesisVoice[] | undefined,
  voiceURI: string | undefined,
): SpeechSynthesisVoice | null => {
  if (!voiceURI || !voices || voices.length === 0) return null;
  return voices.find((v) => v.voiceURI === voiceURI) ?? null;
};

export const useSpeechSynthesis = (
  options: UseSpeechSynthesisOptions,
): UseSpeechSynthesisResult => {
  const { text, defaultRate = 1, voiceURI, lang } = options;

  // 仅依赖宿主环境特性，无任何依赖；直接 const 即可，无需 useMemo
  const isSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

  const [rate, setRate] = useState<number>(defaultRate);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  /**
   * 当 getVoices() 首次返回空数组时，挂在 voiceschanged 上的等待句柄。
   * 用 addEventListener 而非 onvoiceschanged 单一槽位，避免被宿主页面 / 多实例覆盖。
   * 切换 text/voiceURI/卸载时需要主动撤销，避免回调里使用过期闭包。
   */
  const voicesPendingHandlerRef = useRef<(() => void) | null>(null);
  /** voices 等待超时句柄，超时后强制 speak 防止永久 pending */
  const voicesPendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  /**
   * start 通过 ref 持有，避免在 useCallback 闭包内递归调用旧版本。
   * voiceschanged 回调里通过 startRef.current() 调用永远是最新版。
   */
  const startRef = useRef<() => void>(() => {});

  /**
   * 撤销 voices 等待句柄：移除 voiceschanged 监听 + 清超时定时器，
   * 使旧的 pending start 完全失效
   */
  const cancelVoicesPending = useCallback(() => {
    if (!isSupported) {
      voicesPendingHandlerRef.current = null;
      voicesPendingTimerRef.current = null;
      return;
    }
    if (voicesPendingHandlerRef.current) {
      // 能力检测：部分宿主 / 老浏览器 / mock 不暴露 removeEventListener
      if (typeof window.speechSynthesis.removeEventListener === 'function') {
        try {
          window.speechSynthesis.removeEventListener(
            'voiceschanged',
            voicesPendingHandlerRef.current,
          );
        } catch (e) {
          console.warn(
            '[useSpeechSynthesis] removeEventListener voiceschanged failed',
            e,
          );
        }
      }
      voicesPendingHandlerRef.current = null;
    }
    if (voicesPendingTimerRef.current) {
      clearTimeout(voicesPendingTimerRef.current);
      voicesPendingTimerRef.current = null;
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    cancelVoicesPending();
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
  }, [isSupported, cancelVoicesPending]);

  const start = useCallback(() => {
    if (!isSupported) return;
    if (!text) return;

    try {
      if (utterRef.current) {
        utterRef.current.onend = null;
        utterRef.current.onerror = null;
      }
      window.speechSynthesis.cancel();
      // 上一次 pending 的 voices 等待已无意义，先清掉避免双重朗读
      cancelVoicesPending();

      // voices 异步加载兜底（仅当「调用方指定了 voiceURI」+「宿主提供了 getVoices」时启用）：
      // - Chrome / 部分 Safari 首次调用 getVoices() 常返回空数组，立即 speak 会回退默认音色
      // - 部分浏览器 / TTS polyfill 不暴露 getVoices/addEventListener，需做能力检测后降级
      // - 不指定 voiceURI 的场景维持原行为（直接 speak），保持向后兼容
      const canQueryVoices =
        typeof window.speechSynthesis.getVoices === 'function';
      const canListenVoices =
        typeof window.speechSynthesis.addEventListener === 'function' &&
        typeof window.speechSynthesis.removeEventListener === 'function';
      const voices = canQueryVoices ? window.speechSynthesis.getVoices() : [];
      if (
        voiceURI &&
        canQueryVoices &&
        canListenVoices &&
        voices.length === 0
      ) {
        const handler = () => {
          // 句柄已被新 start / stop / 卸载撤销，跳过本次回调（防止竞态）
          if (voicesPendingHandlerRef.current !== handler) return;
          cancelVoicesPending();
          // 通过 ref 调用最新版 start，避免闭包陷阱（捕获旧 text/rate/voiceURI）
          startRef.current();
        };
        voicesPendingHandlerRef.current = handler;
        try {
          // 用 addEventListener + removeEventListener 替代 onvoiceschanged 单一槽位，
          // 多实例 / 宿主页面其他代码可独立工作
          window.speechSynthesis.addEventListener('voiceschanged', handler);
        } catch (e) {
          console.warn(
            '[useSpeechSynthesis] addEventListener voiceschanged failed',
            e,
          );
          voicesPendingHandlerRef.current = null;
          // 监听挂不上：直接降级走默认音色 speak（不再等 voices）
        }
        // 超时兜底：浏览器永不触发 voiceschanged（罕见但存在）时强制走默认音色
        if (voicesPendingHandlerRef.current === handler) {
          voicesPendingTimerRef.current = setTimeout(() => {
            if (voicesPendingHandlerRef.current !== handler) return;
            console.warn(
              `[useSpeechSynthesis] voiceschanged not fired within ${VOICES_PENDING_TIMEOUT_MS}ms; speak with default voice`,
            );
            cancelVoicesPending();
            startRef.current();
          }, VOICES_PENDING_TIMEOUT_MS);
          // 等待中标记为播放态，避免 UI 出现"按了没反应"的中间态
          setIsPlaying(true);
          return;
        }
        // 如果 addEventListener 失败，跳过等待逻辑直接落到下面同步 speak
      }

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      // voiceURI 优先；未匹配到 voice 时回退默认（不抛错也不告警，否则首次启动会被刷屏）
      const matchedVoice = findVoice(voices, voiceURI);
      if (matchedVoice) utter.voice = matchedVoice;
      // lang 即便 voice 已设置也保留赋值 —— Web Speech 规范允许 lang 与 voice 不冲突
      if (lang) utter.lang = lang;
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
  }, [isSupported, text, rate, voiceURI, lang, cancelVoicesPending]);

  // 把最新版 start 同步到 ref，供 voiceschanged / setTimeout 回调通过 startRef.current() 调用
  // 用 useEffect 而非渲染期写 ref：start 引用变更后立即生效
  useEffect(() => {
    startRef.current = start;
  }, [start]);

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
      // 撤销可能挂着的 voices 等待句柄 + 超时定时器，避免卸载后回调进入失效闭包
      if (voicesPendingHandlerRef.current) {
        if (typeof window.speechSynthesis.removeEventListener === 'function') {
          try {
            window.speechSynthesis.removeEventListener(
              'voiceschanged',
              voicesPendingHandlerRef.current,
            );
          } catch (e) {
            console.warn(
              '[useSpeechSynthesis] cleanup removeEventListener voiceschanged failed',
              e,
            );
          }
        }
        voicesPendingHandlerRef.current = null;
      }
      if (voicesPendingTimerRef.current) {
        clearTimeout(voicesPendingTimerRef.current);
        voicesPendingTimerRef.current = null;
      }
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
