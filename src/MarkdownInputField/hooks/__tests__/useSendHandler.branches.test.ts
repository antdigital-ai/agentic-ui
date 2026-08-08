/**
 * useSendHandler：disabled 早退分支（显式 branches 文件）。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSendHandler } from '../useSendHandler';

vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

describe('useSendHandler branches', () => {
  it('props.disabled 为 true 时 sendMessage 直接 return', async () => {
    const onSend = vi.fn();
    const { result } = renderHook(() =>
      useSendHandler({
        props: {
          disabled: true,
          typing: false,
          allowEmptySubmit: false,
          onSend,
        },
        markdownEditorRef: { current: undefined },
        isSendingRef: { current: false },
        isLoading: false,
        setIsLoading: vi.fn(),
        value: 'hi',
        setValue: vi.fn(),
        recording: false,
        stopRecording: vi.fn(),
      }),
    );
    await result.current.sendMessage();
    expect(onSend).not.toHaveBeenCalled();
  });
});
