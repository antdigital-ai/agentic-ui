import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Subject } from 'rxjs';
import type { BaseEditor, BaseSelection } from 'slate';
import { Editor, Element } from 'slate';
import type { HistoryEditor } from 'slate-history';
import type { ReactEditor } from 'slate-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext, cnLabels } from '../../../../../I18n';
import type { CommentDataType } from '../../../../BaseMarkdownEditor';
import { EditorStore, useEditorStore } from '../../../store';
import type { Methods } from '../../../utils';
import { EditorUtils } from '../../../utils/editorUtils';
import type { KeyboardTask } from '../../../utils/keyboard';
import { BaseToolBar } from '../BaseBar';

// Mock EditorUtils
vi.mock('../../../utils/editorUtils', () => ({
  EditorUtils: {
    toggleFormat: vi.fn((editor: BaseEditor & ReactEditor & HistoryEditor) => {
      // 检查当前节点是否为代码节点
      const [node] = Editor.nodes(editor, {
        match: (n: any) => Element.isElement(n),
        mode: 'lowest',
      });
      if (node && node?.[0]?.type === 'code') {
        return;
      }
      // 如果不是代码节点，执行格式化
      return true;
    }),
    clearMarks: vi.fn((editor: BaseEditor & ReactEditor & HistoryEditor) => {
      // 检查当前节点是否为代码节点
      const [node] = Editor.nodes(editor, {
        match: (n: any) => Element.isElement(n),
        mode: 'lowest',
      });
      if (node && node?.[0]?.type === 'code') {
        return;
      }
      // 如果不是代码节点，执行清除格式
      return true;
    }),
    highColor: vi.fn((editor: BaseEditor & ReactEditor & HistoryEditor) => {
      // 检查当前节点是否为代码节点
      const [node] = Editor.nodes(editor, {
        match: (n: any) => Element.isElement(n),
        mode: 'lowest',
      });
      if (node && node?.[0]?.type === 'code') {
        return;
      }
      // 如果不是代码节点，执行颜色修改
      return true;
    }),
    isFormatActive: vi.fn().mockReturnValue(false),
  },
}));

// Mock EditorStore
vi.mock('../../../store', () => {
  const actual = vi.importActual('../../../store');
  return {
    ...actual,
    EditorStore: vi.fn(function MockEditorStore() {
      return {
      manual: false,
      highlightCache: new Map(),
      focus: false,
      draggedElement: null,
      footnoteDefinitionMap: new Map(),
      inputComposition: false,
      plugins: undefined,
      domRect: null,
      getMDContent: vi.fn().mockReturnValue('test content'),
      setMDContent: vi.fn(),
      editor: {
        selection: { focus: { path: [0] } },
        children: [],
        nodes: () => [[{ type: 'paragraph', children: [], level: 1 }, [0]]],
      },
      ableToEnter: new Set([
        'paragraph',
        'head',
        'blockquote',
        'code',
        'table',
        'list',
        'media',
        'attach',
      ]),
      doManual: vi.fn(),
      findLatest: vi.fn(),
      clearContent: vi.fn(),
      getContent: vi.fn(),
      getHtmlContent: vi.fn(),
      setContent: vi.fn(),
      updateNodeList: vi.fn(),
      insertNodes: vi.fn(),
      insertText: vi.fn(),
      setState: vi.fn(),
      toPath: vi.fn(),
      dragStart: vi.fn(),
    };
    }) as unknown as typeof EditorStore,
    useEditorStore: vi.fn(),
  };
});

const mockEditorRef = {
  current: {
    selection: { focus: { path: [0] } },
    children: [],
    nodes: () => [[{ type: 'paragraph', children: [], level: 1 }, [0]]],
  },
} as unknown as React.MutableRefObject<
  BaseEditor & ReactEditor & HistoryEditor
>;

const mockDivRef = {
  current: document.createElement('div'),
} as React.MutableRefObject<HTMLDivElement>;

// 创建一个 EditorStore 实例
const store = new EditorStore(mockEditorRef);

// 创建 Subject 实例
const keyTask$ = new Subject<{ key: Methods<KeyboardTask>; args?: any[] }>();
const insertCompletionText$ = new Subject<string>();
const openInsertLink$ = new Subject<BaseSelection>();

const mockEditorStore = {
  markdownEditorRef: mockEditorRef,
  keyTask$,
  store,
  openInsertLink$,
  setDomRect: vi.fn(),
  refreshFloatBar: false,
  typewriter: false,
  setShowComment: vi.fn() as (list: CommentDataType[]) => void,
  readonly: false,
  insertCompletionText$,
  rootContainer: { current: undefined },
  markdownContainerRef: mockDivRef,
  editorProps: {},
  domRect: null,
};

// Mock Slate's Editor
vi.mock('slate', () => {
  return {
    Editor: {
      nodes: (editor: any) => {
        if (editor.selection?.focus?.path?.[0] === 1) {
          return [
            [{ type: 'code', children: [], language: 'javascript' }, [1]],
          ];
        }
        return [[{ type: 'paragraph', children: [], level: 1 }, [0]]];
      },
      parent: () => [{ type: 'paragraph', children: [] }, [0]],
    },
    Element: {
      isElement: () => true,
    },
    Node: {
      string: () => '',
    },
    Text: {
      isText: () => true,
    },
    Transforms: {
      insertText: vi.fn(),
      select: vi.fn(),
    },
  };
});

const defaultProps = {
  showEditor: true,
  min: false,
};

describe('BaseToolBar', () => {
  beforeEach(() => {
    vi.mocked(useEditorStore).mockReturnValue(mockEditorStore);
    vi.clearAllMocks();
  });

  it('renders basic tools when showEditor is true', () => {
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <BaseToolBar {...defaultProps} />
      </I18nContext.Provider>,
    );

    // 检查基本工具是否渲染
    expect(screen.getByLabelText('undo')).toBeInTheDocument();
    expect(screen.getByLabelText('redo')).toBeInTheDocument();
    expect(screen.getByLabelText('format-painter')).toBeInTheDocument();
  });

  it('renders formatting tools', () => {
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <BaseToolBar {...defaultProps} />
      </I18nContext.Provider>,
    );

    // 检查格式化工具是否渲染
    expect(screen.getByLabelText('bold')).toBeInTheDocument();
    expect(screen.getByLabelText('italic')).toBeInTheDocument();
    expect(screen.getByLabelText('strikethrough')).toBeInTheDocument();
  });

  it('hides tools when hideTools prop is provided', () => {
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <BaseToolBar {...defaultProps} hideTools={['bold', 'italic']} />
      </I18nContext.Provider>,
    );

    // 检查被隐藏的工具
    expect(screen.queryByLabelText('bold')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('italic')).not.toBeInTheDocument();
    // 其他工具应该还在
    expect(screen.getByLabelText('strikethrough')).toBeInTheDocument();
  });

  it('renders in minimal mode when min prop is true', () => {
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <BaseToolBar {...defaultProps} min={true} />
      </I18nContext.Provider>,
    );

    // 检查最小模式下的渲染
    const plusIcon = screen.getByRole('button', { name: /plus/i });
    expect(plusIcon).toBeInTheDocument();
  });

  it('handles click events on tools', () => {
    const { container } = render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <BaseToolBar {...defaultProps} />
      </I18nContext.Provider>,
    );

    // 测试点击加粗按钮
    const boldButton = screen.getByLabelText('bold');
    fireEvent.click(boldButton);

    // 测试点击清除格式按钮
    const clearButton = container.querySelector('.toolbar-action-item svg');
    fireEvent.click(clearButton!);

    // 由于我们使用了模拟的 store，这里主要是确保点击事件不会抛出错误
    expect(true).toBeTruthy();
  });

  it('renders extra content when provided', () => {
    const extraContent = <div data-testid="extra-content">Extra Content</div>;
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <BaseToolBar {...defaultProps} extra={[extraContent]} />
      </I18nContext.Provider>,
    );

    expect(screen.getByTestId('extra-content')).toBeInTheDocument();
  });

  it('performs complex editor operations', () => {
    const keyTaskSpy = vi.fn();
    const setMDContentSpy = vi.fn();

    // Override the default mock for this test
    const mockStore = {
      ...mockEditorStore,
      keyTask$: new Subject<{ key: Methods<KeyboardTask>; args?: any[] }>(),
      store: {
        ...store,
        getMDContent: () => 'test content',
        setMDContent: setMDContentSpy,
      } as unknown as EditorStore,
    };
    mockStore.keyTask$.next = keyTaskSpy;
    vi.mocked(useEditorStore).mockReturnValue(mockStore);

    const { container } = render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <BaseToolBar {...defaultProps} />
      </I18nContext.Provider>,
    );

    // 1. 测试文本格式化
    const boldButton = screen.getByLabelText('bold');
    fireEvent.click(boldButton);
    expect(EditorUtils.toggleFormat).toHaveBeenCalledWith(
      expect.anything(),
      'bold',
    );

    // 2. 测试颜色修改
    const colorButton = container.querySelector(
      '[role="button"] .anticon-highlight',
    );
    fireEvent.click(colorButton!.parentElement!);
    expect(EditorUtils.highColor).toHaveBeenCalled();

    // 3. 测试标题修改
    keyTaskSpy.mockClear();
    mockStore.keyTask$.next({
      key: 'head',
      args: [1],
    });
    expect(keyTaskSpy).toHaveBeenCalledWith({
      key: 'head',
      args: [1],
    });

    // 4. 测试撤销/重做
    const undoButton = screen.getByLabelText('undo');
    fireEvent.click(undoButton);
    expect(keyTaskSpy).toHaveBeenCalledWith({
      key: 'undo',
      args: [],
    });

    const redoButton = screen.getByLabelText('redo');
    fireEvent.click(redoButton);
    expect(keyTaskSpy).toHaveBeenCalledWith({
      key: 'redo',
      args: [],
    });

    // 5. 测试格式化功能
    const formatButton = screen.getByLabelText('format-painter');
    fireEvent.click(formatButton);
    expect(setMDContentSpy).toHaveBeenCalled();

    // 6. 测试清除格式
    const clearButtons = container.querySelectorAll('[role="button"]');
    const clearButton = Array.from(clearButtons).find(
      (button) =>
        button.querySelector('svg') && !button.querySelector('.anticon'),
    );
    fireEvent.click(clearButton!);
    expect(EditorUtils.clearMarks).toHaveBeenCalledWith(
      expect.anything(),
      true,
    );
  });
});
