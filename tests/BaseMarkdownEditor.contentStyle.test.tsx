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
  });
});
