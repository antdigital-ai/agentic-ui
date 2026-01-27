/**
 * ReadonlySchema 组件测试文件
 */

import { ReadonlySchema } from '@ant-design/agentic-ui/MarkdownEditor/editor/elements';
import { CodeNode } from '@ant-design/agentic-ui/MarkdownEditor/el';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock SchemaRenderer
vi.mock('@ant-design/agentic-ui/schema', () => ({
  SchemaRenderer: ({ schema }: any) => (
    <div data-testid="schema-renderer" data-schema={JSON.stringify(schema)}>
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

describe('ReadonlySchema', () => {
  const mockElement: CodeNode = {
    type: 'code',
    language: 'json',
    children: [{ text: '' }],
    value: JSON.stringify({
      type: 'object',
      properties: {
        name: { type: 'string' },
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
    mockEditorProps.apaasify.enable = false;
    mockEditorProps.apaasify.render = null;
  });

  it('render 返回 undefined 时应回退内部默认渲染', () => {
    mockEditorProps.codeProps = {
      render: vi.fn(() => undefined),
    };

    renderWithProvider(
      <ReadonlySchema element={mockElement} attributes={mockAttributes}>
        {null}
      </ReadonlySchema>,
    );

    // ReadonlySchema 默认分支为 <pre> JSON 文本渲染（没有 schema-container）
    expect(screen.getByText(/properties/)).toBeInTheDocument();
    expect(mockEditorProps.codeProps.render).toHaveBeenCalled();
  });

  it('render 返回自定义节点时应使用自定义渲染', () => {
    mockEditorProps.codeProps = {
      render: vi.fn(() => <div data-testid="custom-render">Custom</div>),
    };

    renderWithProvider(
      <ReadonlySchema element={mockElement} attributes={mockAttributes}>
        {null}
      </ReadonlySchema>,
    );

    expect(screen.getByTestId('custom-render')).toBeInTheDocument();
  });

  it('agentar-card 默认应渲染 SchemaRenderer', () => {
    const elementWithAgentarCard: CodeNode = {
      ...mockElement,
      language: 'agentar-card',
      value: JSON.stringify({
        type: 'object',
        properties: { title: { type: 'string' } },
        initialValues: { title: 'Test Title' },
      }),
    };

    renderWithProvider(
      <ReadonlySchema element={elementWithAgentarCard} attributes={mockAttributes}>
        {null}
      </ReadonlySchema>,
    );

    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('agentar-card-container')).toHaveAttribute(
      'data-agentar-card',
    );
  });

  it('agentar-card 在 render 返回 undefined 时应回退 SchemaRenderer', () => {
    const elementWithAgentarCard: CodeNode = {
      ...mockElement,
      language: 'agentar-card',
    };
    mockEditorProps.codeProps = {
      render: vi.fn(() => undefined),
    };

    renderWithProvider(
      <ReadonlySchema element={elementWithAgentarCard} attributes={mockAttributes}>
        {null}
      </ReadonlySchema>,
    );

    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();
    expect(mockEditorProps.codeProps.render).toHaveBeenCalled();
  });

  it('apaasify 默认应渲染 schema-container 与自定义内容', () => {
    mockEditorProps.apaasify.enable = true;
    mockEditorProps.apaasify.render = vi.fn(() => (
      <div data-testid="apaasify-render">Apaasify</div>
    ));

    renderWithProvider(
      <ReadonlySchema element={mockElement} attributes={mockAttributes}>
        {null}
      </ReadonlySchema>,
    );

    expect(screen.getByTestId('schema-container')).toBeInTheDocument();
    expect(screen.getByTestId('apaasify-render')).toBeInTheDocument();
  });
});

