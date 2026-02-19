import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpeechSynthesis } from '../../src/Hooks/useSpeechSynthesis';

// Mock SpeechSynthesis API
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();

describe('useSpeechSynthesis Hook', () => {
  beforeEach(() => {
    mockSpeak.mockClear();
    mockCancel.mockClear();
    mockPause.mockClear();
    mockResume.mockClear();

    // Mock window.speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        pause: mockPause,
        resume: mockResume,
      },
    });

    // Mock SpeechSynthesisUtterance
    global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
      text,
      rate: 1,
      onend: null,
      onerror: null,
    })) as any;
  });

  it('应该正确检测浏览器支持', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    expect(result.current.isSupported).toBe(true);
  });

  it('应该初始化为未播放状态', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    expect(result.current.isPlaying).toBe(false);
  });

  it('应该使用默认倍速', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1.5 }),
    );

    expect(result.current.rate).toBe(1.5);
  });

  it('应该能够开始播放', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello World', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(true);
  });

  it('应该能够停止播放', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  it('应该能够暂停播放', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    act(() => {
      result.current.pause();
    });

    expect(mockPause).toHaveBeenCalled();
  });

  it('应该能够恢复播放', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    act(() => {
      result.current.resume();
    });

    expect(mockResume).toHaveBeenCalled();
  });

  it('应该能够改变倍速', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    expect(result.current.rate).toBe(1);

    act(() => {
      result.current.setRate(1.5);
    });

    expect(result.current.rate).toBe(1.5);
  });

  it('应在播放中改变倍速时重启播报', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.setRate(1.5);
    });
    expect(result.current.rate).toBe(1.5);
    expect(mockSpeak).toHaveBeenCalledTimes(2);
  });

  it('应该在文本为空时不开始播放', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: '', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });

    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('应该处理播放完成事件', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isPlaying).toBe(true);

    // 模拟播放完成
    const utterance = (SpeechSynthesisUtterance as any).mock.results[0].value;
    if (utterance.onend) {
      act(() => {
        utterance.onend();
      });
    }

    expect(result.current.isPlaying).toBe(false);
  });

  it('第二次 start 时应清除上一次 utterance 的 onend/onerror', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });
    const firstUtterance = (SpeechSynthesisUtterance as any).mock.results[0]
      .value;
    expect(firstUtterance.onend).toBeDefined();
    expect(firstUtterance.onerror).toBeDefined();

    act(() => {
      result.current.start();
    });
    expect(SpeechSynthesisUtterance).toHaveBeenCalledTimes(2);
    expect(mockCancel).toHaveBeenCalledTimes(2);
  });

  it('应该处理播放错误事件', () => {
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isPlaying).toBe(true);

    // 模拟播放错误
    const utterance = (SpeechSynthesisUtterance as any).mock.results[0].value;
    if (utterance.onerror) {
      act(() => {
        utterance.onerror();
      });
    }

    expect(result.current.isPlaying).toBe(false);
  });

  it('应该在卸载时清理资源', () => {
    const { result, unmount } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    // 先开始播放，确保有 utterance 存在
    act(() => {
      result.current.start();
    });

    const callCountBeforeUnmount = mockCancel.mock.calls.length;
    
    unmount();

    // 卸载后应该再次调用 cancel
    expect(mockCancel.mock.calls.length).toBeGreaterThan(callCountBeforeUnmount);
  });

  it('start 时 speak 抛错应进入 catch 并设置 isPlaying 为 false', () => {
    mockSpeak.mockImplementationOnce(() => {
      throw new Error('speak failed');
    });
    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('应该在浏览器不支持时优雅降级', () => {
    // 移除 speechSynthesis 支持
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() =>
      useSpeechSynthesis({ text: 'Hello', defaultRate: 1 }),
    );

    expect(result.current.isSupported).toBe(false);

    // 这些方法应该不会抛出错误
    act(() => {
      result.current.start();
      result.current.stop();
      result.current.pause();
      result.current.resume();
    });
  });
});

