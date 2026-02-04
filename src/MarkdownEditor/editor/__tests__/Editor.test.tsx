import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { Subject } from 'rxjs';
import { BaseEditor, createEditor } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CodeNode,
  ElementProps,
  Elements,
  MarkdownEditorInstance,
  ParagraphNode,
} from '../../BaseMarkdownEditor';
import { PluginContext } from '../../plugin';
import { SlateMarkdownEditor } from '../Editor';
import { EditorStore, EditorStoreContext } from '../store';

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

  const renderEditor = (props: {
    initSchemaValue?: Elements[];
    plugins?: any[];
    eleItemRender?: typeof customEleItemRender;
  }) => {
    return render(
      <ConfigProvider>
        <EditorStoreContext.Provider
          value={{
            store: mockStore,
            typewriter: false,
            readonly: false,
            keyTask$: new Subject(),
            insertCompletionText$: new Subject(),
            openInsertLink$: new Subject(),
            domRect: null,
            setDomRect: () => {},
            editorProps: {},
            markdownEditorRef: mockEditorRef,
            markdownContainerRef: mockContainerRef,
            setShowComment: () => {},
          }}
        >
          <PluginContext.Provider value={props.plugins || []}>
            <SlateMarkdownEditor
              prefixCls="ant-agentic-md-editor"
              instance={mockInstance}
              initSchemaValue={props.initSchemaValue}
              plugins={props.plugins}
              eleItemRender={props.eleItemRender}
            />
          </PluginContext.Provider>
        </EditorStoreContext.Provider>
      </ConfigProvider>,
    );
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
});
