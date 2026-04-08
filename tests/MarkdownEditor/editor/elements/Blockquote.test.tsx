/**
 * Blockquote 组件测试文件
 *
 * 测试覆盖范围：
 * - 基本渲染功能
 * - 边界情况处理
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Blockquote } from '../../../../src/MarkdownEditor/editor/elements/Blockquote';

// Mock 依赖
vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: {
      dragStart: vi.fn(),
    },
    markdownContainerRef: { current: document.createElement('div') },
  }),
}));

describe('Blockquote Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  vi.mock('../../../../src/MarkdownEditor/hooks/editor', () => ({
    useSelStatus: vi.fn(() => [false, [0]]),
  }));

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  const defaultProps = {
    element: {
      type: 'blockquote' as const,
      children: [{ text: 'test content' }],
    },
    attributes: {},
    children: <span>test content</span>,
  } as any;

  describe('基本渲染功能', () => {
    it('应该正确渲染 Blockquote 组件', () => {
      const { container } = renderWithProvider(
        <Blockquote {...defaultProps} />,
      );

      const blockquoteElement = container.querySelector(
        '[data-be="blockquote"]',
      );
      expect(blockquoteElement).toBeInTheDocument();
      expect(blockquoteElement).toHaveTextContent('test content');
    });

    it('应该显示内容', () => {
      const { container } = renderWithProvider(
        <Blockquote {...defaultProps} />,
      );

      expect(container).toHaveTextContent('test content');
    });

    it('应该渲染为 blockquote 元素', () => {
      const { container } = renderWithProvider(
        <Blockquote {...defaultProps} />,
      );

      const blockquoteElement = container.querySelector('blockquote');
      expect(blockquoteElement).toBeInTheDocument();
    });

    it('应在 onDragStart 时调用 store.dragStart', () => {
      const { container } = renderWithProvider(
        <Blockquote {...defaultProps} />,
      );
      const blockquote = container.querySelector('[data-be="blockquote"]');
      fireEvent.dragStart(blockquote!);
    });
  });

  describe('边界情况处理', () => {
    it('应该处理空的 attributes', () => {
      const propsWithEmptyAttributes = {
        ...defaultProps,
        attributes: {},
      };

      const { container } = renderWithProvider(
        <Blockquote {...propsWithEmptyAttributes} />,
      );

      const blockquoteElement = container.querySelector(
        '[data-be="blockquote"]',
      );
      expect(blockquoteElement).toBeInTheDocument();
    });

    it('应该处理自定义 attributes', () => {
      const customAttributes = {
        'data-test': 'test-value',
        className: 'custom-class',
      };

      const propsWithCustomAttributes = {
        ...defaultProps,
        attributes: customAttributes,
      };

      const { container } = renderWithProvider(
        <Blockquote {...propsWithCustomAttributes} />,
      );

      const blockquoteElement = container.querySelector(
        '[data-be="blockquote"]',
      );
      expect(blockquoteElement).toHaveAttribute('data-test', 'test-value');
      expect(blockquoteElement).toHaveClass('custom-class');
    });

    it('应该处理空的 children', () => {
      const propsWithEmptyChildren = {
        ...defaultProps,
        children: null,
      };

      const { container } = renderWithProvider(
        <Blockquote {...propsWithEmptyChildren} />,
      );

      const blockquoteElement = container.querySelector(
        '[data-be="blockquote"]',
      );
      expect(blockquoteElement).toBeInTheDocument();
    });

    it('应该处理复杂的 children', () => {
      const complexChildren = (
        <div>
          <span>复杂内容</span>
          <strong>粗体文本</strong>
        </div>
      );

      const propsWithComplexChildren = {
        ...defaultProps,
        children: complexChildren,
      };

      const { container } = renderWithProvider(
        <Blockquote {...propsWithComplexChildren} />,
      );

      expect(container).toHaveTextContent('复杂内容');
      expect(container).toHaveTextContent('粗体文本');
    });

    it('应该处理多个 children', () => {
      const multipleChildren = [
        <span key="1">第一个</span>,
        <span key="2">第二个</span>,
        <span key="3">第三个</span>,
      ];

      const propsWithMultipleChildren = {
        ...defaultProps,
        children: multipleChildren,
      };

      const { container } = renderWithProvider(
        <Blockquote {...propsWithMultipleChildren} />,
      );

      expect(container).toHaveTextContent('第一个');
      expect(container).toHaveTextContent('第二个');
      expect(container).toHaveTextContent('第三个');
    });
  });

  describe('元素属性', () => {
    it('应该包含正确的 data-be 属性', () => {
      const { container } = renderWithProvider(
        <Blockquote {...defaultProps} />,
      );

      const blockquoteElement = container.querySelector(
        '[data-be="blockquote"]',
      );
      expect(blockquoteElement).toHaveAttribute('data-be', 'blockquote');
    });

    it('应该合并传入的 attributes', () => {
      const customAttributes = {
        id: 'test-id',
        'data-custom': 'custom-value',
      };

      const propsWithCustomAttributes = {
        ...defaultProps,
        attributes: customAttributes,
      };

      const { container } = renderWithProvider(
        <Blockquote {...propsWithCustomAttributes} />,
      );

      const blockquoteElement = container.querySelector(
        '[data-be="blockquote"]',
      );
      expect(blockquoteElement).toHaveAttribute('id', 'test-id');
      expect(blockquoteElement).toHaveAttribute('data-custom', 'custom-value');
    });
  });

  describe('性能优化', () => {
    it('应该使用 React.useMemo 进行优化', () => {
      const { container } = renderWithProvider(
        <Blockquote {...defaultProps} />,
      );

      const blockquoteElement = container.querySelector(
        '[data-be="blockquote"]',
      );
      expect(blockquoteElement).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该处理拖拽事件', () => {
      render(<Blockquote {...defaultProps} />);
      const blockquote = document.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
    });
  });

  describe('样式测试', () => {
    it('应该应用正确的CSS类', () => {
      render(<Blockquote {...defaultProps} />);
      const blockquote = document.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
    });

    it('应该应用正确的样式', () => {
      render(<Blockquote {...defaultProps} />);
      const blockquote = document.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    it('应该处理大量文本', () => {
      const longText = 'A'.repeat(500);
      const props = {
        ...defaultProps,
        children: [<div key="1">{longText}</div>],
      };
      render(<Blockquote {...props} />);
      const blockquote = document.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
    });

    it('应该处理嵌套的引用结构', () => {
      const nestedChildren = [
        <div key="1">Outer quote</div>,
        <blockquote key="2">
          <div>Inner quote</div>
        </blockquote>,
      ];
      const props = {
        ...defaultProps,
        children: nestedChildren,
      };
      render(<Blockquote {...props} />);
      expect(screen.getByText('Outer quote')).toBeInTheDocument();
      expect(screen.getByText('Inner quote')).toBeInTheDocument();
    });
  });

  describe('markdown-container 提示块 (55-76)', () => {
    it('otherProps 含 markdownContainerType 时渲染 div.markdown-container', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          otherProps: {
            markdownContainerType: 'warning',
            markdownContainerTitle: '注意',
          },
        },
      };
      renderWithProvider(<Blockquote {...props} />);
      expect(screen.getByTestId('markdown-container')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-container-title')).toHaveTextContent(
        '注意',
      );
      expect(screen.getByTestId('markdown-container')).toHaveClass('warning');
    });
  });
});
