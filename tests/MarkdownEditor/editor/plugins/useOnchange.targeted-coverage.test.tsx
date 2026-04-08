import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Editor } from 'slate';
import { useOnchange } from '../../../../src/MarkdownEditor/editor/plugins/useOnchange';

const mockCancel = vi.fn();
const mockRun = vi.fn();
const mockSetRefreshFloatBar = vi.fn();
const mockSetDomRect = vi.fn();
const mockParser = vi.fn(() => 'mock-md');

const storeState = {
  readonly: false,
  refreshFloatBar: false,
  setRefreshFloatBar: mockSetRefreshFloatBar,
  setDomRect: mockSetDomRect,
};

vi.mock('@ant-design/pro-components', () => ({
  useDebounceFn: (fn: any) => ({
    cancel: mockCancel,
    run: (...args: any[]) => {
      mockRun(...args);
      return fn(...args);
    },
  }),
}));

vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => storeState,
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils', () => ({
  parserSlateNodeToMarkdown: (...args: any[]) => mockParser(...args),
}));

describe('useOnchange targeted coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storeState.readonly = false;
    storeState.refreshFloatBar = false;
    mockCancel.mockReset();
    mockRun.mockReset();
    mockSetRefreshFloatBar.mockReset();
    mockSetDomRect.mockReset();
    mockParser.mockClear();
    Object.defineProperty(window, 'getSelection', {
      configurable: true,
      value: vi.fn(() => null),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createEditor(selection?: any) {
    return {
      children: [{ type: 'paragraph', children: [{ text: 'A' }] }],
      selection:
        selection ??
        ({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        } as any),
    } as any;
  }

  function mockNodes(nodeType = 'paragraph') {
    return vi.spyOn(Editor, 'nodes').mockImplementation((_, opts: any) => {
      opts?.match?.({ type: nodeType });
      return [[{ type: nodeType }, [0, 0]]] as any;
    });
  }

  it('覆盖 onChangeDebounce: 无 onChange 时直接 return（39）', () => {
    const editor = createEditor();
    const nodesSpy = mockNodes();
    const { result } = renderHook(() => useOnchange(editor));
    result.current(editor.children, [{ type: 'insert_text' } as any]);
    expect(mockCancel).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
    expect(nodesSpy).toHaveBeenCalled();
  });

  it('覆盖 onChangeDebounce: 有 onChange 时回调 markdown（40）', () => {
    const onChange = vi.fn();
    const editor = createEditor();
    mockNodes();
    const { result } = renderHook(() => useOnchange(editor, onChange));
    result.current(editor.children, [{ type: 'insert_text' } as any]);
    expect(onChange).toHaveBeenCalledWith('mock-md', editor.children);
  });

  it('覆盖 readonly + set_selection 的早退（49-50）', () => {
    storeState.readonly = true;
    const editor = createEditor();
    const nodesSpy = vi.spyOn(Editor, 'nodes');
    const { result } = renderHook(() => useOnchange(editor));
    result.current(editor.children, [{ type: 'set_selection' } as any]);
    expect(nodesSpy).not.toHaveBeenCalled();
  });

  it('覆盖节点查询、双 setTimeout 推送与基础分支（64,75-76）', () => {
    const editor = createEditor();
    mockNodes('paragraph');
    const { result } = renderHook(() => useOnchange(editor));
    result.current(editor.children, [{ type: 'insert_text' } as any]);
    vi.runAllTimers();
    expect(mockSetDomRect).toHaveBeenCalledWith(null);
  });

  it('覆盖 domRange 空内容 early return（93）', () => {
    const editor = createEditor({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });
    mockNodes('paragraph');
    Object.defineProperty(window, 'getSelection', {
      configurable: true,
      value: vi.fn(() => ({
        getRangeAt: () => ({
          toString: () => '   ',
        }),
      })),
    });
    const { result } = renderHook(() => useOnchange(editor));
    result.current(editor.children, [{ type: 'set_selection' } as any]);
    expect(mockSetDomRect).not.toHaveBeenCalled();
  });

  it('覆盖 domRange 相同文本刷新浮条与 rect 为 null 分支（94-96,98-103）', () => {
    const editor = createEditor({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });
    mockNodes('paragraph');
    const rect = { top: 1, left: 2 } as any;
    const getRangeAt = vi
      .fn()
      .mockReturnValueOnce({
        toString: () => 'same-content',
        getBoundingClientRect: () => rect,
      })
      .mockReturnValueOnce({
        toString: () => 'same-content',
        getBoundingClientRect: () => null,
      });
    Object.defineProperty(window, 'getSelection', {
      configurable: true,
      value: vi.fn(() => ({ getRangeAt })),
    });
    const { result } = renderHook(() => useOnchange(editor));
    result.current(editor.children, [{ type: 'set_selection' } as any]);
    result.current(editor.children, [{ type: 'set_selection' } as any]);
    expect(mockSetDomRect).toHaveBeenCalledWith(rect);
    expect(mockSetRefreshFloatBar).toHaveBeenCalled();
  });

  it('覆盖 domRange 有文本但无 rect 时 setDomRect(null)（103）', () => {
    const editor = createEditor({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    });
    mockNodes('paragraph');
    Object.defineProperty(window, 'getSelection', {
      configurable: true,
      value: vi.fn(() => ({
        getRangeAt: () => ({
          toString: () => 'new-content',
          getBoundingClientRect: () => null,
        }),
      })),
    });
    const { result } = renderHook(() => useOnchange(editor));
    result.current(editor.children, [{ type: 'set_selection' } as any]);
    expect(mockSetDomRect).toHaveBeenCalledWith(null);
  });

  it('覆盖 else 分支重置 rangeContent 与 setDomRect(null)（106-107）', () => {
    const editor = createEditor({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    mockNodes('code');
    const { result } = renderHook(() => useOnchange(editor));
    result.current(editor.children, [{ type: 'set_selection' } as any]);
    expect(mockSetDomRect).toHaveBeenCalledWith(null);
  });
});

