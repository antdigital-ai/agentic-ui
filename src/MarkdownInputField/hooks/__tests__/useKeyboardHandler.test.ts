/**
 * useKeyboardHandler Hook 单元测试
 * 由原 useMarkdownInputFieldHandlers.test.ts 中 handleKeyDown 段拆分而来。
 */

import { renderHook } from '@testing-library/react';
import { createEditor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  markImeEnterCommitGuard,
  resetImeEnterCommitGuardForTests,
} from '../../../MarkdownEditor/editor/utils/isImeComposing';
import { useKeyboardHandler } from '../useKeyboardHandler';

vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

const mockIsMobileDevice = vi.fn();
vi.mock('../../AttachmentButton/utils', () => ({
  isMobileDevice: () => mockIsMobileDevice(),
}));

function createMockEditor() {
  const editor = createEditor();
  editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }] as any;
  return editor;
}

function createDefaultParams(overrides: Record<string, any> = {}) {
  const store = {
    inputComposition: false,
  };
  const editor = createMockEditor();
  const markdownEditorRef = {
    current: {
      store,
      markdownEditorRef: { current: editor },
    },
  } as any;
  return {
    props: {
      triggerSendKey: undefined as any,
      onSend: undefined as any,
    },
    markdownEditorRef,
    sendMessage: vi.fn(),
    ...overrides,
  };
}

describe('useKeyboardHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetImeEnterCommitGuardForTests();
    mockIsMobileDevice.mockReturnValue(false);
  });

  it('inputComposition 为 true 时直接 return', () => {
    const params = createDefaultParams();
    (params.markdownEditorRef.current!.store as any).inputComposition = true;
    const { result } = renderHook(() => useKeyboardHandler(params));
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
    expect(params.sendMessage).not.toHaveBeenCalled();
  });

  it('keyCode 229（IME）时直接 return', () => {
    const params = createDefaultParams();
    params.props.onSend = vi.fn();
    const { result } = renderHook(() => useKeyboardHandler(params));
    const e = {
      key: 'Enter',
      keyCode: 229,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: { isComposing: false },
    } as any;
    result.current.handleKeyDown(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(params.sendMessage).not.toHaveBeenCalled();
  });

  it('isComposing 为 true 时直接 return', () => {
    const params = createDefaultParams();
    const { result } = renderHook(() => useKeyboardHandler(params));
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
    expect(params.sendMessage).not.toHaveBeenCalled();
  });

  it('compositionend 后的 Enter 守卫窗口内不触发发送', () => {
    markImeEnterCommitGuard();
    const params = createDefaultParams();
    params.props.onSend = vi.fn();
    const { result } = renderHook(() => useKeyboardHandler(params));
    const e = {
      key: 'Enter',
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: { isComposing: false },
    } as any;

    try {
      result.current.handleKeyDown(e);
      expect(e.stopPropagation).toHaveBeenCalled();
      expect(e.preventDefault).not.toHaveBeenCalled();
      expect(params.sendMessage).not.toHaveBeenCalled();
    } finally {
      resetImeEnterCommitGuardForTests();
    }
  });

  it('Home 键应 preventDefault 并 Transforms.select 到文档开头', () => {
    const params = createDefaultParams();
    const selectSpy = vi.spyOn(Transforms, 'select');
    const { result } = renderHook(() => useKeyboardHandler(params));
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
    const { result } = renderHook(() => useKeyboardHandler(params));
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

  it('Ctrl+A 应 preventDefault 并选中全部', () => {
    const params = createDefaultParams();
    const selectSpy = vi.spyOn(Transforms, 'select');
    const { result } = renderHook(() => useKeyboardHandler(params));
    const e = {
      key: 'a',
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: { isComposing: false },
    } as any;
    result.current.handleKeyDown(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('代码块 textarea 聚焦时 Ctrl+A 不抢 Slate 全选', () => {
    const params = createDefaultParams();
    const selectSpy = vi.spyOn(Transforms, 'select');
    const { result } = renderHook(() => useKeyboardHandler(params));
    const wrap = document.createElement('div');
    wrap.setAttribute('data-be', 'code');
    const textarea = document.createElement('textarea');
    wrap.appendChild(textarea);
    const e = {
      key: 'a',
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      target: textarea,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: { isComposing: false },
    } as any;
    result.current.handleKeyDown(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(selectSpy).not.toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('triggerSendKey 默认（Enter）时纯 Enter 应触发 sendMessage', () => {
    const params = createDefaultParams();
    params.props.onSend = vi.fn();
    const { result } = renderHook(() => useKeyboardHandler(params));
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
    expect(e.preventDefault).toHaveBeenCalled();
    expect(params.sendMessage).toHaveBeenCalled();
  });

  it('triggerSendKey 为 Mod+Enter 时 Ctrl+Enter 触发 sendMessage', () => {
    const params = createDefaultParams();
    params.props.triggerSendKey = 'Mod+Enter';
    params.props.onSend = vi.fn();
    const { result } = renderHook(() => useKeyboardHandler(params));
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
    expect(params.sendMessage).toHaveBeenCalled();
  });

  it('triggerSendKey 为 Mod+Enter 时 Shift+Enter 不触发发送', () => {
    const params = createDefaultParams();
    params.props.triggerSendKey = 'Enter';
    params.props.onSend = vi.fn();
    const { result } = renderHook(() => useKeyboardHandler(params));
    const e = {
      key: 'Enter',
      ctrlKey: false,
      metaKey: false,
      shiftKey: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: { isComposing: false },
    } as any;
    result.current.handleKeyDown(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(params.sendMessage).not.toHaveBeenCalled();
  });

  it('移动端时强制 Mod+Enter，Ctrl+Enter 触发发送', () => {
    mockIsMobileDevice.mockReturnValue(true);
    const params = createDefaultParams();
    params.props.onSend = vi.fn();
    const { result } = renderHook(() => useKeyboardHandler(params));
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
    expect(params.sendMessage).toHaveBeenCalled();
  });
});
