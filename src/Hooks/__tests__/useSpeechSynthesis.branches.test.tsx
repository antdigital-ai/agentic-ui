import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpeechSynthesis } from '../useSpeechSynthesis';

const VOICES_PENDING_TIMEOUT_MS = 1500;

describe('useSpeechSynthesis branches', () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let mockPause: ReturnType<typeof vi.fn>;
  let mockResume: ReturnType<typeof vi.fn>;
  let mockGetVoices: ReturnType<typeof vi.fn>;
  let voicesChangedHandlers: Set<EventListenerOrEventListenerObject>;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  const installSpeechSynthesis = (overrides?: {
    voices?: SpeechSynthesisVoice[];
    omitGetVoices?: boolean;
    omitAddEventListener?: boolean;
    omitRemoveEventListener?: boolean;
  }) => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockPause = vi.fn();
    mockResume = vi.fn();
    voicesChangedHandlers = new Set();
    mockGetVoices = vi.fn(() => overrides?.voices ?? []);

    mockAddEventListener = vi.fn((event: string, handler: EventListener) => {
      if (event === 'voiceschanged') {
        voicesChangedHandlers.add(handler);
      }
    });
    mockRemoveEventListener = vi.fn((event: string, handler: EventListener) => {
      if (event === 'voiceschanged') {
        voicesChangedHandlers.delete(handler);
      }
    });

    const synthesis: Record<string, unknown> = {
      speak: mockSpeak,
      cancel: mockCancel,
      pause: mockPause,
      resume: mockResume,
    };

    if (!overrides?.omitGetVoices) {
      synthesis.getVoices = mockGetVoices;
    }
    if (!overrides?.omitAddEventListener) {
      synthesis.addEventListener = mockAddEventListener;
    }
    if (!overrides?.omitRemoveEventListener) {
      synthesis.removeEventListener = mockRemoveEventListener;
    }

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: synthesis,
    });

    global.SpeechSynthesisUtterance = vi.fn(function SpeechSynthesisUtteranceMock(
      this: SpeechSynthesisUtterance,
      text: string,
    ) {
      this.text = text;
      this.rate = 1;
      this.voice = null;
      this.lang = '';
      this.onend = null;
      this.onerror = null;
    }) as unknown as typeof SpeechSynthesisUtterance;
  };

  const fireVoicesChanged = () => {
    voicesChangedHandlers.forEach((handler) => {
      if (typeof handler === 'function') {
        handler(new Event('voiceschanged'));
      } else {
        handler.handleEvent(new Event('voiceschanged'));
      }
    });
  };

  beforeEach(() => {
    installSpeechSynthesis();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('findVoice：无 voiceURI 时不设置 voice', () => {
    mockGetVoices.mockReturnValue([
      { voiceURI: 'voice-a', name: 'A' } as SpeechSynthesisVoice,
    ]);
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'hello', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });

    const utterance = (SpeechSynthesisUtterance as unknown as ReturnType<typeof vi.fn>)
      .mock.results[0].value;
    expect(utterance.voice).toBeNull();
  });

  it('findVoice：匹配 voiceURI 时设置 voice', () => {
    const matched = { voiceURI: 'target-voice', name: 'Target' } as SpeechSynthesisVoice;
    mockGetVoices.mockReturnValue([matched]);

    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'hello',
        defaultRate: 1,
        voiceURI: 'target-voice',
      }),
    );

    act(() => {
      result.current.start();
    });

    const utterance = (SpeechSynthesisUtterance as unknown as ReturnType<typeof vi.fn>)
      .mock.results[0].value;
    expect(utterance.voice).toBe(matched);
  });

  it('findVoice：未匹配 voiceURI 时回退默认（voice 不设置）', () => {
    mockGetVoices.mockReturnValue([
      { voiceURI: 'other', name: 'Other' } as SpeechSynthesisVoice,
    ]);

    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'hello',
        defaultRate: 1,
        voiceURI: 'missing-voice',
      }),
    );

    act(() => {
      result.current.start();
    });

    const utterance = (SpeechSynthesisUtterance as unknown as ReturnType<typeof vi.fn>)
      .mock.results[0].value;
    expect(utterance.voice).toBeNull();
  });

  it('start：设置 lang', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'hello', defaultRate: 1, lang: 'zh-CN' }),
    );

    act(() => {
      result.current.start();
    });

    const utterance = (SpeechSynthesisUtterance as unknown as ReturnType<typeof vi.fn>)
      .mock.results[0].value;
    expect(utterance.lang).toBe('zh-CN');
  });

  it('voices 为空且指定 voiceURI 时进入 pending 等待', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'pending',
        defaultRate: 1,
        voiceURI: 'wait-voice',
      }),
    );

    act(() => {
      result.current.start();
    });

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'voiceschanged',
      expect.any(Function),
    );
    expect(mockSpeak).not.toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(true);
  });

  it('voiceschanged 触发后重新 start', () => {
    mockGetVoices
      .mockReturnValueOnce([])
      .mockReturnValue([
        { voiceURI: 'wait-voice', name: 'Wait' } as SpeechSynthesisVoice,
      ]);

    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'pending',
        defaultRate: 1,
        voiceURI: 'wait-voice',
      }),
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      fireVoicesChanged();
    });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });

  it('voices 等待超时后触发 warn 并重新 start', () => {
    vi.useFakeTimers();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'timeout',
        defaultRate: 1,
        voiceURI: 'wait-voice',
      }),
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(VOICES_PENDING_TIMEOUT_MS);
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('voiceschanged not fired'),
    );
    warnSpy.mockRestore();
    vi.useRealTimers();
  });

  it('addEventListener 失败时降级直接 speak', () => {
    mockAddEventListener.mockImplementation(() => {
      throw new Error('addEventListener failed');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'fallback',
        defaultRate: 1,
        voiceURI: 'wait-voice',
      }),
    );

    act(() => {
      result.current.start();
    });

    expect(warnSpy).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('stop 撤销 voices pending 监听与定时器', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'stop-pending',
        defaultRate: 1,
        voiceURI: 'wait-voice',
      }),
    );

    act(() => {
      result.current.start();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(mockRemoveEventListener).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  it('cancelVoicesPending：removeEventListener 抛错时 warn', () => {
    mockRemoveEventListener.mockImplementation(() => {
      throw new Error('remove failed');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'remove-err',
        defaultRate: 1,
        voiceURI: 'wait-voice',
      }),
    );

    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.stop();
    });

    expect(warnSpy).toHaveBeenCalledWith(
      '[useSpeechSynthesis] removeEventListener voiceschanged failed',
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it('无 getVoices 能力时跳过 pending 直接 speak', () => {
    installSpeechSynthesis({ omitGetVoices: true });

    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'no-get-voices',
        defaultRate: 1,
        voiceURI: 'any',
      }),
    );

    act(() => {
      result.current.start();
    });

    expect(mockSpeak).toHaveBeenCalled();
    expect(mockAddEventListener).not.toHaveBeenCalled();
  });

  it('无 addEventListener 能力时跳过 pending', () => {
    installSpeechSynthesis({ omitAddEventListener: true, omitRemoveEventListener: true });

    const { result } = renderHook(() =>
      useSpeechSynthesis({
        text: 'no-listen',
        defaultRate: 1,
        voiceURI: 'any',
      }),
    );

    act(() => {
      result.current.start();
    });

    expect(mockSpeak).toHaveBeenCalled();
  });

  it('stop：cancel 抛错时 warn 且 isPlaying 为 false', () => {
    mockCancel.mockImplementation(() => {
      throw new Error('cancel failed');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'cancel-err', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.stop();
    });

    expect(warnSpy).toHaveBeenCalledWith(
      '[useSpeechSynthesis] cancel failed',
      expect.any(Error),
    );
    expect(result.current.isPlaying).toBe(false);
    warnSpy.mockRestore();
  });

  it('pause/resume 抛错时 warn', () => {
    mockPause.mockImplementation(() => {
      throw new Error('pause failed');
    });
    mockResume.mockImplementation(() => {
      throw new Error('resume failed');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'pr', defaultRate: 1 }),
    );

    act(() => {
      result.current.pause();
      result.current.resume();
    });

    expect(warnSpy).toHaveBeenCalledWith(
      '[useSpeechSynthesis] pause failed',
      expect.any(Error),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      '[useSpeechSynthesis] resume failed',
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it('不支持 speechSynthesis 时 cancelVoicesPending 早退', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'unsupported', defaultRate: 1 }),
    );

    act(() => {
      result.current.stop();
    });

    expect(result.current.isSupported).toBe(false);
  });

  it('卸载时清理 utterance 与 voices pending', () => {
    let cancelCount = 0;
    mockCancel.mockImplementation(() => {
      cancelCount += 1;
      if (cancelCount > 1) {
        throw new Error('cleanup cancel failed');
      }
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result, unmount } = renderHook(() =>
      useSpeechSynthesis({ text: 'unmount', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });

    unmount();

    expect(warnSpy).toHaveBeenCalledWith(
      '[useSpeechSynthesis] cleanup cancel failed',
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it('卸载时 removeEventListener 抛错 warn', () => {
    mockRemoveEventListener.mockImplementation(() => {
      throw new Error('cleanup remove failed');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result, unmount } = renderHook(() =>
      useSpeechSynthesis({
        text: 'unmount-remove',
        defaultRate: 1,
        voiceURI: 'wait-voice',
      }),
    );

    act(() => {
      result.current.start();
    });
    unmount();

    expect(warnSpy).toHaveBeenCalledWith(
      '[useSpeechSynthesis] cleanup removeEventListener voiceschanged failed',
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it('第二次 start 清除上一次 utterance 回调', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'restart', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });
    const first = (SpeechSynthesisUtterance as unknown as ReturnType<typeof vi.fn>)
      .mock.results[0].value;
    expect(first.onend).toBeDefined();

    act(() => {
      result.current.start();
    });
    expect(first.onend).toBeNull();
    expect(first.onerror).toBeNull();
  });

  it('isPlaying 为 false 时变更 rate 不重启', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'rate-idle', defaultRate: 1 }),
    );

    act(() => {
      result.current.setRate(2);
    });

    expect(mockSpeak).not.toHaveBeenCalled();
  });
});
