import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BaseMarkdownEditor,
  MarkdownEditorProps,
} from '../src/MarkdownEditor/BaseMarkdownEditor';

// Mock 依赖
vi.mock('../src/MarkdownEditor/editor/Editor', () => ({
  SlateMarkdownEditor: ({ onChange, initSchemaValue, ...props }: any) => {
    React.useEffect(() => {
      onChange?.('test markdown', initSchemaValue || []);
    }, []);
    return (
      <div data-testid="slate-markdown-editor" {...props}>
        <div
          data-testid="editor-content"
          suppressContentEditableWarning={true}
          contentEditable={true}
        >
          Test content
        </div>
      </div>
    );
  },
}));

vi.mock('../src/MarkdownEditor/editor/tools/ToolBar/ToolBar', () => ({
  default: () => <div data-testid="toolbar">Toolbar</div>,
}));

vi.mock('../src/MarkdownEditor/editor/tools/ToolBar/FloatBar', () => ({
  FloatBar: () => <div data-testid="float-bar">Float Bar</div>,
}));

vi.mock('../src/MarkdownEditor/editor/tools/Leading', () => ({
  TocHeading: () => <div data-testid="toc-heading">TOC</div>,
}));

vi.mock('../src/MarkdownEditor/editor/components/CommentList', () => ({
  CommentList: () => <div data-testid="comment-list">Comment List</div>,
}));

vi.mock('../src/MarkdownEditor/editor/tools/InsertLink', () => ({
  InsertLink: () => <div data-testid="insert-link">Insert Link</div>,
}));

vi.mock('../src/MarkdownEditor/editor/tools/InsertAutocomplete', () => ({
  InsertAutocomplete: () => (
    <div data-testid="insert-autocomplete">Insert Autocomplete</div>
  ),
}));

describe('BaseMarkdownEditor - contentStyle 测试', () => {
  const defaultProps: MarkdownEditorProps = {
    initValue: '# Test Markdown\n\nThis is a test.',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('contentStyle padding 功能', () => {
    it('应该能够通过 contentStyle 设置 padding 为 0', async () => {
      const { container } = render(
        <BaseMarkdownEditor {...defaultProps} contentStyle={{ padding: 0 }} />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        // 验证 padding 被正确设置为 0
        expect(contentElement.style.padding).toBe('0px');
      });
    });

    it('应该能够通过 contentStyle 设置自定义 padding 值', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          contentStyle={{ padding: '16px 24px' }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        // 验证 padding 被正确设置
        expect(contentElement.style.padding).toBe('16px 24px');
      });
    });

    it('应该能够通过 contentStyle 设置 paddingTop', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          contentStyle={{ paddingTop: 0, padding: 0 }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        // padding: 0 应该覆盖所有 padding 相关属性
        expect(contentElement.style.padding).toBe('0px');
      });
    });

    it('应该能够通过 contentStyle 同时设置多个样式属性', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          contentStyle={{
            padding: 0,
            overflow: 'hidden',
            backgroundColor: 'red',
          }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        expect(contentElement.style.padding).toBe('0px');
        expect(contentElement.style.overflow).toBe('hidden');
        expect(contentElement.style.backgroundColor).toBe('red');
      });
    });

    it('应该能够覆盖默认的 padding 样式', async () => {
      // 先测试默认情况（不设置 contentStyle）
      const { container: defaultContainer } = render(
        <BaseMarkdownEditor {...defaultProps} />,
      );

      await waitFor(() => {
        const defaultContentElement = defaultContainer.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(defaultContentElement).toBeInTheDocument();
        // 默认情况下，padding 应该由 CSS 类设置，内联样式可能为空
        // 但如果有 contentStyle，应该能够覆盖
      });

      // 再测试设置了 padding: 0 的情况
      const { container: customContainer } = render(
        <BaseMarkdownEditor {...defaultProps} contentStyle={{ padding: 0 }} />,
      );

      await waitFor(() => {
        const customContentElement = customContainer.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(customContentElement).toBeInTheDocument();
        // 验证 padding: 0 能够覆盖默认样式
        expect(customContentElement.style.padding).toBe('0px');
      });
    });

    it('应该在只读模式下也能正确应用 contentStyle padding', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          readonly={true}
          contentStyle={{ padding: 0 }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        expect(contentElement.style.padding).toBe('0px');
      });
    });

    it('应该在启用工具栏时也能正确应用 contentStyle padding', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          toolBar={{ enable: true }}
          contentStyle={{ padding: 0 }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        expect(contentElement.style.padding).toBe('0px');
      });
    });

    it('应该能够通过 contentStyle 设置 padding 为字符串值', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          contentStyle={{ padding: '10px 20px 30px 40px' }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        expect(contentElement.style.padding).toBe('10px 20px 30px 40px');
      });
    });

    it('应该能够通过 contentStyle 设置 padding 为数字值', async () => {
      const { container } = render(
        <BaseMarkdownEditor {...defaultProps} contentStyle={{ padding: 16 }} />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        // React 会将数字转换为 px
        expect(contentElement.style.padding).toBe('16px');
      });
    });
  });

  describe('contentStyle 与其他样式属性的组合', () => {
    it('应该能够同时设置 padding 和其他布局属性', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          contentStyle={{
            padding: 0,
            height: '100%',
            overflow: 'auto',
            display: 'flex',
          }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        expect(contentElement.style.padding).toBe('0px');
        expect(contentElement.style.height).toBe('100%');
        expect(contentElement.style.overflow).toBe('auto');
        expect(contentElement.style.display).toBe('flex');
      });
    });

    it('应该能够覆盖 contentStyle 中的默认 height', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          contentStyle={{
            padding: 0,
            height: '200px',
          }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-content',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        expect(contentElement.style.padding).toBe('0px');
        expect(contentElement.style.height).toBe('200px');
      });
    });
  });
});
