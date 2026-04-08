/**
 * useToolBarLogic 钩子测试
 */

import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useToolBarLogic,
  UseToolBarLogicProps,
} from '../../../../../../src/MarkdownEditor/editor/tools/ToolBar/hooks/useToolBarLogic';

const mockKeyTaskNext = vi.fn();
const mockOpenInsertLinkNext = vi.fn();
const mockSetDomRect = vi.fn();
const mockGetMDContent = vi.fn();
const mockSetMDContent = vi.fn();

const mockEditor = {
  selection: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 5 },
  },
  children: [],
};

const defaultProps: UseToolBarLogicProps = {
  markdownEditorRef: { current: mockEditor as any },
  keyTask$: { next: mockKeyTaskNext },
  store: {
    getMDContent: mockGetMDContent,
    setMDContent: mockSetMDContent,
  },
  openInsertLink$: { next: mockOpenInsertLinkNext },
  setDomRect: mockSetDomRect,
  refreshFloatBar: {},
  domRect: null,
};

vi.mock('../../../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    isFormatActive: vi.fn(),
    clearMarks: vi.fn(),
    highColor: vi.fn(),
    toggleFormat: vi.fn(),
  },
}));

const mockGetSelRect = vi.fn(() => ({ top: 0, left: 0, width: 100, height: 20 }));
vi.mock('../../../../../../src/MarkdownEditor/editor/utils/dom', () => ({
  getSelRect: (...args: any[]) => mockGetSelRect(...args),
}));

vi.mock('../../../../../../src/MarkdownEditor/Plugins/formatter', () => ({
  MarkdownFormatter: {
    format: vi.fn((x: string) => `formatted:${x}`),
  },
}));

const mockEditorNodes = vi.fn();
const mockNodeString = vi.fn();
const mockTransformsInsertText = vi.fn();
const mockTransformsSelect = vi.fn();

vi.mock('slate', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Editor: {
      ...actual.Editor,
      nodes: (...args: any[]) => mockEditorNodes(...args),
    },
    Node: {
      ...actual.Node,
      string: (...args: any[]) => mockNodeString(...args),
    },
    Transforms: {
      ...actual.Transforms,
      insertText: (...args: any[]) => mockTransformsInsertText(...args),
      select: (...args: any[]) => mockTransformsSelect(...args),
    },
  };
});

const EditorUtils = await import('../../../../../../src/MarkdownEditor/editor/utils/editorUtils').then(
  (m) => m.EditorUtils,
);

describe('useToolBarLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEditorNodes.mockReturnValue([[{ type: 'paragraph', children: [{ text: 'hi' }] }, [0, 0]]]);
    vi.mocked(EditorUtils.isFormatActive).mockReturnValue(false);
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn(() => ({ matches: true })),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应返回所有 handlers 和状态', () => {
    const { result } = renderHook(() => useToolBarLogic(defaultProps));

    expect(result.current.currentNode).toBeDefined();
    expect(result.current.highColor).toBeNull();
    expect(result.current.isCodeNode).toBeDefined();
    expect(result.current.isFormatActive).toBeDefined();
    expect(result.current.isHighColorActive).toBeDefined();
    expect(result.current.isLinkActive).toBeDefined();
    expect(result.current.handleUndo).toBeDefined();
    expect(result.current.handleRedo).toBeDefined();
    expect(result.current.handleClearFormat).toBeDefined();
    expect(result.current.handleFormat).toBeDefined();
    expect(result.current.handleHeadingChange).toBeDefined();
    expect(result.current.handleColorChange).toBeDefined();
    expect(result.current.handleToggleHighColor).toBeDefined();
    expect(result.current.handleToolClick).toBeDefined();
    expect(result.current.handleInsertLink).toBeDefined();
    expect(result.current.handleInsert).toBeDefined();
  });

  it('markdownEditorRef.current 为空时 currentNode 为 null', () => {
    const props = { ...defaultProps, markdownEditorRef: { current: null } };
    const { result } = renderHook(() => useToolBarLogic(props));
    expect(result.current.currentNode).toBeNull();
  });

  it('markdownEditorRef.current 存在时 currentNode 来自 Editor.nodes', () => {
    const nodeEntry = [{ type: 'paragraph', children: [{ text: '' }] }, [0, 0] as any];
    mockEditorNodes.mockReturnValue([nodeEntry]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    expect(result.current.currentNode).toEqual(nodeEntry);
    expect(mockEditorNodes).toHaveBeenCalled();
  });

  it('isCodeNode 在节点为 code 时返回 true', () => {
    mockEditorNodes.mockReturnValue([[{ type: 'code', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    expect(result.current.isCodeNode()).toBe(true);
  });

  it('isCodeNode 在节点非 code 时返回 false', () => {
    mockEditorNodes.mockReturnValue([[{ type: 'paragraph', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    expect(result.current.isCodeNode()).toBe(false);
  });

  it('markdownEditorRef.current 为空时 isCodeNode 返回 false', () => {
    const props = { ...defaultProps, markdownEditorRef: { current: null } };
    const { result } = renderHook(() => useToolBarLogic(props));
    expect(result.current.isCodeNode()).toBe(false);
  });

  it('isFormatActive 委托 EditorUtils.isFormatActive', () => {
    vi.mocked(EditorUtils.isFormatActive).mockReturnValue(true);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    expect(result.current.isFormatActive('bold')).toBe(true);
    expect(EditorUtils.isFormatActive).toHaveBeenCalledWith(mockEditor, 'bold');
  });

  it('handleUndo 调用 keyTask$.next', () => {
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleUndo();
    });
    expect(mockKeyTaskNext).toHaveBeenCalledWith({ key: 'undo', args: [] });
  });

  it('handleRedo 调用 keyTask$.next', () => {
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleRedo();
    });
    expect(mockKeyTaskNext).toHaveBeenCalledWith({ key: 'redo', args: [] });
  });

  it('handleClearFormat 在非 code 节点时调用 clearMarks 和 highColor', () => {
    mockEditorNodes.mockReturnValue([[{ type: 'paragraph', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleClearFormat();
    });
    expect(EditorUtils.clearMarks).toHaveBeenCalledWith(mockEditor, true);
    expect(EditorUtils.highColor).toHaveBeenCalledWith(mockEditor);
  });

  it('handleClearFormat 在 code 节点时不执行', () => {
    mockEditorNodes.mockReturnValue([[{ type: 'code', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleClearFormat();
    });
    expect(EditorUtils.clearMarks).not.toHaveBeenCalled();
  });

  it('handleFormat 无 editor 时不执行', () => {
    const props = { ...defaultProps, markdownEditorRef: { current: null } };
    const { result } = renderHook(() => useToolBarLogic(props));
    act(() => {
      result.current.handleFormat();
    });
    expect(mockEditorNodes).not.toHaveBeenCalled();
  });

  it('handleFormat 有 editor 但无文本节点时不进入 if(node)', () => {
    const elemEntry = [{ type: 'paragraph', children: [{ text: '' }] }, [0, 0] as any];
    let callCount = 0;
    mockEditorNodes.mockImplementation(() => {
      callCount += 1;
      return callCount === 1 ? [elemEntry] : [];
    });
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleFormat();
    });
    expect(mockGetMDContent).not.toHaveBeenCalled();
    expect(mockTransformsInsertText).not.toHaveBeenCalled();
  });

  it('handleFormat 有文本节点且 content 全空时走 store.getMDContent 分支', () => {
    const textNodeEntry = [{ text: '   ' }, [0, 0] as any];
    mockEditorNodes.mockReturnValue([textNodeEntry]);
    mockNodeString.mockReturnValue('   ');
    mockGetMDContent.mockReturnValue('# doc');
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleFormat();
    });
    expect(mockGetMDContent).toHaveBeenCalled();
    expect(mockSetMDContent).toHaveBeenCalledWith(expect.any(String));
  });

  it('handleFormat 有文本节点且 content 非空时 format 并 Transforms.insertText/select', () => {
    const textNodeEntry = [{ text: 'hello' }, [0, 0] as any];
    mockEditorNodes.mockReturnValue([textNodeEntry]);
    mockNodeString.mockReturnValue('hello');
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleFormat();
    });
    expect(mockTransformsInsertText).toHaveBeenCalled();
    expect(mockTransformsSelect).toHaveBeenCalled();
  });

  it('handleFormat 有文本节点非空但无 selection 时不 Transforms', () => {
    const editorNoSel = { ...mockEditor, selection: null };
    const props = { ...defaultProps, markdownEditorRef: { current: editorNoSel as any } };
    const textNodeEntry = [{ text: 'x' }, [0, 0] as any];
    mockEditorNodes.mockReturnValue([textNodeEntry]);
    mockNodeString.mockReturnValue('x');
    const { result } = renderHook(() => useToolBarLogic(props));
    act(() => {
      result.current.handleFormat();
    });
    expect(mockTransformsInsertText).not.toHaveBeenCalled();
  });

    it('handleFormat 有节点但 content 空且 store.getMDContent 空时不调用 setMDContent', () => {
      const textNodeEntry = [{ text: '' }, [0, 0] as any];
      mockEditorNodes.mockReturnValue([textNodeEntry]);
    mockNodeString.mockReturnValue('');
    mockGetMDContent.mockReturnValue(null);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleFormat();
    });
    expect(mockSetMDContent).not.toHaveBeenCalled();
  });

  it('handleHeadingChange 调用 keyTask$.next', () => {
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleHeadingChange(2);
    });
    expect(mockKeyTaskNext).toHaveBeenCalledWith({ key: 'head', args: [2] });
  });

  it('handleColorChange 在非 code 节点时设置 highColor 并刷新', () => {
    mockEditorNodes.mockReturnValue([[{ type: 'paragraph', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleColorChange('#ff0000');
    });
    expect(EditorUtils.highColor).toHaveBeenCalledWith(mockEditor, '#ff0000');
    expect(result.current.highColor).toBe('#ff0000');
  });

  it('handleColorChange 在 code 节点时不执行', () => {
    mockEditorNodes.mockReturnValue([[{ type: 'code', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleColorChange('#ff0000');
    });
    expect(EditorUtils.highColor).not.toHaveBeenCalled();
  });

  it('handleToggleHighColor 当 highColor 已激活时只调 highColor()', () => {
    vi.mocked(EditorUtils.isFormatActive).mockReturnValue(true);
    mockEditorNodes.mockReturnValue([[{ type: 'paragraph', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleToggleHighColor();
    });
    expect(EditorUtils.highColor).toHaveBeenCalledWith(mockEditor);
    expect(EditorUtils.highColor).not.toHaveBeenCalledWith(mockEditor, expect.any(String));
  });

  it('handleToggleHighColor 当 highColor 未激活时传默认色或当前 highColor', () => {
    vi.mocked(EditorUtils.isFormatActive).mockReturnValue(false);
    mockEditorNodes.mockReturnValue([[{ type: 'paragraph', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleToggleHighColor();
    });
    expect(EditorUtils.highColor).toHaveBeenCalledWith(mockEditor, '#10b981');
  });

  it('handleToggleHighColor 使用已有 highColor 状态', () => {
    vi.mocked(EditorUtils.isFormatActive).mockReturnValue(false);
    mockEditorNodes.mockReturnValue([[{ type: 'paragraph', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleColorChange('#abc');
    });
    act(() => {
      result.current.handleToggleHighColor();
    });
    expect(EditorUtils.highColor).toHaveBeenCalledWith(mockEditor, '#abc');
  });

  it('handleToolClick 有 tool.onClick 时调用 onClick', () => {
    const onClick = vi.fn();
    mockEditorNodes.mockReturnValue([[{ type: 'paragraph', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleToolClick({ type: 'custom', onClick });
    });
    expect(onClick).toHaveBeenCalledWith(mockEditor);
  });

  it('handleToolClick 无 onClick 时调用 EditorUtils.toggleFormat', () => {
    mockEditorNodes.mockReturnValue([[{ type: 'paragraph', children: [{ text: '' }] }, [0, 0]]]);
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleToolClick({ type: 'bold' });
    });
    expect(EditorUtils.toggleFormat).toHaveBeenCalledWith(mockEditor, 'bold');
  });

  it('handleToolClick 在 code 节点时不执行', () => {
    mockEditorNodes.mockReturnValue([[{ type: 'code', children: [{ text: '' }] }, [0, 0]]]);
    const onClick = vi.fn();
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleToolClick({ type: 'custom', onClick });
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('handleInsertLink 无 selection 时不执行', () => {
    const editorWithoutSel = { ...mockEditor, selection: null };
    const props = { ...defaultProps, markdownEditorRef: { current: editorWithoutSel as any } };
    const { result } = renderHook(() => useToolBarLogic(props));
    act(() => {
      result.current.handleInsertLink();
    });
    expect(mockSetDomRect).not.toHaveBeenCalled();
    expect(mockOpenInsertLinkNext).not.toHaveBeenCalled();
  });

    it('handleInsertLink 有 selection 时 setDomRect 并 openInsertLink$.next', () => {
      const { result } = renderHook(() => useToolBarLogic(defaultProps));
      act(() => {
        result.current.handleInsertLink();
      });
      expect(mockSetDomRect).toHaveBeenCalled();
      expect(mockGetSelRect).toHaveBeenCalled();
      expect(mockOpenInsertLinkNext).toHaveBeenCalledWith(mockEditor.selection);
    });

    it('handleInsertLink 在 window.matchMedia 未定义时不调用 openInsertLink$.next', () => {
      const originalMatchMedia = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', { value: undefined, configurable: true });
      const { result } = renderHook(() => useToolBarLogic(defaultProps));
      act(() => {
        result.current.handleInsertLink();
      });
      expect(mockSetDomRect).toHaveBeenCalled();
      expect(mockOpenInsertLinkNext).not.toHaveBeenCalled();
      Object.defineProperty(window, 'matchMedia', { value: originalMatchMedia, configurable: true });
    });

  it('handleInsert 有 op 时调用 keyTask$.next', () => {
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleInsert({ task: 'image', args: ['url'] });
    });
    expect(mockKeyTaskNext).toHaveBeenCalledWith({ key: 'image', args: ['url'] });
  });

  it('handleInsert op 为空时不调用', () => {
    const { result } = renderHook(() => useToolBarLogic(defaultProps));
    act(() => {
      result.current.handleInsert(null);
    });
    act(() => {
      result.current.handleInsert(undefined);
    });
    expect(mockKeyTaskNext).not.toHaveBeenCalled();
  });

  it('refreshFloatBar/domRect 变化时触发刷新', () => {
    const { result, rerender } = renderHook(
      (props: UseToolBarLogicProps) => useToolBarLogic(props),
      { initialProps: defaultProps },
    );
    const nodeBefore = result.current.currentNode;
    rerender({ ...defaultProps, domRect: new DOMRect(0, 0, 1, 1) });
    expect(result.current.currentNode).toBeDefined();
  });
});
