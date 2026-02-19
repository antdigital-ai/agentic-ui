/**
 * @fileoverview AceEditor 覆盖率测试
 * 在非 test 环境下运行完整加载与初始化，覆盖 init effect、setupEditorEvents、handleKeyDown 等
 */

import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AceEditor } from '../../../../src/Plugins/code/components/AceEditor';

const eventHandlers: Record<string, ((...args: any[]) => void)[]> = {};
const pushHandler = (event: string, handler: (...args: any[]) => void) => {
  if (!eventHandlers[event]) eventHandlers[event] = [];
  eventHandlers[event].push(handler);
};
const invokeHandlers = (event: string) => {
  eventHandlers[event]?.forEach((h) => h());
};
const mockEditor = vi.hoisted(() => ({
  setTheme: vi.fn(),
  setValue: vi.fn(),
  getValue: vi.fn(() => ''),
  clearSelection: vi.fn(),
  destroy: vi.fn(),
  on: vi.fn((event: string, handler: (...args: any[]) => void) => {
    pushHandler(event, handler);
  }),
  off: vi.fn(),
  selection: {
    on: vi.fn((event: string, handler: (...args: any[]) => void) => {
      pushHandler(`selection.${event}`, handler);
    }),
    off: vi.fn(),
    clearSelection: vi.fn(),
  },
  session: {
    setMode: vi.fn(),
  },
  commands: {
    addCommand: vi.fn(),
  },
  getCursorPosition: vi.fn(() => ({ row: 0, column: 0 })),
  focus: vi.fn(),
}));

vi.mock('ace-builds', () => ({
  default: {
    edit: vi.fn((el: HTMLElement) => {
      const textarea = document.createElement('textarea');
      el.appendChild(textarea);
      return mockEditor;
    }),
    config: { set: vi.fn(), loadModule: vi.fn() },
  },
  Ace: {},
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils/ace', () => ({
  modeMap: new Map([
    ['ts', 'typescript'],
    ['js', 'javascript'],
  ]),
  getAceLangs: vi.fn(() =>
    Promise.resolve(new Set(['javascript', 'typescript', 'python', 'java', 'text'])),
  ),
}));

const mockTransforms = vi.hoisted(() => ({
  delete: vi.fn(),
  insertNodes: vi.fn(),
  select: vi.fn(),
}));
const mockEditorStart = vi.hoisted(() => vi.fn(() => ({ path: [0, 0], offset: 0 })));

vi.mock('slate', () => ({
  Editor: {
    withoutNormalizing: vi.fn((_editor: any, fn: () => void) => fn()),
    start: mockEditorStart,
  },
  Transforms: mockTransforms,
  Path: { next: (p: number[]) => [...p, 0] },
}));

const mockEditorStore = {
  store: {
    editor: { focus: vi.fn() },
  },
  readonly: false,
  editorProps: { codeProps: { theme: 'github' } },
};

vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mockEditorStore,
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: { focus: vi.fn() },
}));

vi.mock('../../../../src/MarkdownEditor/el', () => ({ CodeNode: {} }));

const appendTextareaAndReturnEditor = (el: HTMLElement) => {
  const textarea = document.createElement('textarea');
  el.appendChild(textarea);
  return mockEditor;
};

vi.mock('../../../../src/Plugins/code/loadAceEditor', () => ({
  loadAceEditor: vi.fn(() =>
    Promise.resolve({
      default: { edit: appendTextareaAndReturnEditor },
    }),
  ),
  loadAceTheme: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../../../src/MarkdownEditor/editor/parser/json-parse', () => ({
  default: vi.fn((str: string) => JSON.parse(str)),
}));

vi.mock('../../../../src/Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

describe('AceEditor 覆盖率 (NODE_ENV=development)', () => {
  const defaultProps = {
    element: {
      type: 'code' as const,
      value: 'console.log("hi");',
      language: 'javascript',
      children: [{ text: '' }] as [{ text: string }],
    },
    onUpdate: vi.fn(),
    onShowBorderChange: vi.fn(),
    onHideChange: vi.fn(),
    path: [0, 1],
    isSelected: false,
    onSelectionChange: vi.fn(),
    theme: 'github',
  };

  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    vi.useFakeTimers();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(eventHandlers).forEach((k) => delete eventHandlers[k]);
    mockEditor.getValue.mockReturnValue('');
    mockEditor.setValue.mockClear();
    mockEditor.setTheme.mockClear();
    mockEditor.session.setMode.mockClear();
    mockEditor.on.mockImplementation((event: string, handler: (...args: any[]) => void) => {
      pushHandler(event, handler);
    });
    mockEditor.selection.on.mockImplementation((event: string, handler: (...args: any[]) => void) => {
      pushHandler(`selection.${event}`, handler);
    });
  });

  it('完整加载与初始化：加载 Ace、创建编辑器、设置主题与 mode', async () => {
    const { loadAceEditor, loadAceTheme } = await import(
      '../../../../src/Plugins/code/loadAceEditor'
    );

    function Wrapper() {
      const result = AceEditor(defaultProps);
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    render(<Wrapper />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });

    expect(loadAceEditor).toHaveBeenCalled();
    expect(loadAceTheme).toHaveBeenCalled();

    expect(mockEditor.setTheme).toHaveBeenCalledWith('ace/theme/github');
    expect(mockEditor.session.setMode).toHaveBeenCalledWith('ace/mode/javascript');
    expect(mockEditor.commands.addCommand).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'disableFind' }),
    );
  });

  it('setupEditorEvents: focus/blur 触发 onShowBorderChange、onHideChange、onSelectionChange', async () => {
    function Wrapper() {
      const result = AceEditor(defaultProps);
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });

    invokeHandlers('focus');
    expect(defaultProps.onShowBorderChange).toHaveBeenCalledWith(false);
    expect(defaultProps.onHideChange).toHaveBeenCalledWith(false);
    expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(true);

    invokeHandlers('blur');
    expect(mockEditor.selection.clearSelection).toHaveBeenCalled();
    act(() => {
      invokeHandlers('blur');
    });
    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });
    expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(false);
  });

  it('setupEditorEvents: change 触发防抖 onUpdate', async () => {
    function Wrapper() {
      const result = AceEditor(defaultProps);
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });

    mockEditor.getValue.mockReturnValue('new code');
    invokeHandlers('change');

    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });
    expect(defaultProps.onUpdate).toHaveBeenCalledWith({ value: 'new code' });
  });

  it('setupEditorEvents: paste 第一次不清空、第二次清空 text', async () => {
    function Wrapper() {
      const result = AceEditor(defaultProps);
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });

    const pasteEvent = { text: 'pasted' } as any;
    const pasteHandlers = eventHandlers['paste'];
    expect(pasteHandlers?.length).toBeGreaterThan(0);
    pasteHandlers![0](pasteEvent);
    expect(pasteEvent.text).toBe('pasted');
    pasteHandlers![0](pasteEvent);
    expect(pasteEvent.text).toBe('');
  });

  it('setupEditorEvents: changeCursor 更新 posRef', async () => {
    mockEditor.getCursorPosition.mockReturnValue({ row: 2, column: 5 });
    function Wrapper() {
      const result = AceEditor(defaultProps);
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });

    const changeCursorHandlers = eventHandlers['selection.changeCursor'];
    expect(changeCursorHandlers?.length).toBeGreaterThan(0);
    changeCursorHandlers?.forEach((h) => h());
    await act(async () => {
      vi.advanceTimersByTime(10);
      await Promise.resolve();
    });
    expect(mockEditor.getCursorPosition).toHaveBeenCalled();
  });

  it('handleKeyDown: backspace 空代码块时删除并插入段落', async () => {
    mockEditor.getValue.mockReturnValue('');
    function Wrapper() {
      const result = AceEditor({
        ...defaultProps,
        element: { ...defaultProps.element, value: '' },
      });
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    const { container } = render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'Backspace',
      keyCode: 8,
      which: 8,
      bubbles: true,
    });
    textarea!.dispatchEvent(keydownEvent);

    expect(mockTransforms.delete).toHaveBeenCalled();
    expect(mockTransforms.insertNodes).toHaveBeenCalled();
    expect(mockTransforms.select).toHaveBeenCalled();
  });

  it('handleKeyDown: mod+enter 插入新段落', async () => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    function Wrapper() {
      const result = AceEditor(defaultProps);
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    const { container } = render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });

    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
    });
    textarea!.dispatchEvent(keydownEvent);

    const { EditorUtils } = await import('../../../../src/MarkdownEditor/editor/utils/editorUtils');
    expect(EditorUtils.focus).toHaveBeenCalled();
    expect(mockTransforms.insertNodes).toHaveBeenCalled();
  });

  it('只读模式下不配置 change 事件', async () => {
    const prevReadonly = mockEditorStore.readonly;
    mockEditorStore.readonly = true;

    function Wrapper() {
      const result = AceEditor(defaultProps);
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });

    mockEditor.getValue.mockReturnValue('x');
    invokeHandlers('change');
    expect(defaultProps.onUpdate).not.toHaveBeenCalled();

    mockEditorStore.readonly = prevReadonly;
  });

  it('加载失败时仍 setAceLoaded(true) 避免无限加载', async () => {
    const { loadAceEditor } = await import('../../../../src/Plugins/code/loadAceEditor');
    vi.mocked(loadAceEditor).mockRejectedValueOnce(new Error('load failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Wrapper() {
      const result = AceEditor(defaultProps);
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(10);
      await Promise.resolve();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load Ace Editor:', expect.any(Error));
    consoleSpy.mockRestore();
    vi.mocked(loadAceEditor).mockResolvedValue({
      default: { edit: appendTextareaAndReturnEditor },
    } as any);
  });

  it('外部 value 变化时同步到编辑器 setValue/clearSelection', async () => {
    function Wrapper({ value }: { value: string }) {
      const result = AceEditor({
        ...defaultProps,
        element: { ...defaultProps.element, value },
      });
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }

    const { rerender } = render(<Wrapper value="initial" />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });

    mockEditor.getValue.mockReturnValue('initial');
    rerender(<Wrapper value="updated from outside" />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockEditor.setValue).toHaveBeenCalledWith('updated from outside');
    expect(mockEditor.clearSelection).toHaveBeenCalled();
  });

  it('setLanguage 与当前语言相同时提前返回', async () => {
    const captureRef = { current: null as ReturnType<typeof AceEditor> | null };
    function Wrapper() {
      const result = AceEditor({
        ...defaultProps,
        element: { ...defaultProps.element, language: 'javascript' },
      });
      captureRef.current = result;
      return (
        <div ref={result.dom}>
          <textarea aria-label="ace" />
        </div>
      );
    }
    render(<Wrapper />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(25);
      await Promise.resolve();
    });
    expect(captureRef.current).toBeTruthy();
    mockEditor.session.setMode.mockClear();
    await captureRef.current!.setLanguage('javascript');
    expect(mockEditor.session.setMode).not.toHaveBeenCalled();
  });
});
