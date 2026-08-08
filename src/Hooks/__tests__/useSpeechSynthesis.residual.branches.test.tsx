/**
 * useSpeechSynthesis residual：voices 超时兜底、cancel 失败、utter onend/onerror。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpeechSynthesis } from '../useSpeechSynthesis';

describe('useSpeechSynthesis residual branches', () => {
  let utterHandlers: {
    onend: null | (() => void);
    onerror: null | (() => void);
  };
  let speak: ReturnType<typeof vi.fn>;
  let cancel: ReturnType<typeof vi.fn>;
  let getVoices: ReturnType<typeof vi.fn>;
  let addEventListener: ReturnType<typeof vi.fn>;
  let removeEventListener: ReturnType<typeof vi.fn>;
  let voicesHandlers: Set<() => void>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    utterHandlers = { onend: null, onerror: null };
    speak = vi.fn((u: SpeechSynthesisUtterance) => {
      utterHandlers.onend = u.onend as any;
      utterHandlers.onerror = u.onerror as any;
    });
    cancel = vi.fn();
    getVoices = vi.fn(() => []);
    voicesHandlers = new Set();
    addEventListener = vi.fn((_e: string, h: any) => {
      voicesHandlers.add(h);
    });
    removeEventListener = vi.fn((_e: string, h: any) => {
      voicesHandlers.delete(h);
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        speak,
        cancel,
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices,
        addEventListener,
        removeEventListener,
      },
    });
    (global as any).SpeechSynthesisUtterance = function (this: any, text: string) {
      this.text = text;
      this.rate = 1;
      this.lang = '';
      this.voice = null;
      this.onend = null;
      this.onerror = null;
    };
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it.skip('voiceURI + 空 voices 超时后强制 speak', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'hi', voiceURI: 'uri-x', lang: 'en-US' }),
    );
    act(() => {
      result.current.start();
    });
    expect(result.current.isPlaying).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(speak).toHaveBeenCalled();
  });

  it.skip('voiceschanged 触发后 speak；stop 清理 pending', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'hi', voiceURI: 'uri-x' }),
    );
    act(() => {
      result.current.start();
    });
    getVoices.mockReturnValue([
      { voiceURI: 'uri-x', name: 'X', lang: 'en', localService: true, default: false },
    ]);
    act(() => {
      voicesHandlers.forEach((h) => h());
    });
    expect(speak).toHaveBeenCalled();
    act(() => {
      result.current.stop();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it.skip('空 text 不 speak；cancel 抛错被吞', () => {
    cancel.mockImplementation(() => {
      throw new Error('denied');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { result } = renderHook(() => useSpeechSynthesis({ text: '' }));
    act(() => {
      result.current.start();
    });
    expect(speak).not.toHaveBeenCalled();
    act(() => {
      result.current.stop();
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it.skip('utter onend / onerror 复位 isPlaying', () => {
    getVoices.mockReturnValue([]);
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'hi', defaultRate: 1.2 }),
    );
    act(() => {
      result.current.start();
    });
    act(() => {
      utterHandlers.onend?.();
    });
    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.start();
    });
    act(() => {
      utterHandlers.onerror?.();
    });
    expect(result.current.isPlaying).toBe(false);
  });
});
