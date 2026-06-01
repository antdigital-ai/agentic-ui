/**
 * Schema 组件扩展测试文件
 * 测试新增的 BubbleConfigContext 使用和 apaasify.render 中 bubble 参数传递功能
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../../../../Bubble/BubbleConfigProvide';
import { Schema } from '../../../../editor/elements/Schema';
import { EditorStoreContext } from '../../../../editor/store';

// Mock SchemaRenderer
vi.mock('../../../../../Schema', () => ({
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

describe('Schema - BubbleConfigContext 功能', () => {
  const mockElement = {
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

  const mockBubbleData = {
    placement: 'left' as const,
    originData: {
      content: 'Test bubble content',
      uuid: 12345,
      id: 'test-bubble',
      role: 'user' as const,
      createAt: Date.now(),
      updateAt: Date.now(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在 apaasify.render 中传递 bubble 参数', () => {
    const mockApaasifyRender = vi.fn().mockReturnValue(
      <div data-testid="apaasify-rendered">
        <span data-testid="bubble-id">Bubble ID</span>
        <span data-testid="bubble-content">Bubble Content</span>
      </div>,
    );

    const mockEditorStore = {
      editorProps: {
        apaasify: {
          enable: true,
          render: mockApaasifyRender,
        },
      },
    };

    render(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{
            standalone: false,
            locale: {} as any,
            bubble: mockBubbleData,
          }}
        >
          <EditorStoreContext.Provider value={mockEditorStore as any}>
            <Schema element={mockElement as any} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 验证 apaasify.render 被调用
    expect(mockApaasifyRender).toHaveBeenCalled();

    // 验证 render 函数接收到正确的参数
    const [propsArg, bubbleArg] = mockApaasifyRender.mock.calls[0];
    expect(propsArg).toBeDefined();
    expect(propsArg.element).toEqual(mockElement);
    expect(bubbleArg).toEqual(mockBubbleData.originData);

    // 验证渲染结果
    expect(screen.getByTestId('apaasify-rendered')).toBeInTheDocument();
    expect(screen.getByTestId('bubble-id')).toBeInTheDocument();
    expect(screen.getByTestId('bubble-content')).toBeInTheDocument();
  });

  it('应该在没有 bubble context 时正常工作', () => {
    const mockApaasifyRender = vi
      .fn()
      .mockReturnValue(<div data-testid="apaasify-no-bubble">No Bubble</div>);

    const mockEditorStore = {
      editorProps: {
        apaasify: {
          enable: true,
          render: mockApaasifyRender,
        },
      },
    };

    render(
      <ConfigProvider>
        <EditorStoreContext.Provider value={mockEditorStore as any}>
          <Schema element={mockElement as any} attributes={mockAttributes}>
            {null}
          </Schema>
        </EditorStoreContext.Provider>
      </ConfigProvider>,
    );

    // 验证 render 函数被调用，bubble 参数为 undefined
    expect(mockApaasifyRender).toHaveBeenCalled();
    const [propsArg, bubbleArg] = mockApaasifyRender.mock.calls[0];
    expect(propsArg).toBeDefined();
    expect(bubbleArg).toBeUndefined();

    expect(screen.getByTestId('apaasify-no-bubble')).toBeInTheDocument();
  });

  it('应该支持 agentar-card 语言类型的特殊处理', () => {
    const cardElement = {
      ...mockElement,
      language: 'agentar-card',
      value: {
        type: 'form',
        properties: {
          title: { type: 'string', default: 'Test Card' },
        },
        initialValues: { title: 'Initial Title' },
      },
    };

    const mockEditorStore = {
      editorProps: {},
    };

    render(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{
            standalone: false,
            locale: {} as any,
            bubble: mockBubbleData,
          }}
        >
          <EditorStoreContext.Provider value={mockEditorStore as any}>
            <Schema element={cardElement as any} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 验证 agentar-card 的特殊容器
    expect(screen.getByTestId('agentar-card-container')).toBeInTheDocument();
    expect(screen.getByTestId('schema-renderer')).toBeInTheDocument();

    // 验证 SchemaRenderer 接收到正确的 props
    const schemaRenderer = screen.getByTestId('schema-renderer');
    expect(schemaRenderer).toHaveAttribute(
      'data-schema',
      JSON.stringify(cardElement.value),
    );
    expect(schemaRenderer).toHaveAttribute(
      'data-values',
      JSON.stringify(cardElement.value.initialValues),
    );
    expect(schemaRenderer).toHaveAttribute('data-debug', 'false');
    expect(schemaRenderer).toHaveAttribute('data-default', 'false');
  });

  it('应该在 apaasify 未启用时使用默认渲染', () => {
    const mockEditorStore = {
      editorProps: {
        apaasify: {
          enable: false,
        },
      },
    };

    render(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{
            standalone: false,
            locale: {} as any,
            bubble: mockBubbleData,
          }}
        >
          <EditorStoreContext.Provider value={mockEditorStore as any}>
            <Schema element={mockElement as any} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 验证使用默认的 schema 容器
    expect(screen.getByTestId('schema-container')).toBeInTheDocument();
    expect(screen.getByTestId('schema-clickable')).toBeInTheDocument();
    expect(screen.getByTestId('schema-hidden-children')).toBeInTheDocument();

    // 验证显示的是原始的 JSON 数据
    expect(screen.getByTestId('schema-clickable')).toHaveTextContent(
      mockElement.value,
    );
  });
});
