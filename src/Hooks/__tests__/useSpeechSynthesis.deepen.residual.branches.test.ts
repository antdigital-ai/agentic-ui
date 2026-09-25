/**
 * useSpeechSynthesis deepen：默认 rate、不支持环境、过期 voices handler。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpeechSynthesis } from '../useSpeechSynthesis';

describe('useSpeechSynthesis deepen residual branches', () => {
  let speak: ReturnType<typeof vi.fn>;
  let cancel: ReturnType<typeof vi.fn>;
  let getVoices: ReturnType<typeof vi.fn>;
  let addEventListener: ReturnType<typeof vi.fn>;
  let removeEventListener: ReturnType<typeof vi.fn>;
  let voicesHandlers: Array<() => void>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    speak = vi.fn();
    cancel = vi.fn();
    getVoices = vi.fn(() => []);
    voicesHandlers = [];
    addEventListener = vi.fn((_e: string, h: () => void) => {
      voicesHandlers.push(h);
    });
    removeEventListener = vi.fn();
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
    (globalThis as any).SpeechSynthesisUtterance = function (
      this: any,
      text: string,
    ) {
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
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('未传 defaultRate 时使用 1；无 speechSynthesis 时 start 早退', () => {
    const { result } = renderHook(() => useSpeechSynthesis({ text: 'hi' }));
    expect(result.current.rate).toBe(1);

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const unsupported = renderHook(() =>
      useSpeechSynthesis({ text: 'x', defaultRate: 1.2 }),
    );
    act(() => {
      unsupported.result.current.start();
      unsupported.result.current.stop();
    });
    expect(unsupported.result.current.isPlaying).toBe(false);
    unsupported.unmount();
  });

  it('voiceschanged 在 stop 后变为过期句柄则跳过', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'hi', voiceURI: 'uri-x' }),
    );
    act(() => {
      result.current.start();
    });
    expect(voicesHandlers.length).toBeGreaterThan(0);
    const stale = voicesHandlers[0];
    act(() => {
      result.current.stop();
    });
    act(() => {
      stale();
    });
    expect(speak).not.toHaveBeenCalled();
  });

  it('超时前 stop 使 timeout handler 过期', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'hi', voiceURI: 'uri-x' }),
    );
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.stop();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(speak).not.toHaveBeenCalled();
  });
});
