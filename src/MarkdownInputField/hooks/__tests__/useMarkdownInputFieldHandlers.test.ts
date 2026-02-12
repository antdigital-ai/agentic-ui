/**
 * useMarkdownInputFieldHandlers Hook 单元测试
 * 覆盖 sendMessage / handlePaste / handleKeyDown 等分支
 */

import { renderHook } from '@testing-library/react';
import { createEditor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMarkdownInputFieldHandlers } from '../useMarkdownInputFieldHandlers';

vi.mock('../../../../Hooks/useRefFunction', () => ({ useRefFunction: (fn: any) => fn }));

const mockUpLoadFileToServer = vi.fn();
vi.mock('../../AttachmentButton', () => ({
  upLoadFileToServer: (...args: any[]) => mockUpLoadFileToServer(...args),
}));

const mockGetFileListFromDataTransferItems = vi.fn();
vi.mock('../../FilePaste', () => ({
  getFileListFromDataTransferItems: (...args: any[]) =>
    mockGetFileListFromDataTransferItems(...args),
}));

const mockIsMobileDevice = vi.fn();
vi.mock('../../AttachmentButton/utils', () => ({
  isMobileDevice: () => mockIsMobileDevice(),
}));

function createMockEditor() {
  const editor = createEditor();
  editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
  return editor;
}

function createDefaultParams(overrides: Record<string, any> = {}) {
  const store = {
    getMDContent: vi.fn().mockReturnValue(''),
    clearContent: vi.fn(),
    inputComposition: false,
  };
  const editor = createMockEditor();
  const markdownEditorRef = {
    current: {
      store,
      markdownEditorRef: { current: editor },
    },
  };
  const inputRef = { current: document.createElement('div') };
  const isSendingRef = { current: false };
  const setValue = vi.fn();
  const setFileMap = vi.fn();
  const setIsLoading = vi.fn();
  const setIsEnlarged = vi.fn();

  return {
    props: {
      disabled: false,
      typing: false,
      onChange: undefined as any,
      onSend: undefined as any,
      allowEmptySubmit: false,
      markdownProps: undefined as any,
      attachment: undefined as any,
      triggerSendKey: undefined as any,
    },
    markdownEditorRef,
    inputRef,
    isSendingRef,
    isLoading: false,
    setIsLoading,
    value: '',
    setValue,
    fileMap: new Map(),
    setFileMap,
    recording: false,
    stopRecording: vi.fn().mockResolvedValue(undefined),
    isEnlarged: false,
    setIsEnlarged,
    ...overrides,
  };
}

describe('useMarkdownInputFieldHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobileDevice.mockReturnValue(false);
  });

  describe('sendMessage', () => {
    it('disabled 为 true 时直接 return', async () => {
      const params = createDefaultParams();
      params.props.disabled = true;
      params.props.onSend = vi.fn();
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      await result.current.sendMessage();
      expect(params.props.onSend).not.toHaveBeenCalled();
    });

    it('typing 为 true 时直接 return', async () => {
      const params = createDefaultParams();
      params.props.typing = true;
      params.props.onSend = vi.fn();
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      await result.current.sendMessage();
      expect(params.props.onSend).not.toHaveBeenCalled();
    });

    it('isLoading 为 true 时直接 return', async () => {
      const params = createDefaultParams();
      params.isLoading = true;
      params.props.onSend = vi.fn();
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      await result.current.sendMessage();
      expect(params.props.onSend).not.toHaveBeenCalled();
    });

    it('onSend 抛错时应 catch 并 rethrow', async () => {
      const params = createDefaultParams();
      const err = new Error('send failed');
      params.props.onSend = vi.fn().mockRejectedValue(err);
      params.markdownEditorRef.current!.store.getMDContent.mockReturnValue('hi');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      await expect(result.current.sendMessage()).rejects.toThrow('send failed');
      expect(consoleSpy).toHaveBeenCalledWith('Send message failed:', err);
      consoleSpy.mockRestore();
    });

    it('正常发送时应调用 onSend、clearContent、setValue、setFileMap', async () => {
      const params = createDefaultParams();
      params.props.onSend = vi.fn().mockResolvedValue(undefined);
      params.props.onChange = vi.fn();
      params.markdownEditorRef.current!.store.getMDContent.mockReturnValue('content');
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      await result.current.sendMessage();
      expect(params.props.onSend).toHaveBeenCalledWith('content');
      expect(params.markdownEditorRef.current!.store.clearContent).toHaveBeenCalled();
      expect(params.setValue).toHaveBeenCalledWith('');
      expect(params.setFileMap).toHaveBeenCalledWith(new Map());
    });
  });

  describe('handlePaste', () => {
    it('使用 markdownProps.attachment 当 props.attachment 为空', async () => {
      const params = createDefaultParams();
      params.props.attachment = undefined;
      params.props.markdownProps = { attachment: { upload: vi.fn() } };
      mockGetFileListFromDataTransferItems.mockResolvedValue([
        { type: 'image/png', name: 'a.png' },
      ]);
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      const e = { clipboardData: { items: [] } } as any;
      await result.current.handlePaste(e);
      expect(mockGetFileListFromDataTransferItems).toHaveBeenCalledWith(e);
      expect(mockUpLoadFileToServer).toHaveBeenCalled();
    });

    it('无 upload 且无 uploadWithResponse 时直接 return', async () => {
      const params = createDefaultParams();
      params.props.attachment = {};
      params.props.markdownProps = undefined;
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      await result.current.handlePaste({ clipboardData: { items: [] } } as any);
      expect(mockUpLoadFileToServer).not.toHaveBeenCalled();
    });

    it('粘贴内容中无图片时直接 return', async () => {
      const params = createDefaultParams();
      params.props.attachment = { upload: vi.fn() };
      mockGetFileListFromDataTransferItems.mockResolvedValue([
        { type: 'text/plain', name: 'a.txt' },
      ]);
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      await result.current.handlePaste({ clipboardData: { items: [] } } as any);
      expect(mockUpLoadFileToServer).not.toHaveBeenCalled();
    });

    it('粘贴含图片时调用 upLoadFileToServer', async () => {
      const params = createDefaultParams();
      params.props.attachment = { upload: vi.fn() };
      mockGetFileListFromDataTransferItems.mockResolvedValue([
        { type: 'image/png', name: 'p.png' },
      ]);
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      const e = { clipboardData: { items: [] } } as any;
      await result.current.handlePaste(e);
      expect(mockUpLoadFileToServer).toHaveBeenCalledWith(
        [{ type: 'image/png', name: 'p.png' }],
        expect.objectContaining({
          upload: expect.any(Function),
          fileMap: params.fileMap,
          onFileMapChange: params.setFileMap,
        }),
      );
    });
  });

  describe('handleKeyDown', () => {
    it('inputComposition 为 true 时直接 return', () => {
      const params = createDefaultParams();
      (params.markdownEditorRef.current!.store as any).inputComposition = true;
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      const e = {
        key: 'Enter',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        nativeEvent: { isComposing: false },
      } as any;
      result.current.handleKeyDown(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('isComposing 为 true 时直接 return', () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      const e = {
        key: 'Enter',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        nativeEvent: { isComposing: true },
      } as any;
      result.current.handleKeyDown(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('Home 键应 preventDefault 并 Transforms.select 到文档开头', () => {
      const params = createDefaultParams();
      const selectSpy = vi.spyOn(Transforms, 'select');
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      const e = {
        key: 'Home',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        nativeEvent: { isComposing: false },
      } as any;
      result.current.handleKeyDown(e);
      expect(e.preventDefault).toHaveBeenCalled();
      expect(e.stopPropagation).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
      selectSpy.mockRestore();
    });

    it('End 键应 preventDefault 并 Transforms.select 到文档末尾', () => {
      const params = createDefaultParams();
      const selectSpy = vi.spyOn(Transforms, 'select');
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      const e = {
        key: 'End',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        nativeEvent: { isComposing: false },
      } as any;
      result.current.handleKeyDown(e);
      expect(e.preventDefault).toHaveBeenCalled();
      expect(e.stopPropagation).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
      selectSpy.mockRestore();
    });

    it('triggerSendKey 为 Mod+Enter 时 Ctrl+Enter 触发 sendMessage', async () => {
      const params = createDefaultParams();
      params.props.triggerSendKey = 'Mod+Enter';
      params.props.onSend = vi.fn().mockResolvedValue(undefined);
      params.markdownEditorRef.current!.store.getMDContent.mockReturnValue('content');
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      const e = {
        key: 'Enter',
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        nativeEvent: { isComposing: false },
      } as any;
      result.current.handleKeyDown(e);
      expect(e.preventDefault).toHaveBeenCalled();
      expect(e.stopPropagation).toHaveBeenCalled();
      await vi.waitFor(() => {
        expect(params.props.onSend).toHaveBeenCalled();
      });
    });

    it('移动端时 effectiveTriggerKey 为 Mod+Enter，Ctrl+Enter 触发发送', async () => {
      mockIsMobileDevice.mockReturnValue(true);
      const params = createDefaultParams();
      params.props.onSend = vi.fn().mockResolvedValue(undefined);
      params.markdownEditorRef.current!.store.getMDContent.mockReturnValue('text');
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      const e = {
        key: 'Enter',
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        nativeEvent: { isComposing: false },
      } as any;
      result.current.handleKeyDown(e);
      await vi.waitFor(() => {
        expect(params.props.onSend).toHaveBeenCalled();
      });
    });
  });

  describe('activeInput', () => {
    it('active 为 true 时设置 tabIndex 和 active 类', () => {
      const params = createDefaultParams();
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      result.current.activeInput(true);
      expect(params.inputRef.current?.tabIndex).toBe(1);
      expect(params.inputRef.current?.classList.contains('active')).toBe(true);
    });

    it('active 为 false 时移除 active 类', () => {
      const params = createDefaultParams();
      params.inputRef.current?.classList.add('active');
      const { result } = renderHook(() => useMarkdownInputFieldHandlers(params));
      result.current.activeInput(false);
      expect(params.inputRef.current?.tabIndex).toBe(-1);
      expect(params.inputRef.current?.classList.contains('active')).toBe(false);
    });
  });
});
