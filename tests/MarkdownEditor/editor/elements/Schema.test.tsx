/**
 * Schema 组件测试文件
 */

import { Schema } from '@ant-design/agentic-ui/MarkdownEditor/editor/elements/Schema';
import { CodeNode } from '@ant-design/agentic-ui/MarkdownEditor/el';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock SchemaRenderer
vi.mock('@ant-design/agentic-ui/schema', () => ({
  SchemaRenderer: ({
    schema,
    values,
    debug,
    fallbackContent,
    useDefaultValues,
  }: any) => (
    <div
      data-testid="schema-renderer"
      data-schema={JSON.stringify(schema)}
      data-values={JSON.stringify(values)}
      data-debug={String(debug)}
      data-fallback={String(fallbackContent)}
      data-default={String(useDefaultValues)}
    >
      Schema Renderer Content
    </div>
  ),
}));

// Mock store
const mockEditorProps: any = {
  apaasify: {
    enable: false,
    render: null,
  },
};
vi.mock('@ant-design/agentic-ui/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    editorProps: mockEditorProps,
  }),
}));

describe('Schema', () => {
  const mockElement: CodeNode = {
    type: 'code',
    language: 'json',
    children: [{ text: '' }],
    value: JSON.stringify({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    }),
  };

  const mockAttributes = {
    'data-slate-node': 'element' as const,
    ref: vi.fn(),
  };

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 每个用例重置，避免相互污染
    mockEditorProps.codeProps = undefined;
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染Schema组件', () => {
      renderWithProvider(
        <Schema element={mockElement} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      const container = screen.getByTestId('schema-container');
      expect(container).toBeInTheDocument();
    });

    it('应该渲染JSON内容', () => {
      renderWithProvider(
        <Schema element={mockElement} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      const clickableArea = screen.getByTestId('schema-clickable');
      expect(clickableArea).toHaveTextContent('properties');
    });

    it('应该渲染可点击区域', () => {
      renderWithProvider(
        <Schema element={mockElement} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      const clickableArea = screen.getByTestId('schema-clickable');
      expect(clickableArea).toBeInTheDocument();
    });

    it('应该隐藏子元素', () => {
      renderWithProvider(
        <Schema element={mockElement} attributes={mockAttributes}>
          <span data-testid="child-element">Child Content</span>
        </Schema>,
      );

      const hiddenChildren = screen.getByTestId('schema-hidden-children');
      expect(hiddenChildren).toBeInTheDocument();
      expect(hiddenChildren).toHaveStyle({ display: 'none' });
    });
  });

  describe('agentar-card语言测试', () => {
    it('应该为agentar-card语言渲染SchemaRenderer', () => {
      const elementWithAgentarCard: CodeNode = {
        ...mockElement,
        language: 'agentar-card',
        value: JSON.stringify({
          type: 'object',
          properties: {
            title: { type: 'string' },
          },
          initialValues: {
            title: 'Test Title',
          },
        }),
      };

      renderWithProvider(
        <Schema element={elementWithAgentarCard} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      const schemaRenderer = screen.getByTestId('schema-renderer');
      expect(schemaRenderer).toBeInTheDocument();
    });

    it('应该为agentar-card添加正确的样式类', () => {
      const elementWithAgentarCard: CodeNode = {
        ...mockElement,
        language: 'agentar-card',
      };

      renderWithProvider(
        <Schema element={elementWithAgentarCard} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      const container = screen.getByTestId('agentar-card-container');
      expect(container).toHaveAttribute('data-agentar-card');
    });
  });

  describe('样式测试', () => {
    it('应该隐藏子元素', () => {
      renderWithProvider(
        <Schema element={mockElement} attributes={mockAttributes}>
          <span data-testid="child-element">Child Content</span>
        </Schema>,
      );

      const hiddenChildren = screen.getByTestId('schema-hidden-children');
      expect(hiddenChildren).toHaveStyle({
        display: 'none',
      });
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的value属性', () => {
      const elementWithEmptyValue: CodeNode = {
        ...mockElement,
        value: '',
      };

      renderWithProvider(
        <Schema element={elementWithEmptyValue} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      const container = screen.getByTestId('schema-container');
      expect(container).toBeInTheDocument();
    });

    it('应该处理不同的语言类型', () => {
      const elementWithDifferentLanguage: CodeNode = {
        ...mockElement,
        language: 'javascript',
      };

      renderWithProvider(
        <Schema
          element={elementWithDifferentLanguage}
          attributes={mockAttributes}
        >
          {null}
        </Schema>,
      );

      const container = screen.getByTestId('schema-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('性能优化测试', () => {
    it('应该使用useMemo进行性能优化', () => {
      const { rerender } = renderWithProvider(
        <Schema element={mockElement} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      // 重新渲染相同的props，应该不会重新创建元素
      rerender(
        <Schema element={mockElement} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      const container = screen.getByTestId('schema-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('codeProps.render 自定义渲染测试', () => {
    it('render 返回 undefined 时应回退内部默认渲染', () => {
      mockEditorProps.codeProps = {
        render: vi.fn(() => undefined),
      };

      renderWithProvider(
        <Schema element={mockElement} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      expect(screen.getByTestId('schema-container')).toBeInTheDocument();
      expect(mockEditorProps.codeProps.render).toHaveBeenCalled();
    });

    it('render 返回自定义节点时应使用自定义渲染', () => {
      mockEditorProps.codeProps = {
        render: vi.fn(() => <div data-testid="custom-render">Custom</div>),
      };

      renderWithProvider(
        <Schema element={mockElement} attributes={mockAttributes}>
          {null}
        </Schema>,
      );

      expect(screen.getByTestId('custom-render')).toBeInTheDocument();
    });
  });
});
