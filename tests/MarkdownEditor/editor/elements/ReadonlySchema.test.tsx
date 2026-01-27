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
});

