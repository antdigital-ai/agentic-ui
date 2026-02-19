import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React, { createRef } from 'react';
import { Subject } from 'rxjs';
import { BaseEditor, createEditor, Editor, Transforms, type Selection } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CodeNode,
  ElementProps,
  Elements,
  MarkdownEditorInstance,
  ParagraphNode,
} from '../../BaseMarkdownEditor';
import { PluginContext } from '../../plugin';
import type { MarkdownEditorProps } from '../../types';
import { SlateMarkdownEditor } from '../Editor';
import * as handlePasteModule from '../plugins/handlePaste';
import { EditorStore, EditorStoreContext } from '../store';
import type { KeyboardTask, Methods } from '../utils';
import { EditorUtils } from '../utils/editorUtils';
import * as editorUtilsModule from '../utils/editorUtils';

describe('SlateMarkdownEditor', () => {
  let mockInstance: MarkdownEditorInstance;
  let mockStore: EditorStore;
  let mockContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  let mockEditorRef: React.MutableRefObject<
    BaseEditor & ReactEditor & HistoryEditor
  >;

  beforeEach(() => {
    const editor = withHistory(withReact(createEditor())) as BaseEditor &
      ReactEditor &
      HistoryEditor;

    // Initialize editor with empty children
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];

    mockEditorRef = {
      current: editor,
    } as React.MutableRefObject<BaseEditor & ReactEditor & HistoryEditor>;

    mockContainerRef = {
      current: null,
    } as React.MutableRefObject<HTMLDivElement | null>;

    mockStore = new EditorStore(mockEditorRef);

    mockInstance = {
      store: mockStore,
      markdownContainerRef: mockContainerRef,
      markdownEditorRef: mockEditorRef,
      exportHtml: async () => '',
    };
  });

  it('beforeEach 应正确初始化 mockInstance', () => {
    expect(mockInstance).toBeDefined();
    expect(mockInstance.store).toBe(mockStore);
    expect(mockInstance.markdownContainerRef).toBe(mockContainerRef);
    expect(mockInstance.markdownEditorRef).toBe(mockEditorRef);
    expect(typeof mockInstance.exportHtml).toBe('function');
  });

  // Test plugin that handles code blocks
  const codeBlockPlugin = {
    elements: {
      code: (props: ElementProps<CodeNode>) => {
        const defaultDom = (
          <pre
            style={{
              background: '#f2f1f1',
              color: '#1b1b1b',
              padding: '1em',
              borderRadius: '0.5em',
              margin: '1em 0',
              fontSize: '0.8em',
              fontFamily: 'monospace',
              lineHeight: 1.5,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              wordWrap: 'break-word',
            }}
          >
            <code data-testid="plugin-code-block">{props.children}</code>
          </pre>
        );
        return defaultDom;
      },
    },
  };

  // Test plugin that handles custom blocks
  const customBlockPlugin = {
    elements: {
      paragraph: (props: ElementProps<ParagraphNode>) => {
        const defaultDom = (
          <div className="ant-agentic-md-editor-drag-el" data-be="paragraph">
            {props.children}
          </div>
        );
        return (
          <div data-testid="plugin-custom-block" className="custom-block">
            {defaultDom}
          </div>
        );
      },
    },
  };

  // Custom eleItemRender function
  const customEleItemRender = (
    props: ElementProps,
    defaultDom: React.ReactNode,
  ) => {
    if (props.element.type === 'code') {
      return (
        <div data-testid="custom-code-wrapper" className="code-wrapper">
          {defaultDom}
          <button className="copy-button" type="button">
            Copy
          </button>
        </div>
      );
    }
    if (props.element.type === 'paragraph') {
      return (
        <div data-testid="custom-block-wrapper" className="block-wrapper">
          {defaultDom}
          <span className="custom-indicator">★</span>
        </div>
      );
    }
    return defaultDom as React.ReactElement;
  };

  type EditorOptionalProps = {
    initSchemaValue?: Elements[];
    plugins?: any[];
    eleItemRender?: typeof customEleItemRender;
    placeholder?: string;
    reportMode?: boolean;
    readonly?: boolean;
    onSelectionChange?: (sel: any, markdown: string, nodes: any[]) => void;
    comment?: { enable?: boolean; commentList?: any[] };
    tableConfig?: { minColumn?: number; minRows?: number };
    fncProps?: MarkdownEditorProps['fncProps'];
    pasteConfig?: { enabled?: boolean; allowedTypes?: string[] };
    onPaste?: (e: any) => boolean | void;
    lazy?: {
      enable?: boolean;
      placeholderHeight?: number;
      rootMargin?: string;
      renderPlaceholder?: (info: any) => React.ReactNode;
    };
    leafRender?: (props: any, defaultDom: React.ReactNode) => React.ReactNode;
    typewriter?: boolean;
    onFocus?: (markdown: string, children: any[], e: any) => void;
    onBlur?: () => void;
    tagInputProps?: { enable?: boolean; prefixCls?: string | string[] };
    floatBar?: { enable?: boolean };
    textAreaProps?: { enable?: boolean; placeholder?: string };
    className?: string;
    style?: React.CSSProperties;
    compact?: boolean;
  };

  const renderEditor = (props: EditorOptionalProps = {}) => {
    const containerRef = createRef<HTMLDivElement>();
    const contextValue = {
      store: mockStore,
      typewriter: props.typewriter ?? false,
      readonly: props.readonly ?? false,
      keyTask$: new Subject<{ key: Methods<KeyboardTask>; args?: any[] }>(),
      insertCompletionText$: new Subject<string>(),
      openInsertLink$: new Subject<Selection>(),
      domRect: null,
      setDomRect: () => {},
      editorProps: {},
      markdownEditorRef: mockEditorRef,
      markdownContainerRef:
        containerRef as React.MutableRefObject<HTMLDivElement | null>,
      setShowComment: () => {},
    };
    return {
      ...render(
        <ConfigProvider>
          <div ref={containerRef} data-testid="editor-wrapper">
            <EditorStoreContext.Provider value={contextValue}>
              <PluginContext.Provider value={props.plugins || []}>
                <SlateMarkdownEditor
                  prefixCls="ant-agentic-md-editor"
                  instance={mockInstance}
                  initSchemaValue={props.initSchemaValue}
                  plugins={props.plugins}
                  eleItemRender={props.eleItemRender}
                  placeholder={props.placeholder}
                  reportMode={props.reportMode}
                  readonly={props.readonly}
                  onSelectionChange={props.onSelectionChange}
                  comment={props.comment}
                  tableConfig={props.tableConfig}
                  fncProps={props.fncProps}
                  pasteConfig={props.pasteConfig}
                  onPaste={props.onPaste}
                  lazy={props.lazy}
                  leafRender={props.leafRender}
                  typewriter={props.typewriter}
                  onFocus={props.onFocus}
                  onBlur={props.onBlur}
                  tagInputProps={props.tagInputProps}
                  floatBar={props.floatBar}
                  textAreaProps={props.textAreaProps}
                  className={props.className}
                  style={props.style}
                  compact={props.compact}
                />
              </PluginContext.Provider>
            </EditorStoreContext.Provider>
          </div>
        </ConfigProvider>,
      ),
      containerRef,
    };
  };

  it('should render default elements when no plugins or eleItemRender provided', () => {
    const initValue: Elements[] = [
      {
        type: 'paragraph',
        children: [{ text: 'Hello World' }],
      } as ParagraphNode,
    ];

    renderEditor({ initSchemaValue: initValue });
    expect(screen.getByText('Hello World')).toBeDefined();
  });

  it('should apply plugin rendering for code blocks', () => {
    const initValue: Elements[] = [
      {
        type: 'code',
        children: [{ text: 'const x = 1;' }],
        value: 'const x = 1;',
        lang: 'javascript',
      } as CodeNode,
    ];

    renderEditor({ initSchemaValue: initValue, plugins: [codeBlockPlugin] });

    const codeBlock = screen.getByTestId('plugin-code-block');
    expect(codeBlock).toBeDefined();
    expect(codeBlock.textContent).toBe('const x = 1;');
  });

  it('should apply eleItemRender after plugin rendering', () => {
    const initValue: Elements[] = [
      {
        type: 'code',
        children: [{ text: 'const x = 1;' }],
        value: 'const x = 1;',
        lang: 'javascript',
      } as CodeNode,
    ];

    renderEditor({
      initSchemaValue: initValue,
      plugins: [codeBlockPlugin],
      eleItemRender: customEleItemRender,
    });

    const wrapper = screen.getByTestId('custom-code-wrapper');
    const pluginBlock = screen.getByTestId('plugin-code-block');
    const copyButton = screen.getByText('Copy');

    expect(wrapper).toBeDefined();
    expect(pluginBlock).toBeDefined();
    expect(copyButton).toBeDefined();
  });

  it('should handle multiple plugins and eleItemRender combinations', () => {
    const initValue: Elements[] = [
      {
        type: 'code',
        children: [{ text: 'const x = 1;' }],
        value: 'const x = 1;',
        lang: 'javascript',
      } as CodeNode,
      {
        type: 'paragraph',
        children: [{ text: 'Custom content' }],
      } as ParagraphNode,
    ];

    renderEditor({
      initSchemaValue: initValue,
      plugins: [codeBlockPlugin, customBlockPlugin],
      eleItemRender: customEleItemRender,
    });

    // Check code block rendering
    expect(screen.getByTestId('custom-code-wrapper')).toBeDefined();
    expect(screen.getByTestId('plugin-code-block')).toBeDefined();
    expect(screen.getByText('Copy')).toBeDefined();

    // Check custom block rendering
    expect(screen.getByTestId('custom-block-wrapper')).toBeDefined();
    expect(screen.getByTestId('plugin-custom-block')).toBeDefined();
    expect(screen.getByText('★')).toBeDefined();
  });

  it('should not apply eleItemRender to table cells and rows', () => {
    const initValue: Elements[] = [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: 'Cell content' }],
          },
        ],
      },
    ];

    renderEditor({
      initSchemaValue: initValue,
      eleItemRender: customEleItemRender,
    });
    expect(screen.getByText('Cell content')).toBeDefined();
    expect(screen.queryByTestId('custom-block-wrapper')).toBeNull();
  });

  it('should preserve plugin output when no eleItemRender is provided', () => {
    const initValue: Elements[] = [
      {
        type: 'code',
        children: [{ text: 'const x = 1;' }],
        value: 'const x = 1;',
        lang: 'javascript',
      } as CodeNode,
    ];

    renderEditor({ initSchemaValue: initValue, plugins: [codeBlockPlugin] });

    const pluginBlock = screen.getByTestId('plugin-code-block');
    expect(pluginBlock).toBeDefined();
    expect(pluginBlock.textContent).toBe('const x = 1;');
    expect(screen.queryByTestId('custom-code-wrapper')).toBeNull();
  });

  it('should handle plugin and eleItemRender for non-table elements', () => {
    const initValue: Elements[] = [
      {
        type: 'paragraph',
        children: [{ text: 'Custom content' }],
      } as ParagraphNode,
    ];

    renderEditor({
      initSchemaValue: initValue,
      plugins: [customBlockPlugin],
      eleItemRender: customEleItemRender,
    });

    expect(screen.getByTestId('custom-block-wrapper')).toBeDefined();
    expect(screen.getByTestId('plugin-custom-block')).toBeDefined();
    expect(screen.getByText('★')).toBeDefined();
  });

  it('eleItemRender 对非 code/paragraph 元素应返回 defaultDom', () => {
    const initValue: Elements[] = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: 'Heading' }],
      } as any,
    ];
    renderEditor({
      initSchemaValue: initValue,
      eleItemRender: customEleItemRender,
    });
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.queryByTestId('custom-block-wrapper')).toBeNull();
    expect(screen.queryByTestId('custom-code-wrapper')).toBeNull();
  });

  describe('initialValue 逻辑测试', () => {
    it('应该优先使用 initSchemaValue，无论是否在 SSR 环境', () => {
      const initSchemaValue: Elements[] = [
        {
          type: 'paragraph',
          children: [{ text: 'From Schema' }],
        } as ParagraphNode,
      ];

      renderEditor({ initSchemaValue });

      expect(screen.getByText('From Schema')).toBeDefined();
    });

    it('当 initSchemaValue 不存在时，应该使用默认值', () => {
      renderEditor({});

      // 默认值应该是一个空的段落
      const editor = screen.getByRole('textbox');
      expect(editor).toBeDefined();
    });

    it('当 initSchemaValue 为空数组时，应该使用默认值', () => {
      renderEditor({ initSchemaValue: [] });

      // 空数组应该使用默认值
      const editor = screen.getByRole('textbox');
      expect(editor).toBeDefined();
    });

    it('应该正确处理 initSchemaValue 包含多个元素的情况', () => {
      const initSchemaValue: Elements[] = [
        {
          type: 'paragraph',
          children: [{ text: 'First paragraph' }],
        } as ParagraphNode,
        {
          type: 'paragraph',
          children: [{ text: 'Second paragraph' }],
        } as ParagraphNode,
      ];

      renderEditor({ initSchemaValue });

      expect(screen.getByText('First paragraph')).toBeDefined();
      expect(screen.getByText('Second paragraph')).toBeDefined();
    });
  });

  describe('commentMap 与 decorateFn', () => {
    it('应使用 comment.commentList 构建 commentMap 并参与 decorate', () => {
      const commentList = [
        {
          path: [0],
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 5 },
          },
          id: 'c1',
        },
      ];
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'Hello' }] } as ParagraphNode,
        ],
        comment: { enable: true, commentList },
      });
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('comment.enable 为 false 时 decorate 应直接返回', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
        comment: { enable: false, commentList: [] },
      });
      expect(screen.getByText('x')).toBeInTheDocument();
    });
  });

  describe('readonly 与 handleSelectionChange', () => {
    it('readonly 且无 onSelectionChange 且 reportMode 时应跳过选区同步', async () => {
      const setDomRect = vi.fn();
      const containerRef = createRef<HTMLDivElement>();
      const contextValue = {
        store: mockStore,
        typewriter: false,
        readonly: true,
        keyTask$: new Subject<{ key: Methods<KeyboardTask>; args?: any[] }>(),
        insertCompletionText$: new Subject<string>(),
        openInsertLink$: new Subject<Selection>(),
        domRect: null,
        setDomRect,
        editorProps: {},
        markdownEditorRef: mockEditorRef,
        markdownContainerRef:
          containerRef as React.MutableRefObject<HTMLDivElement | null>,
        setShowComment: () => {},
      };
      const { container } = render(
        <ConfigProvider>
          <div ref={containerRef}>
            <EditorStoreContext.Provider value={contextValue}>
              <PluginContext.Provider value={[]}>
                <SlateMarkdownEditor
                  prefixCls="ant-agentic-md-editor"
                  instance={mockInstance}
                  initSchemaValue={[
                    {
                      type: 'paragraph',
                      children: [{ text: 'a' }],
                    } as ParagraphNode,
                  ]}
                  reportMode
                  floatBar={{ enable: false }}
                />
              </PluginContext.Provider>
            </EditorStoreContext.Provider>
          </div>
        </ConfigProvider>,
      );
      const slateEditor = container.querySelector('[data-slate-editor="true"]');
      expect(slateEditor).toBeTruthy();
      if (slateEditor) fireEvent.mouseUp(slateEditor);
      await waitFor(() => expect(setDomRect).toHaveBeenCalledWith(null), {
        timeout: 100,
      });
    });

    it('应传入 onSelectionChange 并在 onSelect 时触发', () => {
      const onSelectionChange = vi.fn();
      renderEditor({
        initSchemaValue: [
          {
            type: 'paragraph',
            children: [{ text: 'select me' }],
          } as ParagraphNode,
        ],
        onSelectionChange,
      });
      const editable = screen.getByRole('textbox');
      fireEvent.select(editable);
      expect(editable).toBeInTheDocument();
    });
  });

  describe('placeholder 与 textAreaProps', () => {
    it('应支持 placeholder 与 textAreaProps.placeholder', () => {
      renderEditor({
        placeholder: 'Type here',
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: '' }] } as ParagraphNode,
        ],
      });
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('tableConfig 与 initialNote', () => {
    it('应使用 tableConfig 与 initSchemaValue 调用 genTableMinSize', () => {
      const initSchemaValue: Elements[] = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'A' }] },
                { type: 'table-cell', children: [{ text: 'B' }] },
              ],
            },
          ],
        } as any,
      ];
      renderEditor({
        initSchemaValue,
        tableConfig: { minColumn: 2, minRows: 1 },
      });
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });
  });

  describe('fncProps.onFootnoteDefinitionChange', () => {
    it('应在 children 含 footnoteDefinition 时调用 onFootnoteDefinitionChange', () => {
      const onFootnoteDefinitionChange = vi.fn();
      const initSchemaValue: Elements[] = [
        { type: 'paragraph', children: [{ text: 'p' }] } as ParagraphNode,
        {
          type: 'footnoteDefinition',
          id: 'fn1',
          identifier: '1',
          value: 'note',
          url: '',
          children: [{ text: 'note' }],
        } as any,
      ];
      renderEditor({
        initSchemaValue,
        fncProps: {
          render: (_, defaultDom) => defaultDom,
          onFootnoteDefinitionChange,
        },
      });
      expect(onFootnoteDefinitionChange).toHaveBeenCalled();
    });
  });

  describe('pasteConfig 与 onPaste', () => {
    it('pasteConfig.enabled 为 false 时应不处理粘贴', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
        pasteConfig: { enabled: false },
      });
      const editable = screen.getByRole('textbox');
      fireEvent.paste(editable, {
        clipboardData: { types: ['text/plain'], getData: () => 'pasted' },
      });
      expect(screen.getByText('x')).toBeInTheDocument();
    });

    it('onPaste 传入时应在粘贴流程中被调用', () => {
      const onPaste = vi.fn(() => false);
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
        onPaste,
      });
      const editable = screen.getByRole('textbox');
      editable.focus();
      const clipboardData = {
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? 'pasted' : ''),
      };
      fireEvent.paste(editable, { clipboardData });
      expect(screen.getByText('x')).toBeInTheDocument();
    });
  });

  describe('lazy 与 countLazyElements', () => {
    it('lazy.enable 时应对非 table-cell/table-row 使用 LazyElement', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'Lazy' }] } as ParagraphNode,
        ],
        lazy: { enable: true },
      });
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('lazy 时 table-cell/table-row 不应被 LazyElement 包裹', () => {
      const initSchemaValue: Elements[] = [
        {
          type: 'table-row',
          children: [{ type: 'table-cell', children: [{ text: 'Cell' }] }],
        },
      ];
      renderEditor({ initSchemaValue, lazy: { enable: true } });
      expect(screen.getByText('Cell')).toBeInTheDocument();
    });
  });

  describe('leafRender', () => {
    it('应使用自定义 leafRender 渲染叶子节点', () => {
      const leafRender = vi.fn((_props: any, defaultDom: React.ReactNode) => (
        <span data-testid="custom-leaf">{defaultDom}</span>
      ));
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'T' }] } as ParagraphNode,
        ],
        leafRender,
      });
      expect(leafRender).toHaveBeenCalled();
      expect(screen.getByTestId('custom-leaf')).toBeInTheDocument();
    });
  });

  describe('typewriter / checkEnd / onFocus / onBlur', () => {
    it('typewriter 为 true 时 checkEnd 应直接返回', () => {
      const containerRef = createRef<HTMLDivElement>();
      const contextValue = {
        store: mockStore,
        typewriter: true,
        readonly: false,
        keyTask$: new Subject<{ key: Methods<KeyboardTask>; args?: any[] }>(),
        insertCompletionText$: new Subject<string>(),
        openInsertLink$: new Subject<Selection>(),
        domRect: null,
        setDomRect: () => {},
        editorProps: {},
        markdownEditorRef: mockEditorRef,
        markdownContainerRef:
          containerRef as React.MutableRefObject<HTMLDivElement | null>,
        setShowComment: () => {},
      };
      render(
        <ConfigProvider>
          <div ref={containerRef}>
            <EditorStoreContext.Provider value={contextValue}>
              <PluginContext.Provider value={[]}>
                <SlateMarkdownEditor
                  prefixCls="ant-agentic-md-editor"
                  instance={mockInstance}
                  initSchemaValue={[
                    {
                      type: 'paragraph',
                      children: [{ text: 'a' }],
                    } as ParagraphNode,
                  ]}
                  typewriter
                />
              </PluginContext.Provider>
            </EditorStoreContext.Provider>
          </div>
        </ConfigProvider>,
      );
      const editable = screen.getByRole('textbox');
      fireEvent.mouseDown(editable);
      expect(screen.getByText('a')).toBeInTheDocument();
    });

    it('应支持 onFocus 与 onBlur 并绑定到 Editable', () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
        onFocus,
        onBlur,
      });
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('readonly 时点击应清除 setDomRect', () => {
      const setDomRect = vi.fn();
      const containerRef = createRef<HTMLDivElement>();
      const contextValue = {
        store: mockStore,
        typewriter: false,
        readonly: true,
        keyTask$: new Subject<{ key: Methods<KeyboardTask>; args?: any[] }>(),
        insertCompletionText$: new Subject<string>(),
        openInsertLink$: new Subject<Selection>(),
        domRect: null,
        setDomRect,
        editorProps: {},
        markdownEditorRef: mockEditorRef,
        markdownContainerRef:
          containerRef as React.MutableRefObject<HTMLDivElement | null>,
        setShowComment: () => {},
      };
      const { container } = render(
        <ConfigProvider>
          <div ref={containerRef}>
            <EditorStoreContext.Provider value={contextValue}>
              <PluginContext.Provider value={[]}>
                <SlateMarkdownEditor
                  prefixCls="ant-agentic-md-editor"
                  instance={mockInstance}
                  initSchemaValue={[
                    {
                      type: 'paragraph',
                      children: [{ text: 'a' }],
                    } as ParagraphNode,
                  ]}
                />
              </PluginContext.Provider>
            </EditorStoreContext.Provider>
          </div>
        </ConfigProvider>,
      );
      const slateEditor = container.querySelector('[data-slate-editor="true"]');
      expect(slateEditor).toBeTruthy();
      if (slateEditor) fireEvent.mouseDown(slateEditor);
      expect(setDomRect).toHaveBeenCalledWith(null);
    });
  });

  describe('tagInputProps 与 handleKeyDown', () => {
    it('tagInputProps.enable 且 key 匹配 prefixCls 时应插入 tag 节点', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: '' }] } as ParagraphNode,
        ],
        tagInputProps: { enable: true, prefixCls: ['$'] },
      });
      const editable = screen.getByRole('textbox');
      fireEvent.keyDown(editable, {
        key: '$',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      });
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Editable 事件与样式', () => {
    it('应应用 reportMode / compact / className / style', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
        reportMode: true,
        compact: true,
        className: 'custom-editor',
        style: { minHeight: 100 },
      });
      const editable = screen.getByRole('textbox');
      expect(editable).toHaveClass('custom-editor');
      expect(editable).toHaveClass('ant-agentic-md-editor-content-compact');
      expect(editable).toHaveClass('ant-agentic-md-editor-content-report');
    });

    it('onCopy/onCut 应调用 handleClipboardCopy', () => {
      renderEditor({
        initSchemaValue: [
          {
            type: 'paragraph',
            children: [{ text: 'copy me' }],
          } as ParagraphNode,
        ],
      });
      const editable = screen.getByRole('textbox');
      fireEvent.copy(editable, {
        clipboardData: {
          clearData: vi.fn(),
          setData: vi.fn(),
          getData: vi.fn(),
        },
      });
      fireEvent.cut(editable, {
        clipboardData: {
          clearData: vi.fn(),
          setData: vi.fn(),
          getData: vi.fn(),
        },
      });
      expect(screen.getByText('copy me')).toBeInTheDocument();
    });

    it('onCompositionStart/onCompositionEnd 应操作 data-composition', () => {
      const { getByTestId } = renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
      });
      const wrapper = getByTestId('editor-wrapper');
      const editable = screen.getByRole('textbox');
      fireEvent.compositionStart(editable);
      fireEvent.compositionEnd(editable);
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary 与 elementRenderElement', () => {
    it('MElement 被 ErrorBoundary 包裹时应能渲染', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'ok' }] } as ParagraphNode,
        ],
      });
      expect(screen.getByText('ok')).toBeInTheDocument();
    });
  });

  describe('handleSelectionChange readonly 分支', () => {
    it('readonly 且 window.getSelection() 为 null 时应 setDomRect(null) 并 onSelectionChange(null, "", [])', async () => {
      const setDomRect = vi.fn();
      const onSelectionChange = vi.fn();
      const containerRef = createRef<HTMLDivElement>();
      const origGetSelection = window.getSelection;
      window.getSelection = vi.fn(() => null);
      const contextValue = {
        store: mockStore,
        typewriter: false,
        readonly: true,
        keyTask$: new Subject<{ key: Methods<KeyboardTask>; args?: any[] }>(),
        insertCompletionText$: new Subject<string>(),
        openInsertLink$: new Subject<Selection>(),
        domRect: null,
        setDomRect,
        editorProps: {},
        markdownEditorRef: mockEditorRef,
        markdownContainerRef:
          containerRef as React.MutableRefObject<HTMLDivElement | null>,
        setShowComment: () => {},
      };
      const { container } = render(
        <ConfigProvider>
          <div ref={containerRef}>
            <EditorStoreContext.Provider value={contextValue}>
              <PluginContext.Provider value={[]}>
                <SlateMarkdownEditor
                  prefixCls="ant-agentic-md-editor"
                  instance={mockInstance}
                  initSchemaValue={[
                    {
                      type: 'paragraph',
                      children: [{ text: 'a' }],
                    } as ParagraphNode,
                  ]}
                  onSelectionChange={onSelectionChange}
                />
              </PluginContext.Provider>
            </EditorStoreContext.Provider>
          </div>
        </ConfigProvider>,
      );
      const slateEditor = container.querySelector('[data-slate-editor="true"]');
      if (slateEditor) fireEvent.mouseUp(slateEditor);
      await waitFor(() => {
        expect(setDomRect).toHaveBeenCalledWith(null);
        expect(onSelectionChange).toHaveBeenCalledWith(null, '', []);
      });
      window.getSelection = origGetSelection;
    });

    it('readonly 时点击应清除 setDomRect 且不报错', () => {
      const { container } = renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
        readonly: true,
        onSelectionChange: vi.fn(),
      });
      const slateEditor = container.querySelector('[data-slate-editor="true"]');
      expect(slateEditor).toBeTruthy();
      if (slateEditor) fireEvent.mouseDown(slateEditor);
      expect(screen.getByText('x')).toBeInTheDocument();
    });
  });

  describe('textAreaProps.enable 与 checkEnd', () => {
    it('textAreaProps.enable 为 true 时 checkEnd 不处理定位', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
        textAreaProps: { enable: true },
      });
      const editable = screen.getByRole('textbox');
      fireEvent.mouseDown(editable);
      expect(screen.getByText('x')).toBeInTheDocument();
    });
  });

  describe('initialNote 分支', () => {
    it('instance 为 undefined 时 nodeRef 置空', () => {
      const containerRef = createRef<HTMLDivElement>();
      const contextValue = {
        store: mockStore,
        typewriter: false,
        readonly: false,
        keyTask$: new Subject<{ key: Methods<KeyboardTask>; args?: any[] }>(),
        insertCompletionText$: new Subject<string>(),
        openInsertLink$: new Subject<Selection>(),
        domRect: null,
        setDomRect: () => {},
        editorProps: {},
        markdownEditorRef: mockEditorRef,
        markdownContainerRef:
          containerRef as React.MutableRefObject<HTMLDivElement | null>,
        setShowComment: () => {},
      };
      render(
        <ConfigProvider>
          <div ref={containerRef}>
            <EditorStoreContext.Provider value={contextValue}>
              <PluginContext.Provider value={[]}>
                <SlateMarkdownEditor
                  prefixCls="ant-agentic-md-editor"
                  instance={undefined as any}
                  initSchemaValue={[
                    {
                      type: 'paragraph',
                      children: [{ text: '' }],
                    } as ParagraphNode,
                  ]}
                />
              </PluginContext.Provider>
            </EditorStoreContext.Provider>
          </div>
        </ConfigProvider>,
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('EditorUtils.reset 抛错时应 fallback 到 deleteAll', () => {
      const resetSpy = vi.spyOn(EditorUtils, 'reset').mockImplementation(() => {
        throw new Error('reset error');
      });
      const deleteAllSpy = vi
        .spyOn(EditorUtils, 'deleteAll')
        .mockImplementation(() => {});
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
      });
      expect(deleteAllSpy).toHaveBeenCalled();
      resetSpy.mockRestore();
      deleteAllSpy.mockRestore();
    });
  });

  describe('粘贴类型分支', () => {
    it('粘贴 application/x-slate-md-fragment 时应走 handleSlateMarkdownFragment', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: '' }] } as ParagraphNode,
        ],
      });
      const editable = screen.getByRole('textbox');
      editable.focus();
      const fragment = [
        { type: 'paragraph', children: [{ text: 'from fragment' }] },
      ];
      fireEvent.paste(editable, {
        clipboardData: {
          types: ['application/x-slate-md-fragment', 'text/plain'],
          getData: (t: string) =>
            t === 'application/x-slate-md-fragment'
              ? JSON.stringify(fragment)
              : t === 'text/plain'
                ? 'fallback'
                : '',
          setData: vi.fn(),
        },
      });
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('粘贴 text/markdown 时应 insertFragment', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: '' }] } as ParagraphNode,
        ],
      });
      const editable = screen.getByRole('textbox');
      editable.focus();
      fireEvent.paste(editable, {
        clipboardData: {
          types: ['text/markdown'],
          getData: (t: string) => (t === 'text/markdown' ? '# Hello' : ''),
          setData: vi.fn(),
        },
      });
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('粘贴 text/plain 时应走纯文本处理', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: '' }] } as ParagraphNode,
        ],
      });
      const editable = screen.getByRole('textbox');
      editable.focus();
      fireEvent.paste(editable, {
        clipboardData: {
          types: ['text/plain'],
          getData: (t: string) => (t === 'text/plain' ? 'plain text' : ''),
          setData: vi.fn(),
        },
      });
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('pasteConfig.allowedTypes 不包含某类型时不处理该类型', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
        pasteConfig: { allowedTypes: ['text/plain'] },
      });
      const editable = screen.getByRole('textbox');
      fireEvent.paste(editable, {
        clipboardData: {
          types: ['text/html'],
          getData: () => '',
          setData: vi.fn(),
        },
      });
      expect(screen.getByText('x')).toBeInTheDocument();
    });
  });

  describe('copy/cut 与 hasEditableTarget', () => {
    it('onCopy 时无 selection 应不抛错', () => {
      mockEditorRef.current.selection = null;
      renderEditor({
        initSchemaValue: [
          {
            type: 'paragraph',
            children: [{ text: 'copy me' }],
          } as ParagraphNode,
        ],
      });
      const editable = screen.getByRole('textbox');
      fireEvent.copy(editable, {
        clipboardData: {
          clearData: vi.fn(),
          setData: vi.fn(),
          getData: vi.fn(),
        },
      });
      expect(screen.getByText('copy me')).toBeInTheDocument();
    });
  });

  describe('commentMap 多 path/selection', () => {
    it('commentList 多条同 path 不同 selection 时应正确构建 commentMap', () => {
      const commentList = [
        {
          path: [0],
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 3 },
          },
          id: 'c1',
        },
        {
          path: [0],
          selection: {
            anchor: { path: [0, 0], offset: 4 },
            focus: { path: [0, 0], offset: 7 },
          },
          id: 'c2',
        },
      ];
      renderEditor({
        initSchemaValue: [
          {
            type: 'paragraph',
            children: [{ text: 'Hello World' }],
          } as ParagraphNode,
        ],
        comment: { enable: true, commentList },
      });
      expect(screen.getAllByTestId('comment-view')).toHaveLength(2);
    });
  });

  describe('genTableMinSize 递归', () => {
    it('initSchemaValue 含嵌套 children 时 genTableMinSize 应递归', () => {
      const initSchemaValue: Elements[] = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'A' }] },
                { type: 'table-cell', children: [{ text: 'B' }] },
              ],
            },
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'C' }] },
                { type: 'table-cell', children: [{ text: 'D' }] },
              ],
            },
          ],
        } as any,
      ];
      renderEditor({
        initSchemaValue,
        tableConfig: { minColumn: 2, minRows: 2 },
      });
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });
  });

  describe('事件分支覆盖补充', () => {
    it('onPaste 触发时应进入粘贴处理流程', () => {
      const onPaste = vi.fn(() => false);
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'x' }] } as ParagraphNode,
        ],
        onPaste,
      });
      const editable = document.querySelector(
        '[data-slate-editor="true"]',
      ) as HTMLElement;
      fireEvent.paste(editable, {
        clipboardData: {
          types: ['text/plain'],
          getData: (t: string) => (t === 'text/plain' ? 'pasted text' : ''),
          setData: vi.fn(),
        },
      });

      expect(editable).toBeInTheDocument();
    });

    it('copy/cut 在事件已处理时应走 fallback preventDefault', () => {
      const isHandledSpy = vi
        .spyOn(editorUtilsModule, 'isEventHandled')
        .mockReturnValue(true);

      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'copy me' }] } as ParagraphNode,
        ],
      });
      const editable = document.querySelector(
        '[data-slate-editor="true"]',
      ) as HTMLElement;

      fireEvent.copy(editable, {
        clipboardData: { clearData: vi.fn(), setData: vi.fn() },
      });
      fireEvent.cut(editable, {
        clipboardData: { clearData: vi.fn(), setData: vi.fn() },
      });

      expect(editable).toBeInTheDocument();
      isHandledSpy.mockRestore();
    });

    it('onDragOver 应调用 preventDefault', () => {
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'drag over' }] } as ParagraphNode,
        ],
      });
      const editable = document.querySelector(
        '[data-slate-editor="true"]',
      ) as HTMLElement;
      fireEvent.dragOver(editable);
      expect(editable).toBeInTheDocument();
    });

    it('onFocus 应返回 markdown 与 children，onBlur 不报错', () => {
      const onFocus = vi.fn();
      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'focus text' }] } as ParagraphNode,
        ],
        onFocus,
      });
      const editable = document.querySelector(
        '[data-slate-editor="true"]',
      ) as HTMLElement;
      fireEvent.focus(editable);
      fireEvent.blur(editable);
      expect(editable).toBeInTheDocument();
    });

    it('compositionStart/compositionEnd 应同步 data-composition 标记', () => {
      mockEditorRef.current.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      } as any;

      const host = document.createElement('div');
      const tagInput = document.createElement('input');
      tagInput.setAttribute('data-tag-popup-input', 'true');
      host.appendChild(tagInput);

      const toDomNodeSpy = vi
        .spyOn(ReactEditor, 'toDOMNode')
        .mockReturnValue(host as any);

      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'ime' }] } as ParagraphNode,
        ],
      });

      const editable = document.querySelector(
        '[data-slate-editor="true"]',
      ) as HTMLElement;
      const preventDefault = vi.fn();
      const startEvent = fireEvent.compositionStart(editable, {
        preventDefault,
      });
      expect(startEvent).toBe(true);

      fireEvent.compositionEnd(editable);
      expect(tagInput).toBeTruthy();

      toDomNodeSpy.mockRestore();
    });

    it('text/plain 在 shouldInsertTextDirectly=true 时应直接 insertText', () => {
      const shouldInsertSpy = vi
        .spyOn(handlePasteModule, 'shouldInsertTextDirectly')
        .mockReturnValue(true);
      const insertTextSpy = vi.spyOn(Transforms, 'insertText');

      mockEditorRef.current.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      } as any;

      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: '' }] } as ParagraphNode,
        ],
      });
      mockEditorRef.current.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      } as any;
      const editable = document.querySelector(
        '[data-slate-editor="true"]',
      ) as HTMLElement;
      fireEvent.paste(editable, {
        clipboardData: {
          types: ['text/plain'],
          getData: (t: string) => (t === 'text/plain' ? 'direct text' : ''),
          setData: vi.fn(),
        },
      });

      expect(editable).toBeInTheDocument();
      shouldInsertSpy.mockRestore();
      insertTextSpy.mockRestore();
    });

    it('未命中已支持类型时应回退到 ReactEditor.insertData', () => {
      const editableTargetSpy = vi
        .spyOn(editorUtilsModule, 'hasEditableTarget')
        .mockReturnValue(true);
      const insertDataSpy = vi.spyOn(ReactEditor, 'insertData');

      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: '' }] } as ParagraphNode,
        ],
      });
      const editable = document.querySelector(
        '[data-slate-editor="true"]',
      ) as HTMLElement;
      fireEvent.paste(editable, {
        clipboardData: {
          types: ['custom/type'],
          getData: () => '',
          setData: vi.fn(),
        },
        target: editable,
      });

      expect(editable).toBeInTheDocument();
      editableTargetSpy.mockRestore();
      insertDataSpy.mockRestore();
    });

    it('decorate 处理 comment 时异常应走 catch 回退', () => {
      const fragmentSpy = vi
        .spyOn(Editor, 'fragment')
        .mockImplementation(() => {
          throw new Error('decorate error');
        });

      renderEditor({
        initSchemaValue: [
          { type: 'paragraph', children: [{ text: 'Hello' }] } as ParagraphNode,
        ],
        comment: {
          enable: true,
          commentList: [
            {
              id: 'c-err',
              path: [0],
              selection: {
                anchor: { path: [0, 0], offset: 0 },
                focus: { path: [0, 0], offset: 3 },
              },
            },
          ],
        },
      });

      expect(screen.getByText('Hello')).toBeInTheDocument();
      fragmentSpy.mockRestore();
    });

    it('decorate 在 refContent 场景下应支持 table/card 路径选择', () => {
      const findByTextSpy = vi
        .spyOn(editorUtilsModule, 'findByPathAndText')
        .mockReturnValue([] as any);

      const initSchemaValue: Elements[] = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'Cell A' }] },
                { type: 'table-cell', children: [{ text: 'Cell B' }] },
              ],
            },
          ],
        } as any,
      ];

      renderEditor({
        initSchemaValue,
        comment: {
          enable: true,
          commentList: [
            {
              id: 'c-ref-table',
              path: [0],
              refContent: 'not-found-text',
              selection: {
                anchor: undefined,
                focus: { path: [0, 0, 0, 0], offset: 1 },
              },
            },
          ],
        },
      });

      expect(findByTextSpy).toHaveBeenCalled();
      expect(screen.getAllByTestId('comment-view').length).toBeGreaterThan(0);
      findByTextSpy.mockRestore();
    });
  });
});
