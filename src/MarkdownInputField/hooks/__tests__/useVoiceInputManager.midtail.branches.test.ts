/**
 * useVoiceInputManager mid-tail：无 recognizer、cancel-during-start、error、stop。
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useVoiceInputManager } from '../useVoiceInputManager';

describe('useVoiceInputManager midtail branches', () => {
  it('无 voiceRecognizer 时 start 为 no-op', async () => {
    const { result } = renderHook(() => useVoiceInputManager({}));
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.recording).toBe(false);
  });

  it('正常 start/stop；onPartial 写入编辑器', async () => {
    const setMDContent = vi.fn();
    const getMDContent = vi.fn(() => 'base');
    const onValueChange = vi.fn();
    const stop = vi.fn(async () => {});
    const start = vi.fn(async () => {});
    let handlers: any;
    const voiceRecognizer = vi.fn(async (h: any) => {
      handlers = h;
      return { start, stop };
    });

    const { result } = renderHook(() =>
      useVoiceInputManager({
        voiceRecognizer,
        editorRef: {
          current: { store: { getMDContent, setMDContent } },
        } as any,
        onValueChange,
      }),
    );

    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.recording).toBe(true);
    expect(start).toHaveBeenCalled();

    act(() => {
      handlers.onSentenceBegin();
      handlers.onPartial('hello');
    });
    expect(setMDContent).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalled();

    await act(async () => {
      await result.current.stopRecording();
    });
    expect(result.current.recording).toBe(false);
    expect(stop).toHaveBeenCalled();
  });

  it('start await 期间 stop 会 cancel，不进入 recording', async () => {
    let resolveRec: (v: any) => void;
    const pending = new Promise((resolve) => {
      resolveRec = resolve;
    });
    const stop = vi.fn(async () => {});
    const start = vi.fn(async () => {});
    const voiceRecognizer = vi.fn(async () => pending as any);

    const { result } = renderHook(() =>
      useVoiceInputManager({ voiceRecognizer }),
    );

    let startPromise: Promise<void>;
    act(() => {
      startPromise = result.current.startRecording();
    });
    await act(async () => {
      await result.current.stopRecording();
    });
    resolveRec!({ start, stop });
    await act(async () => {
      await startPromise!;
    });
    expect(result.current.recording).toBe(false);
    expect(stop).toHaveBeenCalled();
  });

  it('onError 清理 recording；重复 start 被忽略', async () => {
    let handlers: any;
    const stop = vi.fn(async () => {});
    const start = vi.fn(async () => {});
    const voiceRecognizer = vi.fn(async (h: any) => {
      handlers = h;
      return { start, stop };
    });
    const { result } = renderHook(() =>
      useVoiceInputManager({ voiceRecognizer }),
    );
    await act(async () => {
      await result.current.startRecording();
    });
    await act(async () => {
      await result.current.startRecording();
    });
    expect(voiceRecognizer).toHaveBeenCalledTimes(1);

    act(() => {
      handlers.onError(new Error('x'));
    });
    expect(result.current.recording).toBe(false);
  });

  it('recognizer 抛错时不进入 recording', async () => {
    const voiceRecognizer = vi.fn(async () => {
      throw new Error('fail');
    });
    const { result } = renderHook(() =>
      useVoiceInputManager({ voiceRecognizer }),
    );
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.recording).toBe(false);
  });
});
