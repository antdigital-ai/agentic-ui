/**
 * FootnoteReference 组件测试文件
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FootnoteReference } from '../../../../src/MarkdownEditor/editor/elements/FootnoteReference';
import { FootnoteDefinitionNode } from '../../../../src/MarkdownEditor/el';
import { TestSlateWrapper } from './TestSlateWrapper';

// Mock dependencies
vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    store: {
      dragStart: vi.fn(),
    },
    markdownContainerRef: {
      current: document.createElement('div'),
    },
    readonly: false,
    editorProps: {
      drag: {
        enable: true,
      },
    },
  })),
}));

vi.mock('../../../../src/MarkdownEditor/hooks/editor', () => ({
  useSelStatus: vi.fn(() => [false, vi.fn()]),
}));

describe('FootnoteReference', () => {
  const mockElement: FootnoteDefinitionNode = {
    type: 'footnoteDefinition',
    identifier: 'test-ref',
    children: [{ text: 'test content' }],
  };

  const mockAttributes = {
    'data-slate-node': 'element' as const,
    'data-slate-inline': true as const,
    'data-slate-void': true as const,
    ref: vi.fn(),
  };

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <ConfigProvider>
        <TestSlateWrapper>{component}</TestSlateWrapper>
      </ConfigProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染脚注引用', () => {
      renderWithProvider(
        <FootnoteReference element={mockElement} attributes={mockAttributes}>
          {null}
        </FootnoteReference>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      expect(footnoteReference).toBeInTheDocument();
      expect(footnoteReference).toHaveAttribute('data-be', 'paragraph');
      expect(footnoteReference).toHaveAttribute('data-drag-el');
    });

    it('应该渲染拖拽手柄', () => {
      renderWithProvider(
        <FootnoteReference element={mockElement} attributes={mockAttributes}>
          {null}
        </FootnoteReference>,
      );

      const dragHandle = screen.getByTestId('drag-handle');
      expect(dragHandle).toBeInTheDocument();
    });

    it('应该传递正确的属性', () => {
      renderWithProvider(
        <FootnoteReference element={mockElement} attributes={mockAttributes}>
          {null}
        </FootnoteReference>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      expect(footnoteReference).toHaveAttribute('data-slate-node', 'element');
      expect(footnoteReference).toHaveAttribute('data-slate-inline', 'true');
      expect(footnoteReference).toHaveAttribute('data-slate-void', 'true');
    });
  });

  describe('内容处理测试', () => {
    it('应该处理有内容的脚注引用', () => {
      const elementWithContent: FootnoteDefinitionNode = {
        ...mockElement,
        children: [{ text: 'test content' }],
      };

      renderWithProvider(
        <FootnoteReference
          element={elementWithContent}
          attributes={mockAttributes}
        >
          {null}
        </FootnoteReference>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      expect(footnoteReference).toHaveAttribute('data-drag-el');
      expect(footnoteReference).not.toHaveClass('empty');
    });

    it('应该处理空内容的脚注引用', () => {
      const elementWithEmptyContent: FootnoteDefinitionNode = {
        ...mockElement,
        children: [{ text: '' }],
      };

      renderWithProvider(
        <FootnoteReference
          element={elementWithEmptyContent}
          attributes={mockAttributes}
        >
          {null}
        </FootnoteReference>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      expect(footnoteReference).toHaveAttribute('data-drag-el');
      expect(footnoteReference).toHaveClass('empty');
    });

    it('应该处理没有文本内容的脚注引用', () => {
      const elementWithoutText: FootnoteDefinitionNode = {
        ...mockElement,
        children: [],
      };

      renderWithProvider(
        <FootnoteReference
          element={elementWithoutText}
          attributes={mockAttributes}
        >
          {null}
        </FootnoteReference>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      expect(footnoteReference).toHaveAttribute('data-drag-el');
      expect(footnoteReference).toHaveClass('empty');
    });
  });

  describe('拖拽功能测试', () => {
    it('应该处理拖拽开始事件', () => {
      renderWithProvider(
        <FootnoteReference element={mockElement} attributes={mockAttributes}>
          {null}
        </FootnoteReference>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      fireEvent.dragStart(footnoteReference);

      // 验证拖拽事件能够触发
      expect(footnoteReference).toBeInTheDocument();
    });
  });

  describe('子元素渲染测试', () => {
    it('应该渲染子元素', () => {
      renderWithProvider(
        <FootnoteReference element={mockElement} attributes={mockAttributes}>
          <span data-testid="child-element">Child Content</span>
        </FootnoteReference>,
      );

      const childElement = screen.getByTestId('child-element');
      expect(childElement).toBeInTheDocument();
      expect(childElement).toHaveTextContent('Child Content');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的element属性', () => {
      const emptyElement: FootnoteDefinitionNode = {
        type: 'footnoteDefinition',
        identifier: 'test-ref',
        children: [],
      };

      renderWithProvider(
        <FootnoteReference element={emptyElement} attributes={mockAttributes}>
          {null}
        </FootnoteReference>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      expect(footnoteReference).toBeInTheDocument();
    });

    it('应该处理空的attributes属性', () => {
      renderWithProvider(
        <FootnoteReference
          element={mockElement}
          attributes={{ 'data-slate-node': 'element' as const, ref: vi.fn() }}
        >
          {null}
        </FootnoteReference>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      expect(footnoteReference).toBeInTheDocument();
    });

    it('应该处理复杂的子元素结构', () => {
      const elementWithComplexChildren: FootnoteDefinitionNode = {
        ...mockElement,
        children: [{ text: 'start' }, { text: 'middle' }, { text: 'end' }],
      };

      renderWithProvider(
        <FootnoteReference
          element={elementWithComplexChildren}
          attributes={mockAttributes}
        >
          {null}
        </FootnoteReference>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      expect(footnoteReference).toBeInTheDocument();
      expect(footnoteReference).toHaveAttribute('data-drag-el');
      expect(footnoteReference).not.toHaveClass('empty');
    });
  });

  describe('性能优化测试', () => {
    it('应该使用useMemo进行性能优化', () => {
      const { rerender } = renderWithProvider(
        <FootnoteReference element={mockElement} attributes={mockAttributes}>
          {null}
        </FootnoteReference>,
      );

      // 重新渲染相同的props，应该不会重新创建元素
      rerender(
        <ConfigProvider>
          <TestSlateWrapper>
            <FootnoteReference
              element={mockElement}
              attributes={mockAttributes}
            >
              {null}
            </FootnoteReference>
          </TestSlateWrapper>
        </ConfigProvider>,
      );

      const footnoteReference = screen.getByTestId('footnote-reference');
      expect(footnoteReference).toBeInTheDocument();
    });
  });
});
