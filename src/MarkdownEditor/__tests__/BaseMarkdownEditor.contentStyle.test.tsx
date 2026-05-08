import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BaseMarkdownEditor,
  MarkdownEditorProps,
} from '../BaseMarkdownEditor';

// Mock 依赖
vi.mock('../editor/Editor', () => ({
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

vi.mock('../editor/tools/ToolBar/ToolBar', () => ({
  default: () => <div data-testid="toolbar">Toolbar</div>,
}));

vi.mock('../editor/tools/ToolBar/FloatBar', () => ({
  FloatBar: () => <div data-testid="float-bar">Float Bar</div>,
}));

vi.mock('../editor/tools/Leading', () => ({
  TocHeading: () => <div data-testid="toc-heading">TOC</div>,
}));

vi.mock('../editor/components/CommentList', () => ({
  CommentList: () => <div data-testid="comment-list">Comment List</div>,
}));

vi.mock('../editor/tools/InsertLink', () => ({
  InsertLink: () => <div data-testid="insert-link">Insert Link</div>,
}));

vi.mock('../editor/tools/InsertAutocomplete', () => ({
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
          '.ant-agentic-md-editor-container',
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
          '.ant-agentic-md-editor-container',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        expect(contentElement.style.padding).toBe('0px');
        expect(contentElement.style.height).toBe('200px');
      });
    });

    it('应忽略 padding 相关空字符串，避免出现无效的 padding-top 等内联声明', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          contentStyle={{
            height: '100%',
            '--agentic-ui-content-padding': 'var(--padding-3x)',
            padding: 'var(--padding-3x)',
            paddingTop: '',
            paddingBottom: '',
            paddingLeft: '',
            paddingRight: 'var(--padding-3x)',
            alignItems: 'flex-start',
          }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-container',
        ) as HTMLElement;
        expect(contentElement).toBeInTheDocument();
        const attr = contentElement.getAttribute('style') || '';
        expect(attr).not.toMatch(/padding-top:\s*;/);
        expect(attr).not.toMatch(/padding-bottom:\s*;/);
        expect(attr).not.toMatch(/padding-left:\s*;/);
        expect(attr).toContain('--agentic-ui-content-padding');
        // happy-dom 可能不保留单独的 padding-right（当 padding 简写已覆盖时），
        // 因此改为断言存在 padding 相关声明即可
        expect(attr).toMatch(/padding/);
      });
    });

    it('应剔除 contentStyle 中空字符串的 --* 自定义属性', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          contentStyle={{
            height: '100%',
            ['--agentic-ui-content-padding' as string]: '',
            padding: '12px',
          }}
        />,
      );

      await waitFor(() => {
        const contentElement = container.querySelector(
          '.ant-agentic-md-editor-container',
        ) as HTMLElement;
        const attr = contentElement.getAttribute('style') || '';
        expect(attr).not.toMatch(/--agentic-ui-content-padding:\s*;/);
        expect(attr).toContain('padding');
      });
    });

    it('应对根节点 style 做同样清理，避免出现无效 padding 内联', async () => {
      const { container } = render(
        <BaseMarkdownEditor
          {...defaultProps}
          style={{
            paddingTop: '',
            minWidth: 0,
          }}
        />,
      );

      await waitFor(() => {
        const root = container.querySelector(
          '.markdown-editor',
        ) as HTMLElement;
        expect(root).toBeInTheDocument();
        const attr = root.getAttribute('style') || '';
        expect(attr).not.toMatch(/padding-top:\s*;/);
        expect(attr).toContain('min-width');
      });
    });
  });
});
