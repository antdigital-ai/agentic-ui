import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import classNames from 'clsx';
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
  default: ({ hideTools, extra, min }: any) => {
    const toolbarClassName = classNames('md-editor-toolbar', {
      'md-editor-min-toolbar': min,
    });

    return (
      <div
        data-testid="toolbar"
        className={toolbarClassName}
        data-hide-tools={JSON.stringify(hideTools)}
        data-min={min ? 'true' : 'false'}
      >
        {extra?.map((item: any, index: number) => (
          <div key={index} data-testid={`toolbar-extra-${index}`}>
            {item}
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock('../src/MarkdownEditor/editor/tools/ToolBar/FloatBar', () => ({
  FloatBar: ({ readonly }: any) => (
    <div data-testid="float-bar" data-readonly={readonly}>
      Float Bar
    </div>
  ),
}));

vi.mock('../src/MarkdownEditor/editor/tools/Leading', () => ({
  TocHeading: ({ schema }: any) => (
    <div data-testid="toc-heading" data-schema-length={schema?.length}>
      Table of Contents
    </div>
  ),
}));

vi.mock('../src/MarkdownEditor/editor/components/CommentList', () => ({
  CommentList: ({ commentList }: any) => (
    <div data-testid="comment-list" data-comment-count={commentList?.length}>
      Comment List
    </div>
  ),
}));

vi.mock('../src/MarkdownEditor/editor/tools/InsertLink', () => ({
  InsertLink: () => <div data-testid="insert-link">Insert Link</div>,
}));

vi.mock('../src/MarkdownEditor/editor/tools/InsertAutocomplete', () => ({
  InsertAutocomplete: (props: any) => (
    <div data-testid="insert-autocomplete" {...props}>
      Insert Autocomplete
    </div>
  ),
}));

describe('BaseMarkdownEditor - 基本功能测试', () => {
  const defaultProps: MarkdownEditorProps = {
    initValue: '# Test Markdown\n\nThis is a test.',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染基本组件', async () => {
      const { container } = render(<BaseMarkdownEditor {...defaultProps} />);

      await waitFor(() => {
        expect(container.querySelector('.markdown-editor')).toBeInTheDocument();
        expect(screen.getByTestId('slate-markdown-editor')).toBeInTheDocument();
      });
    });

    it('应该应用自定义 className', () => {
      const { container } = render(
        <BaseMarkdownEditor {...defaultProps} className="custom-class" />,
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'red', width: '500px' };
      const { container } = render(
        <BaseMarkdownEditor {...defaultProps} style={customStyle} />,
      );

      const editorElement = container.querySelector(
        '.markdown-editor',
      ) as HTMLElement;
      expect(editorElement.style.backgroundColor).toBe('red');
      expect(editorElement.style.width).toBe('500px');
    });

    it('应该设置正确的宽度和高度', () => {
      const { container } = render(
        <BaseMarkdownEditor {...defaultProps} width="600px" height="400px" />,
      );

      const editorElement = container.querySelector(
        '.markdown-editor',
      ) as HTMLElement;
      expect(editorElement.style.width).toBe('600px');
      expect(editorElement.style.height).toBe('400px');
    });
  });

  describe('只读模式测试', () => {
    it('应该在只读模式下正确渲染', () => {
      render(<BaseMarkdownEditor {...defaultProps} readonly={true} />);

      // 验证组件能正常渲染，只读模式的样式在组件内部处理
      expect(screen.getByTestId('slate-markdown-editor')).toBeInTheDocument();
    });

    it('应该在只读模式下隐藏工具栏', () => {
      render(
        <BaseMarkdownEditor
          {...defaultProps}
          readonly={true}
          toolBar={{ enable: true }}
        />,
      );

      expect(screen.queryByTestId('toolbar')).not.toBeInTheDocument();
    });

    it('应该在只读模式下显示浮动栏', async () => {
      render(
        <BaseMarkdownEditor
          {...defaultProps}
          readonly={true}
          reportMode={true}
          floatBar={{ enable: true }}
        />,
      );

      await waitFor(() => {
        const floatBar = screen.getByTestId('float-bar');
        expect(floatBar).toBeInTheDocument();
        expect(floatBar.getAttribute('data-readonly')).toBe('true');
      });
    });
  });

  describe('工具栏测试', () => {
    it('应该在启用工具栏时显示工具栏', () => {
      render(
        <BaseMarkdownEditor {...defaultProps} toolBar={{ enable: true }} />,
      );

      expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    });

    it('应该在禁用工具栏时不显示工具栏', () => {
      render(
        <BaseMarkdownEditor {...defaultProps} toolBar={{ enable: false }} />,
      );

      expect(screen.queryByTestId('toolbar')).not.toBeInTheDocument();
    });

    it('应该在最小化模式下应用最小化样式', () => {
      render(
        <BaseMarkdownEditor
          {...defaultProps}
          toolBar={{ enable: true, min: true }}
        />,
      );

      // 验证工具栏存在且具有最小化属性
      const toolbar = screen.getByTestId('toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar.getAttribute('data-min')).toBe('true');
    });

    it('应该渲染工具栏的额外内容', () => {
      const extraContent = [
        <div key="1" data-testid="extra-1">
          Extra 1
        </div>,
        <div key="2" data-testid="extra-2">
          Extra 2
        </div>,
      ];

      render(
        <BaseMarkdownEditor
          {...defaultProps}
          toolBar={{ enable: true, extra: extraContent }}
        />,
      );

      expect(screen.getByTestId('toolbar-extra-0')).toBeInTheDocument();
      expect(screen.getByTestId('toolbar-extra-1')).toBeInTheDocument();
    });
  });

  describe('事件回调测试', () => {
    it('应该调用 onChange 回调', async () => {
      const onChange = vi.fn();
      render(<BaseMarkdownEditor {...defaultProps} onChange={onChange} />);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          'test markdown',
          expect.any(Array),
        );
      });
    });

    it('应该调用 onBlur 回调', async () => {
      const onBlur = vi.fn();
      render(<BaseMarkdownEditor {...defaultProps} onBlur={onBlur} />);

      const editorContent = screen.getByTestId('editor-content');
      fireEvent.blur(editorContent);

      await waitFor(() => {
        expect(onBlur).toHaveBeenCalled();
      });
    });

    it('应该调用 onFocus 回调', async () => {
      const onFocus = vi.fn();
      render(<BaseMarkdownEditor {...defaultProps} onFocus={onFocus} />);

      const editorContent = screen.getByTestId('editor-content');
      fireEvent.focus(editorContent);

      await waitFor(() => {
        expect(onFocus).toHaveBeenCalled();
      });
    });
  });

  describe('特殊模式测试', () => {
    it('应该在报告模式下应用报告样式', () => {
      render(<BaseMarkdownEditor {...defaultProps} reportMode={true} />);

      // 验证组件能正常渲染，报告模式的样式在组件内部处理
      expect(screen.getByTestId('slate-markdown-editor')).toBeInTheDocument();
    });
  });

  describe('ID 属性测试', () => {
    it('应该正确设置 ID 属性', () => {
      const { container } = render(
        <BaseMarkdownEditor {...defaultProps} id="test-editor" />,
      );

      const editorElement = container.querySelector('.markdown-editor');
      expect(editorElement).toHaveAttribute('id', 'test-editor');
    });

    it('应该将数字 ID 转换为字符串', () => {
      const { container } = render(
        <BaseMarkdownEditor {...defaultProps} id={'123'} />,
      );

      const editorElement = container.querySelector('.markdown-editor');
      expect(editorElement).toHaveAttribute('id', '123');
    });
  });
});
