/**
 * FootnoteDefinition 组件测试文件
 *
 * 测试覆盖范围：
 * - 基本渲染功能
 * - 边界情况处理
 * - 样式处理
 */

import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FootnoteDefinition } from '../../../../src/MarkdownEditor/editor/elements/FootnoteDefinition';

// Mock 依赖
vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: {
      dragStart: vi.fn(),
      footnoteDefinitionMap: new Map(),
    },
    readonly: false,
    markdownContainerRef: { current: document.createElement('div') },
  }),
}));

vi.mock('../../../../src/MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle" />,
}));

vi.mock('slate', () => ({
  Node: {
    string: vi.fn(() => 'test content'),
  },
}));

describe('FootnoteDefinition Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  const defaultProps = {
    element: {
      type: 'footnoteDefinition' as const,
      identifier: 'test-id',
      children: [{ text: 'test content' }],
    },
    attributes: {
      'data-slate-node': 'element' as const,
      ref: vi.fn(),
    },
    children: <span>test content</span>,
  };

  describe('基本渲染功能', () => {
    it('应该正确渲染 FootnoteDefinition 组件', () => {
      const { container } = renderWithProvider(
        <FootnoteDefinition {...defaultProps} />,
      );

      const footnoteElement = container.querySelector(
        '[data-be="footnoteDefinition"]',
      );
      expect(footnoteElement).toBeInTheDocument();
      expect(footnoteElement).toHaveTextContent('test-id.');
    });

    it('应在 onDragStart 时触发 store.dragStart', () => {
      const { container } = renderWithProvider(
        <FootnoteDefinition {...defaultProps} />,
      );
      const el = container.querySelector('[data-be="footnoteDefinition"]');
      fireEvent.dragStart(el!);
    });

    it('应该显示拖拽手柄', () => {
      const { getByTestId } = renderWithProvider(
        <FootnoteDefinition {...defaultProps} />,
      );

      const dragHandle = getByTestId('drag-handle');
      expect(dragHandle).toBeInTheDocument();
    });

    it('应该显示内容', () => {
      const { container } = renderWithProvider(
        <FootnoteDefinition {...defaultProps} />,
      );

      expect(container).toHaveTextContent('test content');
    });
  });

  describe('边界情况处理', () => {
    it('应该处理空的标识符', () => {
      const propsWithEmptyId = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          identifier: '',
        },
      };

      const { container } = renderWithProvider(
        <FootnoteDefinition {...propsWithEmptyId} />,
      );

      const footnoteElement = container.querySelector(
        '[data-be="footnoteDefinition"]',
      );
      expect(footnoteElement).toBeInTheDocument();
      expect(footnoteElement).toHaveTextContent('.');
    });

    it('应该处理空的 attributes', () => {
      const propsWithEmptyAttributes = {
        ...defaultProps,
        attributes: {
          'data-slate-node': 'element' as const,
          ref: vi.fn(),
        },
      };

      const { container } = renderWithProvider(
        <FootnoteDefinition {...propsWithEmptyAttributes} />,
      );

      const footnoteElement = container.querySelector(
        '[data-be="footnoteDefinition"]',
      );
      expect(footnoteElement).toBeInTheDocument();
    });

    it('应该处理自定义 attributes', () => {
      const customAttributes = {
        'data-test': 'test-value',
      };

      const propsWithCustomAttributes = {
        ...defaultProps,
        attributes: {
          ...customAttributes,
          'data-slate-node': 'element' as const,
          ref: vi.fn(),
        },
      };

      const { container } = renderWithProvider(
        <FootnoteDefinition {...propsWithCustomAttributes} />,
      );

      const footnoteElement = container.querySelector(
        '[data-be="footnoteDefinition"]',
      );
      expect(footnoteElement).toHaveAttribute('data-test', 'test-value');
    });
  });

  describe('样式处理', () => {
    it('应该应用正确的样式', () => {
      const { container } = renderWithProvider(
        <FootnoteDefinition {...defaultProps} />,
      );

      const footnoteElement = container.querySelector(
        '[data-be="footnoteDefinition"]',
      ) as HTMLElement;
      expect(footnoteElement).toHaveStyle({
        fontSize: '12px',
        margin: '5px 0',
        display: 'flex',
        gap: '4px',
      });
    });
  });

  describe('内容渲染', () => {
    it('应该渲染复杂的 children', () => {
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
        <FootnoteDefinition {...propsWithComplexChildren} />,
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
        <FootnoteDefinition {...propsWithMultipleChildren} />,
      );

      expect(container).toHaveTextContent('第一个');
      expect(container).toHaveTextContent('第二个');
      expect(container).toHaveTextContent('第三个');
    });
  });

  describe('标识符处理', () => {
    it('应该处理数字标识符', () => {
      const propsWithNumericId = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          identifier: '123',
        },
      };

      const { container } = renderWithProvider(
        <FootnoteDefinition {...propsWithNumericId} />,
      );

      expect(container).toHaveTextContent('123.');
    });

    it('应该处理特殊字符标识符', () => {
      const propsWithSpecialId = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          identifier: 'test-id-123',
        },
      };

      const { container } = renderWithProvider(
        <FootnoteDefinition {...propsWithSpecialId} />,
      );

      expect(container).toHaveTextContent('test-id-123.');
    });
  });
});
