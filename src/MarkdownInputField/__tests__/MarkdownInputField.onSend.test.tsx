/**
 * useSendHandler hook 测试 - onSend 防重复触发
 *
 * 直接测试 hook 逻辑，不渲染 MarkdownInputField（Slate 编辑器在 jsdom 中会阻塞）。
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSendHandler } from '../hooks/useSendHandler';

vi.mock('../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

describe('useSendHandler - onSend 防重复触发', () => {
  const createMockParams = (overrides: Record<string, any> = {}) => {
    const markdownEditorRef = {
      current: {
        store: {
          getMDContent: () => 'test content',
          clearContent: vi.fn(),
          setMDContent: vi.fn(),
        },
        markdownEditorRef: { current: null },
      },
    } as any;

    const props = {
      disabled: false,
      typing: false,
      onChange: vi.fn(),
      onSend: vi.fn().mockResolvedValue(undefined),
      allowEmptySubmit: false,
      ...(overrides.props || {}),
    };

    return {
      props,
      sendDisabled: false,
      markdownEditorRef,
      isSendingRef: { current: false },
      isLoading: false,
      setIsLoading: vi.fn(),
      value: 'test content',
      setValue: vi.fn(),
      setFileMap: vi.fn(),
      recording: false,
      stopRecording: vi.fn().mockResolvedValue(undefined),
      ...overrides,
      props,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常发送应触发 onSend 一次', async () => {
    const params = createMockParams();
    const { result } = renderHook(() => useSendHandler(params));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(params.props.onSend).toHaveBeenCalledTimes(1);
  });

  it('isSendingRef 为 true 时应阻止发送', async () => {
    const params = createMockParams();
    params.isSendingRef.current = true;

    const { result } = renderHook(() => useSendHandler(params));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(params.props.onSend).not.toHaveBeenCalled();
  });

  it('disabled 状态下应阻止发送', async () => {
    const params = createMockParams({ props: { disabled: true } });

    const { result } = renderHook(() => useSendHandler(params));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(params.props.onSend).not.toHaveBeenCalled();
  });

  it('typing 状态下应阻止发送', async () => {
    const params = createMockParams({ props: { typing: true } });

    const { result } = renderHook(() => useSendHandler(params));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(params.props.onSend).not.toHaveBeenCalled();
  });

  it('空内容且不允许空提交时应阻止发送', async () => {
    const params = createMockParams();
    params.value = '';
    params.markdownEditorRef.current.store.getMDContent = () => '';

    const { result } = renderHook(() => useSendHandler(params));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(params.props.onSend).not.toHaveBeenCalled();
  });

  it('allowEmptySubmit 时空内容也应触发发送', async () => {
    const params = createMockParams({ props: { allowEmptySubmit: true } });
    params.value = '';
    params.markdownEditorRef.current.store.getMDContent = () => '';

    const { result } = renderHook(() => useSendHandler(params));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(params.props.onSend).toHaveBeenCalledTimes(1);
  });

  it('sendDisabled 为 true 时应阻止发送', async () => {
    const params = createMockParams({ sendDisabled: true });

    const { result } = renderHook(() => useSendHandler(params));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(params.props.onSend).not.toHaveBeenCalled();
  });

  it('发送完成后 isSendingRef 应重置为 false', async () => {
    const params = createMockParams();

    const { result } = renderHook(() => useSendHandler(params));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(params.isSendingRef.current).toBe(false);
  });

  it('发送过程中 isSendingRef 应为 true', async () => {
    let resolveOnSend: () => void;
    const params = createMockParams({
      props: {
        onSend: vi.fn(
          () =>
            new Promise<void>((resolve) => {
              resolveOnSend = resolve;
            }),
        ),
      },
    });

    const { result } = renderHook(() => useSendHandler(params));

    let sendPromise: Promise<void>;
    act(() => {
      sendPromise = result.current.sendMessage();
    });

    expect(params.isSendingRef.current).toBe(true);

    await act(async () => {
      resolveOnSend!();
      await sendPromise!;
    });

    expect(params.isSendingRef.current).toBe(false);
  });

  it('isLoading 为 true 时应阻止发送', async () => {
    const params = createMockParams({ isLoading: true });

    const { result } = renderHook(() => useSendHandler(params));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(params.props.onSend).not.toHaveBeenCalled();
  });
});
