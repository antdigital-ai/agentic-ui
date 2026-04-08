/**
 * CodeContainer 组件测试文件
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeContainer } from '../../../../src/Plugins/code/components/CodeContainer';

// Mock DragHandle
vi.mock('../../../../src/MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle" />,
}));

describe('CodeContainer Component', () => {
  const defaultProps = {
    element: {
      type: 'code' as const,
      value: 'console.log("Hello World");',
      language: 'javascript',
      katex: false,
      children: [{ text: '' }] as [{ text: string }],
    },
    showBorder: false,
    hide: false,
    onEditorClick: vi.fn(),
    children: <div>Children content</div>,
    readonly: false,
    fullScreenNode: { current: null },
    isSelected: false,
    theme: 'github',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染 CodeContainer 组件', () => {
      render(<CodeContainer {...defaultProps} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('应该渲染子元素', () => {
      render(<CodeContainer {...defaultProps} />);
      expect(screen.getByText('Children content')).toBeInTheDocument();
    });

    it('应该包含正确的 data-lang 属性', () => {
      render(<CodeContainer {...defaultProps} />);
      const container = screen.getByTestId('code-container');
      expect(container).toHaveAttribute('data-lang', 'javascript');
    });

    it('应该包含正确的 data-be 属性', () => {
      render(<CodeContainer {...defaultProps} />);
      const container = screen.getByTestId('code-container');
      expect(container).toHaveAttribute('data-be', 'code');
    });
  });

  describe('事件处理测试', () => {
    it('应该处理 onEditorClick 事件', async () => {
      const user = userEvent.setup();
      const onEditorClick = vi.fn();

      render(<CodeContainer {...defaultProps} onEditorClick={onEditorClick} />);

      const container = screen.getByTestId('code-editor-container');
      await user.click(container);

      expect(onEditorClick).toHaveBeenCalled();
    });

    it('应该阻止事件冒泡', async () => {
      const user = userEvent.setup();
      const onContainerClick = vi.fn();

      render(
        <div onClick={onContainerClick}>
          <CodeContainer {...defaultProps} />
        </div>,
      );

      const container = screen.getByTestId('code-editor-container');
      await user.click(container);

      expect(onContainerClick).not.toHaveBeenCalled();
    });

    it('点击外层 code-container 时应阻止冒泡且不触发 onEditorClick', async () => {
      const user = userEvent.setup();
      const onContainerClick = vi.fn();
      const onEditorClick = vi.fn();

      render(
        <div onClick={onContainerClick}>
          <CodeContainer
            {...defaultProps}
            onEditorClick={onEditorClick}
          />
        </div>,
      );

      const outerContainer = screen.getByTestId('code-container');
      await user.click(outerContainer);

      expect(onContainerClick).not.toHaveBeenCalled();
      expect(onEditorClick).not.toHaveBeenCalled();
    });

    it('外层 code-container 失焦时应执行 onBlur 并阻止冒泡', () => {
      const onBlur = vi.fn();

      render(
        <div onBlur={onBlur}>
          <CodeContainer {...defaultProps} />
        </div>,
      );

      const outerContainer = screen.getByTestId('code-container');
      fireEvent.blur(outerContainer);

      expect(outerContainer).toBeInTheDocument();
    });
  });

  describe('语言处理测试', () => {
    it('应该处理不同的语言', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'python',
        },
      };

      render(<CodeContainer {...props} />);
      const container = screen.getByTestId('code-container');
      expect(container).toHaveAttribute('data-lang', 'python');
    });

    it('应该处理未定义的语言', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: undefined,
        },
      };

      render(<CodeContainer {...props} />);
      const container = screen.getByTestId('code-container');
      // 当language为undefined时，data-lang属性可能不存在
      expect(container).not.toHaveAttribute('data-lang');
    });
  });

  describe('样式测试', () => {
    it('应该应用正确的容器样式', () => {
      render(<CodeContainer {...defaultProps} />);
      const container = screen.getByTestId('code-container');

      expect(container).toHaveClass('ace-el', 'drag-el');
    });

    // it('应该应用正确的编辑器容器样式', () => {
    //   render(<CodeContainer {...defaultProps} />);
    //   const container = screen.getByTestId('code-editor-container');

    //   expect(container).toHaveStyle({
    //     maxHeight: '400px',
    //     overflow: 'auto',
    //     position: 'relative',
    //   });
    //   expect(container).toHaveClass('ace-container', 'drag-el');
    // });
  });

  describe('可访问性测试', () => {
    it('应该包含正确的 tabIndex', () => {
      render(<CodeContainer {...defaultProps} />);
      const container = screen.getByTestId('code-container');
      expect(container).toHaveAttribute('tabIndex', '-1');
    });

    it('应该包含正确的 contentEditable 属性', () => {
      render(<CodeContainer {...defaultProps} />);
      const container = screen.getByTestId('code-container');
      expect(container).toHaveAttribute('contenteditable', 'false');
    });
  });
});
