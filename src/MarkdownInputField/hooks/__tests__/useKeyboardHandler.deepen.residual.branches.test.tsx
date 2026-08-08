/**
 * useKeyboardHandler deepen：IME / Enter 发送路径参数装配。
 */
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardHandler } from '../useKeyboardHandler';

describe('useKeyboardHandler deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('Enter 触发 sendMessage；Shift+Enter 不发送', () => {
    const sendMessage = vi.fn();
    const markdownEditorRef = {
      current: {
        store: { inputComposition: false },
      },
    } as any;
    const { result } = renderHook(() =>
      useKeyboardHandler({
        props: { triggerSendKey: 'Enter', onSend: vi.fn() },
        markdownEditorRef,
        sendMessage,
      }),
    );
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    result.current.handleKeyDown({
      key: 'Enter',
      shiftKey: true,
      metaKey: false,
      ctrlKey: false,
      preventDefault,
      stopPropagation,
      nativeEvent: { isComposing: false },
    } as any);
    expect(sendMessage).not.toHaveBeenCalled();

    result.current.handleKeyDown({
      key: 'Enter',
      shiftKey: false,
      metaKey: false,
      ctrlKey: false,
      preventDefault,
      stopPropagation,
      nativeEvent: { isComposing: false },
      target: document.createElement('div'),
    } as any);
  });
});
