import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MElement,
  MLeaf,
} from '../../../../src/MarkdownEditor/editor/elements';
import { EditorUtils } from '../../../../src/MarkdownEditor/editor/utils/editorUtils';

const elementStubs = vi.hoisted(() => {
  const box =
    (testId: string) =>
    ({ children, ...props }: Record<string, unknown>) =>
      (
        <div data-testid={testId} {...props}>
          {children}
        </div>
      );
  return { box };
});

// Mock 依赖
vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
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
  })),
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
  WarpCard: elementStubs.box('warp-card'),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Comment', () => ({
  CommentView: elementStubs.box('comment-view'),
}));

vi.mock(
  '../../../../src/MarkdownEditor/editor/elements/FootnoteDefinition',
  () => ({
    FootnoteDefinition: elementStubs.box('footnote-definition'),
  }),
);

vi.mock(
  '../../../../src/MarkdownEditor/editor/elements/FootnoteReference',
  () => ({
    FootnoteReference: elementStubs.box('footnote-reference'),
  }),
);

vi.mock('../../../../src/MarkdownEditor/editor/elements/Image', () => ({
  EditorImage: elementStubs.box('editor-image'),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/LinkCard', () => ({
  LinkCard: elementStubs.box('link-card'),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/List', () => ({
  List: elementStubs.box('list'),
  ListItem: elementStubs.box('list-item'),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Media', () => ({
  Media: elementStubs.box('media'),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Paragraph', () => ({
  Paragraph: elementStubs.box('paragraph'),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Schema', () => ({
  Schema: elementStubs.box('schema'),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/TagPopup', () => ({
  TagPopup: ({ children, onSelect, ...props }: Record<string, unknown>) => {
    (window as any).__lastTagPopupOnSelect = onSelect;
    return (
      <div data-testid="tag-popup" {...props}>
        {children}
      </div>
    );
  },
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Blockquote', () => ({
  Blockquote: elementStubs.box('blockquote'),
}));

vi.mock('../../../../src/MarkdownEditor/editor/elements/Head', () => ({
  Head: elementStubs.box('head'),
}));

// Mock Ant Design components
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
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
    theme: {
      ...actual.theme,
      useToken: vi.fn(() => ({
        token: {},
        hashId: '',
        theme: {},
      })),
    },
  };
});

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
      const mElementRouteCases = [
        ['paragraph', 'paragraph', {}],
        ['blockquote', 'blockquote', {}],
        ['head', 'head', { level: 1 }],
        ['link-card', 'link-card', {}],
        ['list', 'list', {}],
        ['list-item', 'list-item', {}],
        ['media', 'media', {}],
        ['image', 'editor-image', {}],
        ['footnoteDefinition', 'footnote-definition', {}],
        ['footnoteReference', 'footnote-reference', {}],
        ['card', 'warp-card', {}],
        ['schema', 'schema', {}],
        ['apaasify', 'schema', {}],
        ['unknown-type', 'paragraph', {}],
        ['undefined-type', 'paragraph', {}],
        ['apassify', 'schema', {}],
      ] as const;

      it.each(mElementRouteCases)(
        'MElement 将 type=%s 路由到 %s',
        (elementType, expectedTestId, extra) => {
          const props = {
            ...defaultElementProps,
            element: { type: elementType, children: [], ...extra },
          };
          render(<MElement {...props} />);
          expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
        },
      );
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

      it.each(['katex', 'inline-katex'] as const)(
        '应该渲染 %s 并展示公式',
        (elementType) => {
          const props = {
            ...defaultElementProps,
            element: { type: elementType, value: 'x^2', children: [] },
          };
          render(<MElement {...props} />);
          expect(screen.getByText('x^2')).toBeInTheDocument();
        },
      );

      it('应该渲染 Mermaid 与 code 块占位', () => {
        for (const type of ['mermaid', 'code'] as const) {
          const props = {
            ...defaultElementProps,
            element: { type, children: [] },
          };
          const { unmount } = render(<MElement {...props} />);
          expect(screen.getByText('Test Content')).toBeInTheDocument();
          unmount();
        }
      });

      it.each([
        ['card-before', 'card-before'],
        ['card-after', 'card-after'],
      ] as const)('卡片 %s 在可编辑与只读下的显示', (elementType, dataBe) => {
        const element = { type: elementType, children: [] };
        const { unmount } = render(
          <MElement {...defaultElementProps} element={element} readonly={false} />,
        );
        let el = screen.getByText('Test Content').parentElement;
        expect(el).toHaveAttribute('data-be', dataBe);
        expect(el).toHaveStyle({ display: 'inline-block' });
        unmount();
        const { unmount: unmountReadonly } = render(
          <MElement {...defaultElementProps} element={element} readonly />,
        );
        el = screen.getByText('Test Content').parentElement;
        expect(el).toHaveStyle({ display: 'none' });
        unmountReadonly();
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

      it('应该渲染 tag+code 只读时为 code 样式不渲染 TagPopup', () => {
        const props = {
          ...defaultLeafProps,
          readonly: true,
          leaf: { ...defaultLeafProps.leaf, tag: true, code: true, text: 'x' },
          tagInputProps: { enable: true },
        };
        render(<MLeaf {...props} />);
        expect(
          screen.getByText('Test Content').closest('code'),
        ).toBeInTheDocument();
        expect(screen.queryByTestId('tag-popup')).not.toBeInTheDocument();
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

      it('jinjaDelimiter 与 jinjaPlaceholder 追加类名 (568-572)', () => {
        const props = {
          ...defaultLeafProps,
          leaf: {
            ...defaultLeafProps.leaf,
            jinjaDelimiter: true,
            jinjaPlaceholder: true,
          },
        };
        const { container } = render(<MLeaf {...props} />);
        const span = container.querySelector('[data-be="text"]');
        expect(span?.className).toContain('jinja-delimiter');
        expect(span?.className).toContain('jinja-placeholder');
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
      it('带 url 时在只读与非只读下均可渲染', () => {
        const leaf = {
          ...defaultLeafProps.leaf,
          url: 'https://example.com',
        };
        const { rerender } = render(
          <MLeaf {...defaultLeafProps} readonly leaf={leaf} />,
        );
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        rerender(<MLeaf {...defaultLeafProps} readonly={false} leaf={leaf} />);
        expect(
          screen.getByText('Test Content').parentElement,
        ).toHaveAttribute('data-be', 'text');
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
      it('双击、拖拽与 isDirtLeaf 双击选区', () => {
        const { unmount } = render(<MLeaf {...defaultLeafProps} />);
        const el = screen.getByText('Test Content').parentElement!;
        fireEvent.dblClick(el);
        fireEvent.dragStart(el);
        expect(el).toBeInTheDocument();
        unmount();

        vi.mocked(EditorUtils.isDirtLeaf).mockReturnValueOnce(true);
        const { container, unmount: u2 } = render(
          <MLeaf {...defaultLeafProps} />,
        );
        const span = container.querySelector('[data-be="text"]');
        expect(span).toBeTruthy();
        fireEvent.click(span!, { detail: 2 });
        expect(EditorUtils.isDirtLeaf).toHaveBeenCalled();
        u2();
      });

      it('点击：url 触发 window.open；无 url 不打开；fnc 行回调与组合', () => {
        const openMock = vi.fn();
        const originalOpen = window.open;
        window.open = openMock;
        try {
          const urlProps = {
            ...defaultLeafProps,
            leaf: { ...defaultLeafProps.leaf, url: 'https://example.com' },
          };
          const { unmount: u1 } = render(<MLeaf {...urlProps} />);
          fireEvent.click(screen.getByText('Test Content').parentElement!);
          expect(openMock).toHaveBeenCalledWith('https://example.com', '_blank');
          u1();
          openMock.mockClear();

          const { unmount: u2 } = render(<MLeaf {...defaultLeafProps} />);
          fireEvent.click(screen.getByText('Test Content').parentElement!);
          expect(openMock).not.toHaveBeenCalled();
          u2();

          const onOrigin = vi.fn();
          const { container: c3, unmount: u3 } = render(
            <MLeaf
              {...defaultLeafProps}
              leaf={{
                ...defaultLeafProps.leaf,
                identifier: 'test-identifier',
              }}
              fncProps={{ onOriginUrlClick: onOrigin }}
            />,
          );
          fireEvent.click(c3.querySelector('[data-fnc="fnc"]')!);
          expect(onOrigin).toHaveBeenCalledWith('test-identifier');
          u3();

          const onOrigin2 = vi.fn();
          const { container: c4, unmount: u4 } = render(
            <MLeaf
              {...defaultLeafProps}
              leaf={{
                ...defaultLeafProps.leaf,
                identifier: 'test-id',
                url: 'https://example.com',
              }}
              fncProps={{ onOriginUrlClick: onOrigin2 }}
            />,
          );
          openMock.mockClear();
          fireEvent.click(c4.querySelector('[data-fnc="fnc"]')!);
          expect(onOrigin2).toHaveBeenCalledWith('test-id');
          expect(openMock).toHaveBeenCalledWith('https://example.com', '_blank');
          u4();

          const { container: c5, unmount: u5 } = render(
            <MLeaf
              {...defaultLeafProps}
              leaf={{
                ...defaultLeafProps.leaf,
                identifier: 'test-identifier',
              }}
            />,
          );
          expect(() =>
            fireEvent.click(c5.querySelector('[data-fnc="fnc"]')!),
          ).not.toThrow();
          u5();
        } finally {
          window.open = originalOpen;
        }
      });
    });

    describe('组合样式测试', () => {
      it('粗体+斜体、粗体+删除线、代码+颜色、高亮+删除线', () => {
        const comboCases = [
          {
            leaf: { bold: true, italic: true },
            assert: () => {
              expect(screen.getByTestId('markdown-bold')).toBeInTheDocument();
              expect(screen.getByText('Test Content')).toBeInTheDocument();
            },
          },
          {
            leaf: { bold: true, strikethrough: true },
            assert: () => {
              expect(screen.getByTestId('markdown-bold')).toBeInTheDocument();
              expect(
                screen.getByText('Test Content').closest('s'),
              ).toBeInTheDocument();
            },
          },
          {
            leaf: { code: true, color: '#ff0000' },
            assert: () => {
              expect(
                screen.getByText('Test Content').closest('code'),
              ).toBeInTheDocument();
            },
          },
          {
            leaf: { highColor: '#ff0000', strikethrough: true },
            assert: () => {
              expect(
                screen.getByText('Test Content').closest('s'),
              ).toBeInTheDocument();
            },
          },
        ] as const;

        for (const { leaf, assert } of comboCases) {
          const { unmount } = render(
            <MLeaf
              {...defaultLeafProps}
              leaf={{ ...defaultLeafProps.leaf, ...leaf }}
            />,
          );
          assert();
          unmount();
        }
      });
    });

    describe('特殊值测试', () => {
      it('空文本、placeholder、autoOpen、triggerText 仍渲染子节点', () => {
        const cases = [
          { leaf: { text: '' }, text: { text: '' } },
          { leaf: { ...defaultLeafProps.leaf, placeholder: '请输入内容' } },
          { leaf: { ...defaultLeafProps.leaf, autoOpen: true } },
          { leaf: { ...defaultLeafProps.leaf, triggerText: '@user' } },
        ];
        for (const patch of cases) {
          const { unmount } = render(
            <MLeaf {...defaultLeafProps} {...patch} />,
          );
          expect(screen.getByText('Test Content')).toBeInTheDocument();
          unmount();
        }
      });
    });
  });

  describe('性能优化测试', () => {
    it('MElement：memo 与 element、attributes、readonly、value 变更后仍渲染 paragraph', () => {
      const baseAttrs = {
        'data-slate-node': 'element' as const,
        ref: { current: null },
      };
      const propsStable = {
        element: { type: 'paragraph', children: [] },
        attributes: { ...baseAttrs },
        children: <div>Test Content</div>,
        readonly: false,
      };

      const { rerender } = render(<MElement {...propsStable} />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
      rerender(<MElement {...propsStable} />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();

      rerender(
        <MElement
          {...propsStable}
          element={{ type: 'paragraph', level: 1, children: [] }}
        />,
      );
      rerender(
        <MElement
          {...propsStable}
          element={{ type: 'paragraph', level: 2, children: [] }}
        />,
      );
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();

      rerender(
        <MElement
          {...propsStable}
          attributes={{
            ...baseAttrs,
            ref: { current: document.createElement('div') },
          }}
        />,
      );
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();

      rerender(<MElement {...propsStable} readonly />);
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();

      rerender(
        <MElement
          {...propsStable}
          element={{ type: 'paragraph', value: 'test1', children: [] }}
        />,
      );
      rerender(
        <MElement
          {...propsStable}
          element={{ type: 'paragraph', value: 'test2', children: [] }}
        />,
      );
      expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    });

    it('MLeaf：memo 与 hashId、text、leaf、comment、fncProps、tagInputProps、attributes、readonly、linkConfig 变更', () => {
      const leafBase = {
        leaf: { text: 'Test Text' },
        text: { text: 'Test Text' },
        attributes: { 'data-slate-leaf': true as const },
        children: <div>Test Content</div>,
        hashId: 'test-hash',
        comment: {},
        fncProps: {},
        tagInputProps: {},
      } as any;

      const { rerender } = render(<MLeaf {...leafBase} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      rerender(<MLeaf {...leafBase} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      rerender(
        <MLeaf
          {...leafBase}
          children={<div>Test Content 1</div>}
          hashId="test-hash-1"
        />,
      );
      rerender(
        <MLeaf
          {...leafBase}
          children={<div>Test Content 2</div>}
          hashId="test-hash-2"
        />,
      );
      expect(screen.getByText('Test Content 2')).toBeInTheDocument();

      rerender(<MLeaf {...leafBase} />);
      rerender(<MLeaf {...leafBase} text={{ text: 'New Text' }} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      rerender(
        <MLeaf {...leafBase} leaf={{ text: 'Test Text', bold: false }} />,
      );
      rerender(
        <MLeaf {...leafBase} leaf={{ text: 'Test Text', bold: true }} />,
      );
      expect(screen.getByTestId('markdown-bold')).toBeInTheDocument();

      rerender(<MLeaf {...leafBase} />);
      rerender(<MLeaf {...leafBase} comment={{ visible: true }} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      rerender(<MLeaf {...leafBase} />);
      rerender(<MLeaf {...leafBase} fncProps={{ test: 'value' }} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      rerender(<MLeaf {...leafBase} />);
      rerender(<MLeaf {...leafBase} tagInputProps={{ test: 'value' }} />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      rerender(<MLeaf {...leafBase} />);
      rerender(
        <MLeaf
          {...leafBase}
          attributes={{ 'data-slate-leaf': true as const, 'data-other': 'x' }}
        />,
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      rerender(
        <MLeaf
          {...leafBase}
          readonly={false}
          attributes={{ 'data-slate-leaf': true as const }}
        />,
      );
      rerender(
        <MLeaf
          {...leafBase}
          readonly
          attributes={{ 'data-slate-leaf': true as const }}
        />,
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      rerender(<MLeaf {...leafBase} linkConfig={{}} />);
      rerender(
        <MLeaf {...leafBase} linkConfig={{ openInNewTab: false }} />,
      );
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

  });

  describe('areDepsEqual 函数测试', () => {
    it('覆盖 deps 相等、undefined、长度变化、内容与一方缺失', () => {
      const base = {
        element: { type: 'paragraph', children: [] },
        attributes: {},
        children: <div>Test</div>,
      } as any;

      const rerenderCases: Array<[any, any]> = [
        [{ ...base, deps: ['dep1', 'dep2'] }, { ...base, deps: ['dep1', 'dep2'] }],
        [{ ...base }, { ...base }],
        [{ ...base, deps: ['dep1'] }, { ...base, deps: ['dep1', 'dep2'] }],
        [{ ...base }, { ...base, deps: ['only-next'] }],
        [{ ...base, deps: ['a', 'b'] }, { ...base, deps: ['a', 'c'] }],
      ];

      const { rerender } = render(<MElement {...rerenderCases[0][0]} />);
      for (const [a, b] of rerenderCases) {
        rerender(<MElement {...a} />);
        rerender(<MElement {...b} />);
        expect(screen.getByText('Test')).toBeInTheDocument();
      }
    });
  });

  describe('MLeafComponent 测试', () => {
    it('应该处理 tag onSelect 回调中的条件判断', () => {
      const props = {
        leaf: {
          text: 'test',
          tag: true,
          code: true,
        },
        attributes: {},
        children: <span>test</span>,
        readonly: false,
        text: 'test',
        tagInputProps: {
          enable: true,
          tagTextRender: vi.fn((props: any, text: any) => text),
        },
        fncProps: {},
        comment: undefined,
        linkConfig: {},
      } as any;

      render(<MLeaf {...props} />);
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('应该处理 selectFormat 函数', async () => {
      const editorUtilsModule =
        await import('../../../../src/MarkdownEditor/editor/utils/editorUtils');
      const mockIsDirtLeaf = vi.mocked(
        editorUtilsModule.EditorUtils.isDirtLeaf,
      );
      mockIsDirtLeaf.mockReturnValueOnce(true);

      const slate = await import('slate');
      const selectSpy = vi
        .spyOn(slate.Transforms, 'select')
        .mockImplementation(() => {});
      vi.spyOn(slate.Editor, 'start').mockReturnValue({
        path: [0, 0],
        offset: 0,
      } as any);
      vi.spyOn(slate.Editor, 'end').mockReturnValue({
        path: [0, 0],
        offset: 4,
      } as any);

      const props = {
        leaf: { text: 'test' },
        attributes: {},
        children: <span>test</span>,
        readonly: false,
        text: { type: 'text', text: 'test' },
        tagInputProps: {},
        fncProps: {},
        comment: undefined,
        linkConfig: {},
      } as any;

      const { container } = render(<MLeaf {...props} />);
      const span = container.querySelector('span[data-be="text"]');
      expect(span).toBeInTheDocument();
      if (span) fireEvent.dblClick(span);
      selectSpy.mockRestore();
    });

    it('应该处理 linkConfig.onClick 返回 false 的情况', () => {
      const props = {
        leaf: {
          text: 'test',
          url: 'http://example.com',
        },
        attributes: {},
        children: <span>test</span>,
        readonly: false,
        tagInputProps: {},
        fncProps: {},
        comment: undefined,
        linkConfig: {
          onClick: vi.fn(() => false),
          openInNewTab: true,
        },
      } as any;

      const { container } = render(<MLeaf {...props} />);
      const span = container.querySelector('span[data-be="text"]');
      if (span) {
        fireEvent.click(span);
      }
      expect(span).toBeInTheDocument();
    });

    it('应该处理 linkConfig.openInNewTab 为 false 的情况', () => {
      // window.location 是只读的，不能直接重新定义
      // 我们主要验证组件渲染和点击事件，而不是验证 location.href 的赋值
      // 因为在实际代码中，window.location.href = url 会触发导航，这在测试环境中很难验证
      const props = {
        leaf: {
          text: 'test',
          url: 'http://example.com',
        },
        attributes: {},
        children: <span>test</span>,
        readonly: false,
        tagInputProps: {},
        fncProps: {},
        comment: undefined,
        linkConfig: {
          openInNewTab: false,
        },
      } as any;

      const { container } = render(<MLeaf {...props} />);
      const span = container.querySelector('span[data-be="text"]');
      if (span) {
        fireEvent.click(span);
      }
      // 验证组件已渲染，点击事件已触发
      // 注意：我们无法直接验证 window.location.href 的赋值，因为它是只读的
      expect(span).toBeInTheDocument();
    });

    it('应该处理 hasFnc 和 hasComment 的情况', () => {
      const props = {
        leaf: {
          text: 'test',
          fnc: true,
          comment: 'test comment',
        },
        attributes: {},
        children: <span>test</span>,
        readonly: false,
        text: 'test',
        tagInputProps: {},
        fncProps: {},
        comment: 'test comment',
        linkConfig: {},
      } as any;

      render(<MLeaf {...props} />);
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('应该在有 comment 无 fnc 时用 CommentLeaf 包裹普通 dom', () => {
      const props = {
        leaf: { text: 'plain', comment: 'c1' },
        attributes: {},
        children: <span>plain</span>,
        readonly: false,
        text: 'plain',
        tagInputProps: {},
        fncProps: {},
        comment: 'c1',
        linkConfig: {},
      } as any;
      render(<MLeaf {...props} />);
      expect(screen.getByTestId('comment-view')).toBeInTheDocument();
      expect(screen.getByText('plain')).toBeInTheDocument();
    });

    it('TagPopup onSelect 被调用时执行 Editor/Transforms 逻辑', async () => {
      const slate = await import('slate');
      const withoutNormalizingSpy = vi
        .spyOn(slate.Editor, 'withoutNormalizing')
        .mockImplementation((_e: any, fn: () => void) => fn());
      const deleteSpy = vi
        .spyOn(slate.Transforms, 'delete')
        .mockImplementation(() => {});
      const insertTextSpy = vi
        .spyOn(slate.Transforms, 'insertText')
        .mockImplementation(() => {});
      const setNodesSpy = vi
        .spyOn(slate.Transforms, 'setNodes')
        .mockImplementation(() => {});
      const insertNodesSpy = vi
        .spyOn(slate.Transforms, 'insertNodes')
        .mockImplementation(() => {});
      const selectSpy = vi
        .spyOn(slate.Transforms, 'select')
        .mockImplementation(() => {});
      vi.spyOn(slate.Editor, 'start').mockReturnValue({
        path: [0, 0],
        offset: 0,
      } as any);
      vi.spyOn(slate.Editor, 'end').mockReturnValue({
        path: [0, 0],
        offset: 1,
      } as any);
      vi.spyOn(slate.Path, 'previous').mockReturnValue([0, -1] as any);
      vi.spyOn(slate.Path, 'next').mockReturnValue([0, 1] as any);
      vi.spyOn(slate.Editor, 'hasPath').mockReturnValue(false);

      const mockEditor = {
        focus: vi.fn(),
        withoutNormalizing: (fn: () => void) => fn(),
      };
      const storeModule =
        await import('../../../../src/MarkdownEditor/editor/store');
      (storeModule.useEditorStore as ReturnType<typeof vi.fn>).mockReturnValue({
        markdownEditorRef: { current: mockEditor as any },
        markdownContainerRef: { current: document.createElement('div') },
        readonly: false,
        store: {
          dragStart: vi.fn(),
          isLatestNode: vi.fn().mockReturnValue(false),
        },
        typewriter: false,
        editorProps: { titlePlaceholderContent: '...' },
      } as any);

      const props = {
        leaf: { text: 't', tag: true, code: true },
        attributes: {},
        children: <span>t</span>,
        readonly: false,
        text: 't',
        tagInputProps: {
          enable: true,
          tagTextRender: (_p: any, t: string) => t,
        },
        fncProps: {},
        comment: undefined,
        linkConfig: {},
      } as any;

      render(<MLeaf {...props} />);
      expect(screen.getByTestId('tag-popup')).toBeInTheDocument();

      const onSelect = (window as any).__lastTagPopupOnSelect as
        | ((v: string, path: number[], tagNode?: any) => void)
        | undefined;
      expect(onSelect).toBeDefined();
      onSelect!('val', [0, 0], {});
      await new Promise((r) => setTimeout(r, 30));

      expect(withoutNormalizingSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
      expect(insertTextSpy).toHaveBeenCalled();
      expect(setNodesSpy).toHaveBeenCalled();
      expect(insertNodesSpy).toHaveBeenCalled();

      withoutNormalizingSpy.mockRestore();
      deleteSpy.mockRestore();
      insertTextSpy.mockRestore();
      setNodesSpy.mockRestore();
      insertNodesSpy.mockRestore();
      selectSpy.mockRestore();
    });

    it('TagPopup onSelect 在 hasPath 为 true 时走 Transforms.select 分支', async () => {
      const slate = await import('slate');
      vi.spyOn(slate.Editor, 'withoutNormalizing').mockImplementation(
        (_e: any, fn: () => void) => fn(),
      );
      vi.spyOn(slate.Transforms, 'delete').mockImplementation(() => {});
      vi.spyOn(slate.Transforms, 'insertText').mockImplementation(() => {});
      vi.spyOn(slate.Transforms, 'setNodes').mockImplementation(() => {});
      vi.spyOn(slate.Transforms, 'insertNodes').mockImplementation(() => {});
      const selectSpy = vi
        .spyOn(slate.Transforms, 'select')
        .mockImplementation(() => {});
      vi.spyOn(slate.Editor, 'start').mockReturnValue({
        path: [0, 0],
        offset: 0,
      } as any);
      vi.spyOn(slate.Editor, 'end').mockReturnValue({
        path: [0, 0],
        offset: 1,
      } as any);
      vi.spyOn(slate.Path, 'previous').mockReturnValue([0, -1] as any);
      vi.spyOn(slate.Path, 'next').mockReturnValue([0, 1] as any);
      vi.spyOn(slate.Editor, 'hasPath').mockReturnValue(true);

      const mockEditor = {
        focus: vi.fn(),
        withoutNormalizing: (fn: () => void) => fn(),
      };
      const storeModule3 =
        await import('../../../../src/MarkdownEditor/editor/store');
      (storeModule3.useEditorStore as ReturnType<typeof vi.fn>).mockReturnValue(
        {
          markdownEditorRef: { current: mockEditor as any },
          markdownContainerRef: { current: document.createElement('div') },
          readonly: false,
          store: {
            dragStart: vi.fn(),
            isLatestNode: vi.fn().mockReturnValue(false),
          },
          typewriter: false,
          editorProps: { titlePlaceholderContent: '...' },
        } as any,
      );

      const props = {
        leaf: { text: 't', tag: true, code: true },
        attributes: {},
        children: <span>t</span>,
        readonly: false,
        text: 't',
        tagInputProps: {
          enable: true,
          tagTextRender: (_p: any, t: string) => t,
        },
        fncProps: {},
        comment: undefined,
        linkConfig: {},
      } as any;
      render(<MLeaf {...props} />);
      const onSelect = (window as any).__lastTagPopupOnSelect as (
        v: string,
        path: number[],
        tagNode?: any,
      ) => void;
      onSelect('v', [0, 0], {});
      await new Promise((r) => setTimeout(r, 30));
      expect(selectSpy).toHaveBeenCalled();
    });
  });
});
