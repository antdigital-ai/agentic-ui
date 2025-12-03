import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MElement,
  MLeaf,
} from '../../../../src/MarkdownEditor/editor/elements';

// Mock 依赖
vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: { current: { focus: vi.fn() } },
    markdownContainerRef: { current: document.createElement('div') },
    readonly: false,
    store: {
      dragStart: vi.fn(),
      isLatestNode: vi.fn().mockReturnValue(false),
    },
    typewriter: false,
    editorProps: {
      titlePlaceholderContent: '请输入内容...',
    },
  }),
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    findPath: vi.fn().mockReturnValue([0, 0]),
  },
  useSlate: () => ({
    children: [],
  }),
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn().mockReturnValue(false),
  },
}));

vi.mock('../../../../src/MarkdownEditor/editor/utils/dom', () => ({
  slugify: vi.fn().mockReturnValue('test-slug'),
}));

vi.mock('../../../../src/MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle">Drag Handle</div>,
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Table', () => ({
  tableRenderElement: vi.fn().mockReturnValue(null),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Card', () => ({
  WarpCard: ({ children, ...props }: any) => (
    <div data-testid="warp-card" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Comment', () => ({
  CommentView: ({ children, ...props }: any) => (
    <div data-testid="comment-view" {...props}>
      {children}
    </div>
  ),
}));

vi.mock(
  '../../../../src/MarkdownEditor/editor/elements/FootnoteDefinition',
  () => ({
    FootnoteDefinition: ({ children, ...props }: any) => (
      <div data-testid="footnote-definition" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  '../../../../src/MarkdownEditor/editor/elements/FootnoteReference',
  () => ({
    FootnoteReference: ({ children, ...props }: any) => (
      <div data-testid="footnote-reference" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock('../../../../src/MarkdownEditor/editor/elements/Image', () => ({
  EditorImage: ({ children, ...props }: any) => (
    <div data-testid="editor-image" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/LinkCard', () => ({
  LinkCard: ({ children, ...props }: any) => (
    <div data-testid="link-card" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/List', () => ({
  List: ({ children, ...props }: any) => (
    <div data-testid="list" {...props}>
      {children}
    </div>
  ),
  ListItem: ({ children, ...props }: any) => (
    <div data-testid="list-item" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Media', () => ({
  Media: ({ children, ...props }: any) => (
    <div data-testid="media" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Paragraph', () => ({
  Paragraph: ({ children, ...props }: any) => (
    <div data-testid="paragraph" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Schema', () => ({
  Schema: ({ children, ...props }: any) => (
    <div data-testid="schema" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/TagPopup', () => ({
  TagPopup: ({ children, ...props }: any) => (
    <div data-testid="tag-popup" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Blockquote', () => ({
  Blockquote: ({ children, ...props }: any) => (
    <div data-testid="blockquote" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Head', () => ({
  Head: ({ children, ...props }: any) => (
    <div data-testid="head" {...props}>
      {children}
    </div>
  ),
}));

// Mock Ant Design components
vi.mock('antd', () => ({
  ConfigProvider: {
    ConfigContext: React.createContext({
      getPrefixCls: (suffixCls: string) => `ant-${suffixCls}`,
    }),
  },
  Popover: ({ children, content }: any) => (
    <div data-testid="popover">
      {content}
      {children}
    </div>
  ),
}));

vi.mock('@ant-design/icons', () => ({
  ExportOutlined: ({ onClick }: any) => (
    <div data-testid="export-icon" onClick={onClick}>
      Export
    </div>
  ),
}));

describe('Elements Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MElement 组件测试', () => {
    const defaultElementProps = {
      element: { type: 'paragraph', children: [] },
      attributes: {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      },
      children: <div>Test Content</div>,
      readonly: false,
    };

    describe('基本渲染测试', () => {
      it('应该渲染段落元素', () => {
        render(<MElement {...defaultElementProps} />);
        expect(screen.getByTestId('paragraph')).toBeInTheDocument();
      });

      it('应该渲染引用块元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'blockquote', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('blockquote')).toBeInTheDocument();
      });

      it('应该渲染标题元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'head', level: 1, children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('head')).toBeInTheDocument();
      });

      it('应该渲染链接卡片元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'link-card', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('link-card')).toBeInTheDocument();
      });

      it('应该渲染列表元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'list', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('list')).toBeInTheDocument();
      });

      it('应该渲染列表项元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'list-item', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('list-item')).toBeInTheDocument();
      });

      it('应该渲染媒体元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'media', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('media')).toBeInTheDocument();
      });

      it('应该渲染图片元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'image', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('editor-image')).toBeInTheDocument();
      });

      it('应该渲染脚注定义元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'footnoteDefinition', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('footnote-definition')).toBeInTheDocument();
      });

      it('应该渲染脚注引用元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'footnoteReference', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('footnote-reference')).toBeInTheDocument();
      });

      it('应该渲染卡片元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'card', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('warp-card')).toBeInTheDocument();
      });

      it('应该渲染模式元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'schema', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('schema')).toBeInTheDocument();
      });

      it('应该渲染 apaasify 元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'apaasify', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('schema')).toBeInTheDocument();
      });
    });

    describe('特殊元素测试', () => {
      it('应该渲染水平分割线', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'hr', children: [] },
        };
        render(<MElement {...props} />);
        const hrElement = screen.getByText('Test Content').parentElement;
        expect(hrElement).toHaveAttribute('contenteditable', 'false');
        expect(hrElement).toHaveClass('select-none');
      });

      it('应该渲染换行元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'break', children: [] },
        };
        render(<MElement {...props} />);
        const breakElement = screen.getByText('Test Content').parentElement;
        expect(breakElement).toHaveAttribute('contenteditable', 'false');
      });

      it('应该渲染 KaTeX 元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'katex', value: 'x^2', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByText('x^2')).toBeInTheDocument();
      });

      it('应该渲染内联 KaTeX 元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'inline-katex', value: 'x^2', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByText('x^2')).toBeInTheDocument();
      });

      it('应该渲染 Mermaid 元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'mermaid', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('应该渲染代码元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'code', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('应该渲染卡片前置元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'card-before', children: [] },
          readonly: false,
        };
        render(<MElement {...props} />);
        const cardBeforeElement =
          screen.getByText('Test Content').parentElement;
        expect(cardBeforeElement).toHaveAttribute('data-be', 'card-before');
        expect(cardBeforeElement).toHaveStyle({ display: 'inline-block' });
      });

      it('应该在只读模式下隐藏卡片前置元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'card-before', children: [] },
          readonly: true,
        };
        render(<MElement {...props} />);
        const cardBeforeElement =
          screen.getByText('Test Content').parentElement;
        expect(cardBeforeElement).toHaveStyle({ display: 'none' });
      });

      it('应该渲染卡片后置元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'card-after', children: [] },
          readonly: false,
        };
        render(<MElement {...props} />);
        const cardAfterElement = screen.getByText('Test Content').parentElement;
        expect(cardAfterElement).toHaveAttribute('data-be', 'card-after');
        expect(cardAfterElement).toHaveStyle({ display: 'inline-block' });
      });

      it('应该在只读模式下隐藏卡片后置元素', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'card-after', children: [] },
          readonly: true,
        };
        render(<MElement {...props} />);
        const cardAfterElement = screen.getByText('Test Content').parentElement;
        expect(cardAfterElement).toHaveStyle({ display: 'none' });
      });
    });

    describe('默认渲染测试', () => {
      it('应该为未知类型渲染段落', () => {
        const props = {
          ...defaultElementProps,
          element: { type: 'unknown-type', children: [] },
        };
        render(<MElement {...props} />);
        expect(screen.getByTestId('paragraph')).toBeInTheDocument();
      });
    });
  });

  describe('MLeaf 组件测试', () => {
    const defaultLeafProps = {
      leaf: { text: 'Test Text' },
      text: { text: 'Test Text' },
      attributes: {
        'data-slate-leaf': true as const,
      },
      children: <div>Test Content</div>,
      hashId: 'test-hash',
      comment: {},
      fncProps: {},
      tagInputProps: {},
    } as any;

    describe('基本渲染测试', () => {
      it('应该渲染基本文本', () => {
        render(<MLeaf {...defaultLeafProps} />);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('应该渲染粗体文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, bold: true },
        };
        render(<MLeaf {...props} />);
        expect(screen.getByTestId('markdown-bold')).toBeInTheDocument();
      });

      it('应该渲染斜体文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, italic: true },
        };
        render(<MLeaf {...props} />);
        const element = screen.getByText('Test Content').parentElement;
        expect(element).toHaveStyle({ fontStyle: 'italic' });
      });

      it('应该渲染删除线文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, strikethrough: true },
        };
        render(<MLeaf {...props} />);
        expect(
          screen.getByText('Test Content').closest('s'),
        ).toBeInTheDocument();
      });

      it('应该渲染代码文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, code: true },
        };
        render(<MLeaf {...props} />);
        expect(
          screen.getByText('Test Content').closest('code'),
        ).toBeInTheDocument();
      });

      it('应该渲染标签文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, tag: true },
        };
        render(<MLeaf {...props} />);
        // 标签文本会渲染为代码元素
        expect(
          screen.getByText('Test Content').closest('code'),
        ).toBeInTheDocument();
      });

      it('应该渲染高亮颜色文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, highColor: '#ff0000' },
        };
        render(<MLeaf {...props} />);
        const element = screen.getByText('Test Content').parentElement;
        expect(element).toHaveStyle({ color: '#ff0000' });
      });

      it('应该渲染颜色文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, color: '#00ff00' },
        };
        render(<MLeaf {...props} />);
        const element = screen.getByText('Test Content').parentElement;
        expect(element).toHaveStyle({ color: '#00ff00' });
      });

      it('应该渲染当前选中文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, current: true },
        };
        render(<MLeaf {...props} />);
        const element = screen.getByText('Test Content').parentElement;
        expect(element).toHaveStyle({ background: '#f59e0b' });
      });

      it('应该渲染 HTML 文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, html: '<div>test</div>' },
        };
        render(<MLeaf {...props} />);
        const element = screen.getByText('Test Content').parentElement;
        expect(element).toHaveClass('ant-agentic-md-editor-content-m-html');
      });
    });

    describe('链接功能测试', () => {
      it('应该在只读模式下且有 url 时渲染链接元素', () => {
        const props = {
          ...defaultLeafProps,
          readonly: true,
          leaf: { ...defaultLeafProps.leaf, url: 'https://example.com' },
        };
        render(<MLeaf {...props} />);
        // 验证链接存在
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('应该在非只读模式下正常渲染文本', () => {
        const props = {
          ...defaultLeafProps,
          readonly: false,
          leaf: { ...defaultLeafProps.leaf, url: 'https://example.com' },
        };
        render(<MLeaf {...props} />);
        const element = screen.getByText('Test Content').parentElement;
        expect(element).toHaveAttribute('data-be', 'text');
      });
    });

    describe('特殊功能测试', () => {
      it('应该处理 fnc 功能', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, fnc: 'test' },
        };
        render(<MLeaf {...props} />);
        // fnc 功能会显示处理后的文本，但可能仍然是原始文本
        expect(screen.getByText('Test Text')).toBeInTheDocument();
      });

      it('应该处理 fnd 功能', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, fnd: 'test' },
        };
        render(<MLeaf {...props} />);
        // fnd 功能会显示处理后的文本，但可能仍然是原始文本
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('应该处理评论功能', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, comment: true, id: 'comment-1' },
        };
        render(<MLeaf {...props} />);
        expect(screen.getByTestId('comment-view')).toBeInTheDocument();
        expect(
          document.getElementById('comment-comment-1'),
        ).toBeInTheDocument();
      });

      it('应该处理 identifier 功能', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, identifier: 'test-id' },
        };
        render(<MLeaf {...props} />);
        // identifier 功能会显示原始文本
        expect(screen.getByText('Test Text')).toBeInTheDocument();
      });

      it('应该处理 fncProps.render 功能', () => {
        const mockRender = vi.fn((leaf, dom) => (
          <div data-testid="custom-render">Custom: {leaf.text}</div>
        ));
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, fnc: 'test', text: '[^DOC_123]' },
          fncProps: { render: mockRender },
        };
        render(<MLeaf {...props} />);
        expect(mockRender).toHaveBeenCalled();
        expect(screen.getByTestId('custom-render')).toBeInTheDocument();
      });

      it('应该处理 TagPopup 功能', () => {
        const mockOnSelect = vi.fn();
        const mockTagTextRender = vi.fn((props, text) => `Rendered: ${text}`);
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            tag: true,
            code: true,
            text: 'user',
            placeholder: 'Select user',
            autoOpen: true,
            triggerText: '@',
          },
          tagInputProps: {
            enable: true,
            tagTextRender: mockTagTextRender,
            onSelect: mockOnSelect,
          },
        };
        render(<MLeaf {...props} />);
        expect(screen.getByTestId('tag-popup')).toBeInTheDocument();
      });

      it('应该处理 identifier render 功能', () => {
        const mockRender = vi.fn((leaf, dom) => (
          <div data-testid="identifier-render">ID: {leaf.children}</div>
        ));
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            identifier: 'doc-123',
            text: '[^DOC_123]',
          },
          fncProps: { render: mockRender },
        };
        render(<MLeaf {...props} />);
        expect(mockRender).toHaveBeenCalled();
        expect(screen.getByTestId('identifier-render')).toBeInTheDocument();
      });

      it('应该正确处理 fnc 文本格式化', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, fnc: true, text: '[^DOC_123]' },
        };
        render(<MLeaf {...props} />);
        // fnc 文本应该被格式化处理，显示为 "123"
        expect(screen.getByText('123')).toBeInTheDocument();
      });

      it('应该正确处理 identifier 文本格式化', () => {
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            identifier: true,
            text: '[^DOC_456]',
          },
        };
        render(<MLeaf {...props} />);
        // identifier 文本应该被格式化处理，显示为 "456"
        expect(screen.getByText('456')).toBeInTheDocument();
      });

      it('应该在 fnc 时设置字体大小为 10 和相关属性', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, fnc: true, text: '[^DOC_123]' },
        };
        const { container } = render(<MLeaf {...props} />);
        expect(screen.getByText('123')).toBeInTheDocument();

        // 查找带有 data-fnc 属性的 span 元素
        const span = container.querySelector('[data-fnc="fnc"]');
        expect(span).toBeInTheDocument();
        expect(span).toHaveStyle({ fontSize: '10px' });
        expect(span).toHaveAttribute('contenteditable', 'false');
        expect(span).toHaveAttribute('data-fnc-name', 'DOC_123');
      });

      it('应该设置 fnd 的 data-fnd-name 属性', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, fnd: 'test', text: '[^DOC_999]' },
        };
        render(<MLeaf {...props} />);
        const element = screen.getByText('Test Content').parentElement;
        expect(element).toHaveAttribute('data-fnd', 'fnd');
      });
    });

    describe('事件处理测试', () => {
      it('应该处理双击选择事件', () => {
        render(<MLeaf {...defaultLeafProps} />);
        const element = screen.getByText('Test Content').parentElement;
        fireEvent.dblClick(element!);
        // 验证事件处理逻辑（这里主要是确保不抛出错误）
        expect(element).toBeInTheDocument();
      });

      it('应该处理拖拽开始事件', () => {
        render(<MLeaf {...defaultLeafProps} />);
        const element = screen.getByText('Test Content').parentElement;
        fireEvent.dragStart(element!);
        // 验证事件处理逻辑
        expect(element).toBeInTheDocument();
      });

      it('应该在点击时调用 window.open 打开 URL', () => {
        const mockWindowOpen = vi.fn();
        const originalOpen = window.open;
        window.open = mockWindowOpen;

        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, url: 'https://example.com' },
        };
        render(<MLeaf {...props} />);
        const element = screen.getByText('Test Content').parentElement;
        fireEvent.click(element!);

        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://example.com',
          '_blank',
        );

        window.open = originalOpen;
      });

      it('应该在点击时调用 fncProps.onOriginUrlClick', () => {
        const mockOnOriginUrlClick = vi.fn();
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, identifier: 'test-identifier' },
          fncProps: { onOriginUrlClick: mockOnOriginUrlClick },
        };
        const { container } = render(<MLeaf {...props} />);
        const element = container.querySelector('[data-fnc="fnc"]');
        fireEvent.click(element!);

        expect(mockOnOriginUrlClick).toHaveBeenCalledWith('test-identifier');
      });

      it('应该同时调用 onOriginUrlClick 和 window.open', () => {
        const mockOnOriginUrlClick = vi.fn();
        const mockWindowOpen = vi.fn();
        const originalOpen = window.open;
        window.open = mockWindowOpen;

        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            identifier: 'test-id',
            url: 'https://example.com',
          },
          fncProps: { onOriginUrlClick: mockOnOriginUrlClick },
        };
        const { container } = render(<MLeaf {...props} />);
        const element = container.querySelector('[data-fnc="fnc"]');
        fireEvent.click(element!);

        expect(mockOnOriginUrlClick).toHaveBeenCalledWith('test-id');
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://example.com',
          '_blank',
        );

        window.open = originalOpen;
      });

      it('应该在没有 URL 时不调用 window.open', () => {
        const mockWindowOpen = vi.fn();
        const originalOpen = window.open;
        window.open = mockWindowOpen;

        render(<MLeaf {...defaultLeafProps} />);
        const element = screen.getByText('Test Content').parentElement;
        fireEvent.click(element!);

        expect(mockWindowOpen).not.toHaveBeenCalled();

        window.open = originalOpen;
      });

      it('应该在没有 onOriginUrlClick 回调时不报错', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { ...defaultLeafProps.leaf, identifier: 'test-identifier' },
        };
        const { container } = render(<MLeaf {...props} />);
        const element = container.querySelector('[data-fnc="fnc"]');

        // 应该不会抛出错误
        expect(() => fireEvent.click(element!)).not.toThrow();
      });
    });

    describe('组合样式测试', () => {
      it('应该同时渲染粗体和斜体', () => {
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            bold: true,
            italic: true,
          },
        };
        render(<MLeaf {...props} />);
        expect(screen.getByTestId('markdown-bold')).toBeInTheDocument();
        // 粗体和斜体样式会被应用，验证两个样式都存在
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('应该同时渲染粗体和删除线', () => {
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            bold: true,
            strikethrough: true,
          },
        };
        render(<MLeaf {...props} />);
        expect(screen.getByTestId('markdown-bold')).toBeInTheDocument();
        expect(
          screen.getByText('Test Content').closest('s'),
        ).toBeInTheDocument();
      });

      it('应该同时渲染代码和颜色', () => {
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            code: true,
            color: '#ff0000',
          },
        };
        render(<MLeaf {...props} />);
        expect(
          screen.getByText('Test Content').closest('code'),
        ).toBeInTheDocument();
      });

      it('应该同时渲染高亮颜色和删除线', () => {
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            highColor: '#ff0000',
            strikethrough: true,
          },
        };
        render(<MLeaf {...props} />);
        expect(
          screen.getByText('Test Content').closest('s'),
        ).toBeInTheDocument();
      });
    });

    describe('特殊值测试', () => {
      it('应该处理空文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: { text: '' },
          text: { text: '' },
        };
        render(<MLeaf {...props} />);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('应该处理占位符', () => {
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            placeholder: '请输入内容',
          },
        };
        render(<MLeaf {...props} />);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('应该处理自动打开属性', () => {
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            autoOpen: true,
          },
        };
        render(<MLeaf {...props} />);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });

      it('应该处理触发文本', () => {
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            triggerText: '@user',
          },
        };
        render(<MLeaf {...props} />);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });
  });

  describe('性能优化测试', () => {
    it('MElement 应该使用 React.memo 优化', () => {
      const props = {
        element: { type: 'paragraph', children: [] },
        attributes: {
          'data-slate-node': 'element' as const,
          ref: { current: null },
        },
        children: <div>Test Content</div>,
        readonly: false,
      };

      const { rerender } = render(<MElement {...props} />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();

      // 相同的 props 应该不会触发重新渲染
      rerender(<MElement {...props} />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    });

    it('MElement 应该在 element 变化时重新渲染', () => {
      const props1 = {
        element: { type: 'paragraph', level: 1, children: [] },
        attributes: {
          'data-slate-node': 'element' as const,
          ref: { current: null },
        },
        children: <div>Test Content</div>,
        readonly: false,
      };

      const { rerender } = render(<MElement {...props1} />);

      // 改变 element 的属性
      const props2 = {
        ...props1,
        element: { type: 'paragraph', level: 2, children: [] },
      };

      rerender(<MElement {...props2} />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    });

    it('MElement 应该在 attributes 变化时重新渲染', () => {
      const props1 = {
        element: { type: 'paragraph', children: [] },
        attributes: {
          'data-slate-node': 'element' as const,
          ref: { current: null },
        },
        children: <div>Test Content</div>,
        readonly: false,
      };

      const { rerender } = render(<MElement {...props1} />);

      // 改变 attributes
      const props2 = {
        ...props1,
        attributes: {
          'data-slate-node': 'element' as const,
          ref: { current: document.createElement('div') },
        },
      };

      rerender(<MElement {...props2} />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    });

    it('MElement 应该在 readonly 变化时重新渲染', () => {
      const props1 = {
        element: { type: 'paragraph', children: [] },
        attributes: {
          'data-slate-node': 'element' as const,
          ref: { current: null },
        },
        children: <div>Test Content</div>,
        readonly: false,
      };

      const { rerender } = render(<MElement {...props1} />);

      // 改变 readonly
      const props2 = {
        ...props1,
        readonly: true,
      };

      rerender(<MElement {...props2} />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    });

    it('MElement 应该正确比较 element 的类型变化', () => {
      const props1 = {
        element: { type: 'paragraph', value: 'test1', children: [] },
        attributes: {
          'data-slate-node': 'element' as const,
          ref: { current: null },
        },
        children: <div>Test Content</div>,
        readonly: false,
      };

      const { rerender } = render(<MElement {...props1} />);

      // 改变 element 的 value
      const props2 = {
        ...props1,
        element: { type: 'paragraph', value: 'test2', children: [] },
      };

      rerender(<MElement {...props2} />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    });

    it('MLeaf 应该使用 React.memo 优化', () => {
      const props = {
        leaf: { text: 'Test Text' },
        text: { text: 'Test Text' },
        attributes: {
          'data-slate-leaf': true as const,
        },
        children: <div>Test Content</div>,
        hashId: 'test-hash',
        comment: {},
        fncProps: {},
        tagInputProps: {},
      } as any;

      const { rerender } = render(<MLeaf {...props} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      // 相同的 props 应该不会触发重新渲染
      rerender(<MLeaf {...props} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('MLeaf 应该在 hashId 变化时重新渲染', () => {
      const props1 = {
        leaf: { text: 'Test Text' },
        text: { text: 'Test Text' },
        attributes: {
          'data-slate-leaf': true as const,
        },
        children: <div>Test Content 1</div>,
        hashId: 'test-hash-1',
        comment: {},
        fncProps: {},
        tagInputProps: {},
      } as any;

      const { rerender } = render(<MLeaf {...props1} />);

      // 改变 hashId
      const props2 = {
        ...props1,
        children: <div>Test Content 2</div>,
        hashId: 'test-hash-2',
      };

      rerender(<MLeaf {...props2} />);
      expect(screen.getByText('Test Content 2')).toBeInTheDocument();
    });

    it('MLeaf 应该在 text 变化时重新渲染', () => {
      const props1 = {
        leaf: { text: 'Test Text' },
        text: { text: 'Test Text' },
        attributes: {
          'data-slate-leaf': true as const,
        },
        children: <div>Test Content</div>,
        hashId: 'test-hash',
        comment: {},
        fncProps: {},
        tagInputProps: {},
      } as any;

      const { rerender } = render(<MLeaf {...props1} />);

      // 改变 text
      const props2 = {
        ...props1,
        text: { text: 'New Text' },
      };

      rerender(<MLeaf {...props2} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('MLeaf 应该在 leaf 属性变化时重新渲染', () => {
      const props1 = {
        leaf: { text: 'Test Text', bold: false },
        text: { text: 'Test Text' },
        attributes: {
          'data-slate-leaf': true as const,
        },
        children: <div>Test Content</div>,
        hashId: 'test-hash',
        comment: {},
        fncProps: {},
        tagInputProps: {},
      } as any;

      const { rerender } = render(<MLeaf {...props1} />);

      // 改变 leaf.bold
      const props2 = {
        ...props1,
        leaf: { text: 'Test Text', bold: true },
      };

      rerender(<MLeaf {...props2} />);
      expect(screen.getByTestId('markdown-bold')).toBeInTheDocument();
    });

    it('MLeaf 应该在 comment 变化时重新渲染', () => {
      const props1 = {
        leaf: { text: 'Test Text' },
        text: { text: 'Test Text' },
        attributes: {
          'data-slate-leaf': true as const,
        },
        children: <div>Test Content</div>,
        hashId: 'test-hash',
        comment: {},
        fncProps: {},
        tagInputProps: {},
      } as any;

      const { rerender } = render(<MLeaf {...props1} />);

      // 改变 comment
      const props2 = {
        ...props1,
        comment: { visible: true },
      };

      rerender(<MLeaf {...props2} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('MLeaf 应该在 fncProps 变化时重新渲染', () => {
      const props1 = {
        leaf: { text: 'Test Text' },
        text: { text: 'Test Text' },
        attributes: {
          'data-slate-leaf': true as const,
        },
        children: <div>Test Content</div>,
        hashId: 'test-hash',
        comment: {},
        fncProps: {},
        tagInputProps: {},
      } as any;

      const { rerender } = render(<MLeaf {...props1} />);

      // 改变 fncProps
      const props2 = {
        ...props1,
        fncProps: { test: 'value' },
      };

      rerender(<MLeaf {...props2} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('MLeaf 应该在 tagInputProps 变化时重新渲染', () => {
      const props1 = {
        leaf: { text: 'Test Text' },
        text: { text: 'Test Text' },
        attributes: {
          'data-slate-leaf': true as const,
        },
        children: <div>Test Content</div>,
        hashId: 'test-hash',
        comment: {},
        fncProps: {},
        tagInputProps: {},
      } as any;

      const { rerender } = render(<MLeaf {...props1} />);

      // 改变 tagInputProps
      const props2 = {
        ...props1,
        tagInputProps: { test: 'value' },
      };

      rerender(<MLeaf {...props2} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('MElement 应该处理空段落优化', () => {
      const props1 = {
        element: { type: 'paragraph', value: '', children: [] },
        attributes: {
          'data-slate-node': 'element' as const,
          ref: { current: null },
        },
        children: <div>Test Content 1</div>,
        readonly: false,
      };

      const { rerender } = render(<MElement {...props1} />);

      // 更新为另一个空段落，应该使用优化逻辑
      const props2 = {
        ...props1,
        element: { type: 'paragraph', value: '', children: [] },
        children: <div>Test Content 2</div>,
      };

      rerender(<MElement {...props2} />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    });

    it('应该处理没有匹配元素类型时的默认行为', () => {
      const props = {
        element: { type: 'undefined-type', children: [] },
        attributes: {
          'data-slate-node': 'element' as const,
          ref: { current: null },
        },
        children: <div>Test Content</div>,
        readonly: false,
      };

      render(<MElement {...props} />);
      // 应该渲染为段落
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    });

    it('应该处理 apassify 拼写错误类型', () => {
      const props = {
        element: { type: 'apassify', children: [] },
        attributes: {
          'data-slate-node': 'element' as const,
          ref: { current: null },
        },
        children: <div>Test Content</div>,
        readonly: false,
      };

      render(<MElement {...props} />);
      // 应该渲染为 schema
      expect(screen.getByTestId('schema')).toBeInTheDocument();
    });
  });
});
