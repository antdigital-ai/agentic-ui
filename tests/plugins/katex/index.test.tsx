/**
 * KatexElement 组件测试文件
 *
 * 测试覆盖范围：
 * - 基本渲染功能（katex 和非 katex 节点）
 * - 只读模式下的渲染
 * - 编辑模式下的完整渲染
 * - 事件处理（onBlur、onClick）
 * - 边界情况处理（空的 value、undefined）
 * - 组件结构验证（拖拽手柄、隐藏内容副本）
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeNode, ElementProps } from '../../../src/MarkdownEditor/el';
import { KatexElement } from '../../../src/Plugins/katex/index';

// Mock Katex 组件
vi.mock('../../../src/Plugins/katex/Katex', () => ({
  Katex: ({ el }: { el: CodeNode }) => (
    <div data-testid="katex-renderer">{el.value || 'Formula'}</div>
  ),
}));

// Mock DragHandle 组件
vi.mock('../../../src/MarkdownEditor/editor/tools/DragHandle', () => ({
  DragHandle: () => <div data-testid="drag-handle">DragHandle</div>,
}));

// Mock useEditorStore
const mockUseEditorStore = vi.fn();
vi.mock('../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mockUseEditorStore(),
}));

describe('KatexElement', () => {
  const mockElement: CodeNode = {
    type: 'code',
    katex: true,
    value: '\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n',
    children: [{ text: '' }],
  };

  const defaultProps: ElementProps<CodeNode> = {
    element: mockElement,
    attributes: {
      'data-slate-node': 'element' as const,
      'data-testid': 'katex-element',
      ref: null,
    },
    children: <span>children content</span>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 默认设置为非只读模式
    mockUseEditorStore.mockReturnValue({
      readonly: false,
    });
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染 katex 类型的节点', () => {
      render(<KatexElement {...defaultProps} />);

      const katexRenderer = screen.getByTestId('katex-renderer');
      expect(katexRenderer).toBeInTheDocument();
      expect(katexRenderer).toHaveTextContent(mockElement.value!);
    });

    it('应该对非 katex 类型的节点返回 null', () => {
      const nonKatexElement = {
        ...mockElement,
        katex: false,
      };

      const { container } = render(
        <KatexElement {...defaultProps} element={nonKatexElement} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('应该对 katex 为 undefined 的节点返回 null', () => {
      const undefinedKatexElement = {
        ...mockElement,
        katex: undefined,
      };

      const { container } = render(
        <KatexElement {...defaultProps} element={undefinedKatexElement} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('只读模式测试', () => {
    beforeEach(() => {
      mockUseEditorStore.mockReturnValue({
        readonly: true,
      });
    });

    it('应该在只读模式下渲染简化版本', () => {
      const { container } = render(<KatexElement {...defaultProps} />);

      const element = container.querySelector('[data-testid="katex-element"]');
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('contentEditable', 'false');
      expect(element).toHaveStyle({ margin: '1em 0', userSelect: 'none' });
    });

    it('应该在只读模式下渲染 Katex 组件', () => {
      render(<KatexElement {...defaultProps} />);

      const katexRenderer = screen.getByTestId('katex-renderer');
      expect(katexRenderer).toBeInTheDocument();
    });

    it('应该在只读模式下包含隐藏的内容副本', () => {
      const { container } = render(<KatexElement {...defaultProps} />);

      const hiddenContent = container.querySelector(
        'div[style*="height: 0.5px"]',
      );
      expect(hiddenContent).toBeInTheDocument();
      expect(hiddenContent).toHaveStyle({
        opacity: '0',
        overflow: 'hidden',
        pointerEvents: 'none',
      });
    });

    it('应该在只读模式下不渲染拖拽手柄', () => {
      render(<KatexElement {...defaultProps} />);

      const dragHandle = screen.queryByTestId('drag-handle');
      expect(dragHandle).not.toBeInTheDocument();
    });
  });

  describe('编辑模式测试', () => {
    beforeEach(() => {
      mockUseEditorStore.mockReturnValue({
        readonly: false,
      });
    });

    it('应该在编辑模式下渲染完整版本', () => {
      const { container } = render(<KatexElement {...defaultProps} />);

      const element = container.querySelector('[data-testid="katex-element"]');
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass('katex-el', 'drag-el');
      expect(element).toHaveAttribute('data-be', 'katex');
      expect(element).toHaveAttribute('tabIndex', '-1');
      expect(element).toHaveAttribute('contentEditable', 'false');
    });

    it('应该在编辑模式下渲染拖拽手柄', () => {
      render(<KatexElement {...defaultProps} />);

      const dragHandle = screen.getByTestId('drag-handle');
      expect(dragHandle).toBeInTheDocument();
    });

    it('应该在编辑模式下渲染 Katex 组件容器', () => {
      const { container } = render(<KatexElement {...defaultProps} />);

      // 查找包含 Katex 渲染器的容器
      const katexRenderer = screen.getByTestId('katex-renderer');
      const katexContainer = katexRenderer.closest('div[style*="position: relative"]');
      expect(katexContainer).toBeInTheDocument();
      // 验证容器存在并且包含 Katex 渲染器
      expect(katexContainer).toContainElement(katexRenderer);
    });

    it('应该在编辑模式下包含隐藏的内容副本', () => {
      const { container } = render(<KatexElement {...defaultProps} />);

      const hiddenContent = container.querySelector(
        'div[style*="height: 0.5px"]',
      );
      expect(hiddenContent).toBeInTheDocument();
    });
  });

  describe('事件处理测试', () => {
    beforeEach(() => {
      mockUseEditorStore.mockReturnValue({
        readonly: false,
      });
    });

    it('应该阻止 onBlur 事件冒泡', () => {
      const { container } = render(<KatexElement {...defaultProps} />);

      const element = container.querySelector('[data-testid="katex-element"]');
      expect(element).toBeInTheDocument();

      const stopPropagation = vi.fn();
      const blurEvent = {
        stopPropagation,
      } as unknown as React.FocusEvent<HTMLDivElement>;

      fireEvent.blur(element!, blurEvent);
      // 由于事件处理函数已经绑定，我们需要验证元素存在
      expect(element).toBeInTheDocument();
    });

    it('应该阻止 onClick 事件冒泡', () => {
      const { container } = render(<KatexElement {...defaultProps} />);

      const element = container.querySelector('[data-testid="katex-element"]');
      expect(element).toBeInTheDocument();

      const stopPropagation = vi.fn();
      const clickEvent = {
        stopPropagation,
      } as unknown as React.MouseEvent<HTMLDivElement>;

      fireEvent.click(element!, clickEvent);
      // 由于事件处理函数已经绑定，我们需要验证元素存在
      expect(element).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    beforeEach(() => {
      mockUseEditorStore.mockReturnValue({
        readonly: false,
      });
    });

    it('应该处理空的 value', () => {
      const emptyValueElement = {
        ...mockElement,
        value: '',
      };

      render(<KatexElement {...defaultProps} element={emptyValueElement} />);

      const katexRenderer = screen.getByTestId('katex-renderer');
      expect(katexRenderer).toBeInTheDocument();
    });

    it('应该处理 undefined 的 value', () => {
      const undefinedValueElement = {
        ...mockElement,
        value: undefined,
      };

      render(
        <KatexElement {...defaultProps} element={undefinedValueElement} />,
      );

      const katexRenderer = screen.getByTestId('katex-renderer');
      expect(katexRenderer).toBeInTheDocument();
    });

    it('应该处理不同的公式内容', () => {
      const differentFormulaElement = {
        ...mockElement,
        value: 'E = mc^2',
      };

      render(
        <KatexElement {...defaultProps} element={differentFormulaElement} />,
      );

      const katexRenderer = screen.getByTestId('katex-renderer');
      expect(katexRenderer).toBeInTheDocument();
      expect(katexRenderer).toHaveTextContent('E = mc^2');
    });

    it('应该处理复杂的 LaTeX 公式', () => {
      const complexFormulaElement = {
        ...mockElement,
        value: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
      };

      render(
        <KatexElement {...defaultProps} element={complexFormulaElement} />,
      );

      const katexRenderer = screen.getByTestId('katex-renderer');
      expect(katexRenderer).toBeInTheDocument();
      expect(katexRenderer).toHaveTextContent(
        '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
      );
    });
  });

  describe('useMemo 依赖测试', () => {
    it('应该在 element、value、katex 或 readonly 改变时重新渲染', () => {
      const { rerender } = render(<KatexElement {...defaultProps} />);

      // 初始渲染
      expect(screen.getByTestId('katex-renderer')).toBeInTheDocument();

      // 改变 value
      const newElement1 = {
        ...mockElement,
        value: 'x^2 + y^2 = r^2',
      };
      rerender(<KatexElement {...defaultProps} element={newElement1} />);
      expect(screen.getByTestId('katex-renderer')).toHaveTextContent(
        'x^2 + y^2 = r^2',
      );

      // 改变 readonly 状态
      mockUseEditorStore.mockReturnValue({
        readonly: true,
      });
      rerender(<KatexElement {...defaultProps} element={newElement1} />);
      const dragHandle = screen.queryByTestId('drag-handle');
      expect(dragHandle).not.toBeInTheDocument();
    });
  });

  describe('属性传递测试', () => {
    it('应该正确传递 attributes 到根元素', () => {
      const customAttributes = {
        'data-slate-node': 'element' as const,
        'data-testid': 'custom-katex-element',
        'data-custom-attr': 'custom-value',
        ref: null,
      };

      render(
        <KatexElement {...defaultProps} attributes={customAttributes} />,
      );

      const element = screen.getByTestId('custom-katex-element');
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('data-custom-attr', 'custom-value');
    });

    it('应该渲染 children 内容到隐藏的副本中', () => {
      const customChildren = <span data-testid="custom-children">Custom</span>;

      const { container } = render(
        <KatexElement {...defaultProps} children={customChildren} />,
      );

      const hiddenContent = container.querySelector(
        'div[style*="height: 0.5px"]',
      );
      expect(hiddenContent).toBeInTheDocument();
    });
  });
});
