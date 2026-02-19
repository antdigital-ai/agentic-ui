/**
 * useCodeEditorState Hook 测试
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCodeEditorState } from '../../../../src/Plugins/code/hooks/useCodeEditorState';

const mockSetNodes = vi.fn();
vi.mock('slate', () => ({
  Transforms: {
    setNodes: (...args: unknown[]) => mockSetNodes(...args),
  },
}));

const mockIsFocused = vi.fn(() => false);
vi.mock('slate-react', () => ({
  ReactEditor: {
    isFocused: (ed: unknown) => mockIsFocused(ed),
  },
}));

const mockStore = { editor: {} };
const mockMarkdownEditorRef = { current: null as unknown as HTMLElement };
vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: mockStore,
    markdownEditorRef: mockMarkdownEditorRef,
  }),
}));

const mockUseSelStatus = vi.fn(() => [false, [0, 0]]);
vi.mock('../../../../src/MarkdownEditor/hooks/editor', () => ({
  useSelStatus: (el: unknown) => mockUseSelStatus(el),
}));

describe('useCodeEditorState', () => {
  const defaultElement = {
    type: 'code',
    language: 'javascript',
    value: 'const x = 1;',
    children: [{ text: '' }],
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelStatus.mockReturnValue([false, [0, 0]]);
    mockIsFocused.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应返回初始 state 和 handlers', () => {
    const { result } = renderHook(() => useCodeEditorState(defaultElement));
    expect(result.current.state).toEqual({
      showBorder: false,
      htmlStr: '',
      hide: false,
      lang: 'javascript',
    });
    expect(result.current.update).toBeDefined();
    expect(result.current.handleCloseClick).toBeDefined();
    expect(result.current.handleRunHtml).toBeDefined();
    expect(result.current.handleHtmlPreviewClose).toBeDefined();
    expect(result.current.handleShowBorderChange).toBeDefined();
    expect(result.current.handleHideChange).toBeDefined();
  });

  it('update 应调用 Transforms.setNodes', () => {
    const { result } = renderHook(() => useCodeEditorState(defaultElement));
    act(() => {
      result.current.update({ language: 'typescript' });
    });
    expect(mockSetNodes).toHaveBeenCalledWith(
      mockStore.editor,
      { language: 'typescript' },
      { at: [0, 0] },
    );
  });

  it('selected 且 focus 时设置 showBorder，取消选中时清除', () => {
    mockIsFocused.mockReturnValue(true);
    mockUseSelStatus.mockReturnValue([true, [0, 0]]);

    const { result, rerender } = renderHook(() =>
      useCodeEditorState(defaultElement),
    );
    act(() => {
      rerender();
    });
    expect(result.current.state.showBorder).toBe(true);

    mockUseSelStatus.mockReturnValue([false, [0, 0]]);
    act(() => {
      rerender();
    });
    expect(result.current.state.showBorder).toBe(false);
  });

  it('handleCloseClick 应设置 hide 为 false', () => {
    const { result } = renderHook(() => useCodeEditorState(defaultElement));
    act(() => {
      result.current.handleHideChange(true);
    });
    expect(result.current.state.hide).toBe(true);
    act(() => {
      result.current.handleCloseClick();
    });
    expect(result.current.state.hide).toBe(false);
  });

  it('handleRunHtml 应设置 htmlStr 为 element.value', () => {
    const { result } = renderHook(() => useCodeEditorState(defaultElement));
    act(() => {
      result.current.handleRunHtml();
    });
    expect(result.current.state.htmlStr).toBe('const x = 1;');
  });

  it('handleRunHtml 在 element.value 为空时设置空字符串', () => {
    const el = { ...defaultElement, value: undefined };
    const { result } = renderHook(() => useCodeEditorState(el));
    act(() => {
      result.current.handleRunHtml();
    });
    expect(result.current.state.htmlStr).toBe('');
  });

  it('handleHtmlPreviewClose 应清空 htmlStr', () => {
    const { result } = renderHook(() => useCodeEditorState(defaultElement));
    act(() => {
      result.current.handleRunHtml();
    });
    expect(result.current.state.htmlStr).toBe('const x = 1;');
    act(() => {
      result.current.handleHtmlPreviewClose();
    });
    expect(result.current.state.htmlStr).toBe('');
  });

  it('handleShowBorderChange 应更新 showBorder', () => {
    const { result } = renderHook(() => useCodeEditorState(defaultElement));
    act(() => {
      result.current.handleShowBorderChange(true);
    });
    expect(result.current.state.showBorder).toBe(true);
    act(() => {
      result.current.handleShowBorderChange(false);
    });
    expect(result.current.state.showBorder).toBe(false);
  });

  it('handleHideChange 应更新 hide', () => {
    const { result } = renderHook(() => useCodeEditorState(defaultElement));
    act(() => {
      result.current.handleHideChange(true);
    });
    expect(result.current.state.hide).toBe(true);
    act(() => {
      result.current.handleHideChange(false);
    });
    expect(result.current.state.hide).toBe(false);
  });
});
