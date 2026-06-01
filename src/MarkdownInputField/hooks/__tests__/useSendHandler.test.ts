/**
 * useSendHandler Hook 单元测试
 * 由原 useMarkdownInputFieldHandlers.test.ts 中 sendMessage 段拆分而来。
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSendHandler } from '../useSendHandler';

vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

function createDefaultParams(overrides: Record<string, any> = {}) {
  const store = {
    getMDContent: vi.fn().mockReturnValue(''),
    clearContent: vi.fn(),
    inputComposition: false,
  };
  const markdownEditorRef = {
    current: {
      store,
      markdownEditorRef: { current: null },
    },
  } as any;
  const isSendingRef = { current: false };
  const setValue = vi.fn();
  const setFileMap = vi.fn();
  const setIsLoading = vi.fn();

  return {
    props: {
      disabled: false,
      typing: false,
      onChange: undefined as any,
      onSend: undefined as any,
      allowEmptySubmit: false,
    },
    sendDisabled: undefined as boolean | undefined,
    markdownEditorRef,
    isSendingRef,
    isLoading: false,
    setIsLoading,
    value: '',
    setValue,
    setFileMap,
    recording: false,
    stopRecording: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('useSendHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disabled 为 true 时直接 return', async () => {
    const params = createDefaultParams();
    params.props.disabled = true;
    params.props.onSend = vi.fn();
    const { result } = renderHook(() => useSendHandler(params));
    await result.current.sendMessage();
    expect(params.props.onSend).not.toHaveBeenCalled();
  });

  it('typing 为 true 时直接 return', async () => {
    const params = createDefaultParams();
    params.props.typing = true;
    params.props.onSend = vi.fn();
    const { result } = renderHook(() => useSendHandler(params));
    await result.current.sendMessage();
    expect(params.props.onSend).not.toHaveBeenCalled();
  });

  it('isLoading 为 true 时直接 return', async () => {
    const params = createDefaultParams({ isLoading: true });
    params.props.onSend = vi.fn();
    const { result } = renderHook(() => useSendHandler(params));
    await result.current.sendMessage();
    expect(params.props.onSend).not.toHaveBeenCalled();
  });

  it('sendDisabled 为 true 时直接 return，不触发 onSend 且 isSendingRef 不变', async () => {
    const params = createDefaultParams({ sendDisabled: true });
    params.props.onSend = vi.fn().mockResolvedValue(undefined);
    params.markdownEditorRef.current!.store.getMDContent.mockReturnValue(
      'content',
    );
    const { result } = renderHook(() => useSendHandler(params));
    await result.current.sendMessage();
    expect(params.props.onSend).not.toHaveBeenCalled();
    expect(params.setIsLoading).not.toHaveBeenCalled();
    expect(params.isSendingRef.current).toBe(false);
  });

  it('onSend 抛错时应 catch 并 rethrow', async () => {
    const params = createDefaultParams();
    const err = new Error('send failed');
    params.props.onSend = vi.fn().mockRejectedValue(err);
    params.markdownEditorRef.current!.store.getMDContent.mockReturnValue('hi');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useSendHandler(params));
    await expect(result.current.sendMessage()).rejects.toThrow('send failed');
    expect(consoleSpy).toHaveBeenCalledWith('Send message failed:', err);
    consoleSpy.mockRestore();
  });

  it('正常发送时应调用 onSend、clearContent、setValue、setFileMap', async () => {
    const params = createDefaultParams();
    params.props.onSend = vi.fn().mockResolvedValue(undefined);
    params.props.onChange = vi.fn();
    params.markdownEditorRef.current!.store.getMDContent.mockReturnValue(
      'content',
    );
    const { result } = renderHook(() => useSendHandler(params));
    await result.current.sendMessage();
    expect(params.props.onSend).toHaveBeenCalledWith('content');
    expect(
      params.markdownEditorRef.current!.store.clearContent,
    ).toHaveBeenCalled();
    expect(params.setValue).toHaveBeenCalledWith('');
    expect(params.setFileMap).toHaveBeenCalledWith(new Map());
  });

  it('recording 为 true 时应先调用 stopRecording 再继续', async () => {
    const params = createDefaultParams({ recording: true });
    params.props.onSend = vi.fn().mockResolvedValue(undefined);
    params.markdownEditorRef.current!.store.getMDContent.mockReturnValue('hi');
    const { result } = renderHook(() => useSendHandler(params));
    await result.current.sendMessage();
    expect(params.stopRecording).toHaveBeenCalled();
    expect(params.props.onSend).toHaveBeenCalledWith('hi');
  });
});
