/**
 * Schema 组件扩展测试文件
 * 测试新增的 BubbleConfigContext 使用和 apaasify.render 中 bubble 参数传递功能
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../../../../src/Bubble/BubbleConfigProvide';
import { Schema } from '../../../../src/MarkdownEditor/editor/elements/Schema';
import { EditorStoreContext } from '../../../../src/MarkdownEditor/editor/store';
import { CodeNode } from '../../../../src/MarkdownEditor/el';

// Mock SchemaRenderer
vi.mock('../../../src/Schema', () => ({
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
            <Schema element={mockElement} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 验证 apaasify.render 被调用
    expect(mockApaasifyRender).toHaveBeenCalledTimes(1);

    // 验证传递的参数
    const [propsArg, bubbleArg] = mockApaasifyRender.mock.calls[0];
    expect(propsArg.element).toBe(mockElement);
    expect(bubbleArg).toEqual(mockBubbleData.originData);

    // 验证渲染的内容
    expect(screen.getByTestId('apaasify-rendered')).toBeInTheDocument();
    expect(screen.getByTestId('bubble-id')).toBeInTheDocument();
    expect(screen.getByTestId('bubble-content')).toBeInTheDocument();
  });

  it('应该支持 agentar-card 语言类型的特殊处理', () => {
    const cardElement: CodeNode = {
      type: 'code',
      language: 'agentar-card',
      children: [{ text: '' }],
      value: JSON.stringify({
        type: 'form',
        properties: {
          title: {
            type: 'string',
            default: 'Test Card',
          },
        },
        initialValues: {
          title: 'Initial Title',
        },
      }),
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
          <EditorStoreContext.Provider value={{ editorProps: {} } as any}>
            <Schema element={cardElement} attributes={mockAttributes}>
              {undefined}
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
    expect(schemaRenderer).toMatchSnapshot();
  });

  it('应该在 bubble 数据变化时正确更新 apaasify.render', () => {
    const mockApaasifyRender = vi
      .fn()
      .mockReturnValue(
        <div data-testid="dynamic-apaasify">Dynamic Content</div>,
      );

    const mockEditorStore = {
      editorProps: {
        apaasify: {
          enable: true,
          render: mockApaasifyRender,
        },
      },
    };

    const initialBubble = {
      ...mockBubbleData,
      originData: {
        ...mockBubbleData.originData,
        content: 'Initial content',
        uuid: 111,
      },
    };

    const updatedBubble = {
      ...mockBubbleData,
      originData: {
        ...mockBubbleData.originData,
        content: 'Updated content',
        uuid: 222,
      },
    };

    const { rerender } = render(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{
            standalone: false,
            locale: {} as any,
            bubble: initialBubble,
          }}
        >
          <EditorStoreContext.Provider value={mockEditorStore as any}>
            <Schema element={mockElement} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 初始调用
    expect(mockApaasifyRender).toHaveBeenCalledTimes(1);
    const [, initialBubbleArg] = mockApaasifyRender.mock.calls[0];
    expect(initialBubbleArg.uuid).toBe(111);

    // 更新 bubble context
    rerender(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{
            standalone: false,
            locale: {} as any,
            bubble: updatedBubble,
          }}
        >
          <EditorStoreContext.Provider value={mockEditorStore as any}>
            <Schema element={mockElement} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 验证 render 函数被再次调用，且接收到更新的 bubble 数据
    expect(mockApaasifyRender).toHaveBeenCalledTimes(2);
    const [, updatedBubbleArg] = mockApaasifyRender.mock.calls[1];
    expect(updatedBubbleArg.uuid).toBe(222);
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
            <Schema element={mockElement} attributes={mockAttributes}>
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

    // 验证显示的是原始的 JSON 数据（不检查具体格式，只检查内容）
    const schemaClickable = screen.getByTestId('schema-clickable');
    const displayedContent = schemaClickable.textContent;
    const expectedContent = mockElement.value;

    // 移除所有空白字符后比较
    expect(displayedContent?.replace(/\s/g, '')).toBe(
      expectedContent.replace(/\s/g, ''),
    );
  });

  it('应该正确处理复杂的 bubble 数据结构', () => {
    const complexBubbleData = {
      placement: 'right' as const,
      originData: {
        content: 'Complex content with **markdown**',
        uuid: 99999,
        id: 'complex-bubble',
        role: 'assistant' as const,
        createAt: Date.now(),
        updateAt: Date.now(),
        meta: {
          source: 'test',
          confidence: 0.95,
        },
        extra: {
          attachments: ['file1.pdf', 'file2.png'],
        },
      },
      avatar: {
        title: 'AI Assistant',
        name: 'Assistant',
        avatar: 'assistant-avatar.png',
      },
    };

    const mockApaasifyRender = vi.fn().mockReturnValue(
      <div data-testid="complex-apaasify">
        <span data-testid="bubble-meta">
          {JSON.stringify(complexBubbleData.originData.meta)}
        </span>
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
            standalone: true,
            locale: {} as any,
            bubble: complexBubbleData,
          }}
        >
          <EditorStoreContext.Provider value={mockEditorStore as any}>
            <Schema element={mockElement} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 验证复杂数据结构被正确传递
    expect(mockApaasifyRender).toHaveBeenCalled();
    const [, bubbleArg] = mockApaasifyRender.mock.calls[0];
    expect(bubbleArg).toEqual(complexBubbleData.originData);
    expect(bubbleArg.meta).toEqual({
      source: 'test',
      confidence: 0.95,
    });

    expect(screen.getByTestId('complex-apaasify')).toBeInTheDocument();
  });

  it('应该能在 apaasify.render 中获取到 isLast 属性', () => {
    // 创建一个可以访问 bubble 参数的 render 函数
    const mockApaasifyRender = vi.fn((props: any, bubble: any) => (
      <div data-testid="apaasify-islast-test">
        <span data-testid="is-last-value">
          {String(bubble?.isLast ?? 'undefined')}
        </span>
        <span data-testid="bubble-id">{bubble?.id ?? 'no-id'}</span>
      </div>
    ));

    const mockEditorStore = {
      editorProps: {
        apaasify: {
          enable: true,
          render: mockApaasifyRender,
        },
      },
    };

    // 测试 isLast 为 true 的情况
    const bubbleWithIsLastTrue = {
      ...mockBubbleData,
      originData: {
        ...mockBubbleData.originData,
        isLast: true,
      },
    };

    render(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{
            standalone: false,
            locale: {} as any,
            bubble: bubbleWithIsLastTrue,
          }}
        >
          <EditorStoreContext.Provider value={mockEditorStore as any}>
            <Schema element={mockElement} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 验证 apaasify.render 被调用
    expect(mockApaasifyRender).toHaveBeenCalledTimes(1);

    // 验证传递的 originData 包含 isLast 属性
    const [, bubbleArg] = mockApaasifyRender.mock.calls[0];
    expect(bubbleArg).toBeDefined();
    expect(bubbleArg.isLast).toBe(true);

    // 验证渲染的内容中包含 isLast 值
    expect(screen.getByTestId('apaasify-islast-test')).toBeInTheDocument();
    expect(screen.getByTestId('is-last-value')).toHaveTextContent('true');
    expect(screen.getByTestId('bubble-id')).toHaveTextContent(
      bubbleWithIsLastTrue.originData.id,
    );
  });

  it('应该能在 apaasify.render 中获取到更新后的 isLast 属性', () => {
    // 创建一个可以访问 bubble 参数的 render 函数
    const mockApaasifyRender = vi.fn((props: any, bubble: any) => (
      <div data-testid="apaasify-islast-dynamic">
        <span data-testid="is-last-value">
          {String(bubble?.isLast ?? 'undefined')}
        </span>
        <span data-testid="bubble-id">{bubble?.id ?? 'no-id'}</span>
      </div>
    ));

    const mockEditorStore = {
      editorProps: {
        apaasify: {
          enable: true,
          render: mockApaasifyRender,
        },
      },
    };

    // 初始状态：isLast 为 true
    const initialBubble = {
      ...mockBubbleData,
      originData: {
        ...mockBubbleData.originData,
        isLast: true,
      },
    };

    const { rerender } = render(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{
            standalone: false,
            locale: {} as any,
            bubble: initialBubble,
          }}
        >
          <EditorStoreContext.Provider value={mockEditorStore as any}>
            <Schema element={mockElement} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 验证初始调用时 isLast 为 true
    expect(mockApaasifyRender).toHaveBeenCalledTimes(1);
    const [, initialBubbleArg] = mockApaasifyRender.mock.calls[0];
    expect(initialBubbleArg.isLast).toBe(true);

    // 更新状态：isLast 变为 false
    const updatedBubble = {
      ...mockBubbleData,
      originData: {
        ...mockBubbleData.originData,
        isLast: false,
      },
    };

    rerender(
      <ConfigProvider>
        <BubbleConfigContext.Provider
          value={{
            standalone: false,
            locale: {} as any,
            bubble: updatedBubble,
          }}
        >
          <EditorStoreContext.Provider value={mockEditorStore as any}>
            <Schema element={mockElement} attributes={mockAttributes}>
              {null}
            </Schema>
          </EditorStoreContext.Provider>
        </BubbleConfigContext.Provider>
      </ConfigProvider>,
    );

    // 验证 render 函数被再次调用，且接收到更新的 isLast 值
    expect(mockApaasifyRender).toHaveBeenCalledTimes(2);
    const [, updatedBubbleArg] = mockApaasifyRender.mock.calls[1];
    expect(updatedBubbleArg.isLast).toBe(false);
  });

  describe('BubbleList isLast 和 apaasify 集成测试', () => {
    it('应该在 BubbleList 场景下，当 isLast 更新时，apaasify render 能正确获取到更新的值', () => {
      // 创建一个可以记录 isLast 变化的 render 函数
      const isLastValues: boolean[] = [];
      const bubbleIds: string[] = [];

      const mockApaasifyRender = vi.fn((props: any, bubble: any) => {
        // 记录每次调用时的 isLast 值和 bubble id
        isLastValues.push(bubble?.isLast ?? false);
        bubbleIds.push(bubble?.id ?? 'unknown');

        return (
          <div data-testid={`apaasify-bubble-${bubble?.id}`}>
            <span data-testid={`is-last-${bubble?.id}`}>
              {String(bubble?.isLast ?? false)}
            </span>
            <span data-testid={`bubble-id-${bubble?.id}`}>
              {bubble?.id ?? 'no-id'}
            </span>
          </div>
        );
      });

      const mockEditorStore = {
        editorProps: {
          apaasify: {
            enable: true,
            render: mockApaasifyRender,
          },
        },
      };

      // 模拟第一个气泡（初始状态下是最后一个）
      const firstBubbleData = {
        ...mockBubbleData,
        originData: {
          ...mockBubbleData.originData,
          id: 'bubble-1',
          isLast: true, // 初始状态：是最后一个
        },
      };

      const { rerender } = render(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: firstBubbleData,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      // 验证初始调用：isLast 为 true
      expect(mockApaasifyRender).toHaveBeenCalledTimes(1);
      expect(isLastValues[0]).toBe(true);
      expect(bubbleIds[0]).toBe('bubble-1');
      expect(screen.getByTestId('is-last-bubble-1')).toHaveTextContent('true');

      // 模拟添加新气泡后，第一个气泡不再是最后一个
      const updatedFirstBubbleData = {
        ...firstBubbleData,
        originData: {
          ...firstBubbleData.originData,
          isLast: false, // 更新后：不再是最后一个
        },
      };

      rerender(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: updatedFirstBubbleData,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      // 验证再次调用：isLast 已更新为 false
      expect(mockApaasifyRender).toHaveBeenCalledTimes(2);
      expect(isLastValues[1]).toBe(false);
      expect(bubbleIds[1]).toBe('bubble-1');
      expect(screen.getByTestId('is-last-bubble-1')).toHaveTextContent('false');

      // 模拟第二个气泡（新添加的，是最后一个）
      const secondBubbleData = {
        ...mockBubbleData,
        originData: {
          ...mockBubbleData.originData,
          id: 'bubble-2',
          isLast: true, // 新气泡：是最后一个
        },
      };

      rerender(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: secondBubbleData,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      // 验证第三个气泡的调用：isLast 为 true
      expect(mockApaasifyRender).toHaveBeenCalledTimes(3);
      expect(isLastValues[2]).toBe(true);
      expect(bubbleIds[2]).toBe('bubble-2');
      expect(screen.getByTestId('is-last-bubble-2')).toHaveTextContent('true');

      // 验证整个调用序列的 isLast 值变化
      expect(isLastValues).toEqual([true, false, true]);
    });

    it('应该在多个气泡场景下，正确区分不同气泡的 isLast 状态', () => {
      const mockApaasifyRender = vi.fn((props: any, bubble: any) => (
        <div data-testid={`apaasify-bubble-${bubble?.id}`}>
          <span data-testid={`is-last-${bubble?.id}`}>
            {String(bubble?.isLast ?? false)}
          </span>
        </div>
      ));

      const mockEditorStore = {
        editorProps: {
          apaasify: {
            enable: true,
            render: mockApaasifyRender,
          },
        },
      };

      // 模拟三个气泡的场景
      const bubble1 = {
        ...mockBubbleData,
        originData: {
          ...mockBubbleData.originData,
          id: 'msg-1',
          isLast: false, // 第一个气泡：不是最后一个
        },
      };

      const bubble2 = {
        ...mockBubbleData,
        originData: {
          ...mockBubbleData.originData,
          id: 'msg-2',
          isLast: false, // 第二个气泡：不是最后一个
        },
      };

      const bubble3 = {
        ...mockBubbleData,
        originData: {
          ...mockBubbleData.originData,
          id: 'msg-3',
          isLast: true, // 第三个气泡：是最后一个
        },
      };

      // 渲染第一个气泡
      const { rerender } = render(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: bubble1,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      expect(mockApaasifyRender).toHaveBeenCalledTimes(1);
      const [, bubble1Arg] = mockApaasifyRender.mock.calls[0];
      expect(bubble1Arg.isLast).toBe(false);
      expect(bubble1Arg.id).toBe('msg-1');

      // 渲染第二个气泡
      rerender(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: bubble2,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      expect(mockApaasifyRender).toHaveBeenCalledTimes(2);
      const [, bubble2Arg] = mockApaasifyRender.mock.calls[1];
      expect(bubble2Arg.isLast).toBe(false);
      expect(bubble2Arg.id).toBe('msg-2');

      // 渲染第三个气泡（最后一个）
      rerender(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: bubble3,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      expect(mockApaasifyRender).toHaveBeenCalledTimes(3);
      const [, bubble3Arg] = mockApaasifyRender.mock.calls[2];
      expect(bubble3Arg.isLast).toBe(true);
      expect(bubble3Arg.id).toBe('msg-3');

      // 验证所有调用都传入了正确的 isLast 值
      expect(
        mockApaasifyRender.mock.calls.map((call) => call[1].isLast),
      ).toEqual([false, false, true]);
    });

    it('应该在 isLast 从 false 更新到 true 时，apaasify render 能正确获取到更新的值', () => {
      const mockApaasifyRender = vi.fn((props: any, bubble: any) => (
        <div data-testid={`apaasify-bubble-${bubble?.id}`}>
          <span data-testid={`is-last-${bubble?.id}`}>
            {String(bubble?.isLast ?? false)}
          </span>
          <span data-testid={`bubble-id-${bubble?.id}`}>
            {bubble?.id ?? 'no-id'}
          </span>
        </div>
      ));

      const mockEditorStore = {
        editorProps: {
          apaasify: {
            enable: true,
            render: mockApaasifyRender,
          },
        },
      };

      // 模拟场景：初始状态下有两个气泡，第二个是最后一个
      const bubble1 = {
        ...mockBubbleData,
        originData: {
          ...mockBubbleData.originData,
          id: 'msg-1',
          isLast: false, // 第一个气泡：不是最后一个
        },
      };

      const bubble2 = {
        ...mockBubbleData,
        originData: {
          ...mockBubbleData.originData,
          id: 'msg-2',
          isLast: true, // 第二个气泡：是最后一个
        },
      };

      // 渲染第一个气泡（isLast: false）
      const { rerender } = render(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: bubble1,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      // 验证初始调用：isLast 为 false
      expect(mockApaasifyRender).toHaveBeenCalledTimes(1);
      const [, initialBubbleArg] = mockApaasifyRender.mock.calls[0];
      expect(initialBubbleArg.isLast).toBe(false);
      expect(initialBubbleArg.id).toBe('msg-1');
      expect(screen.getByTestId('is-last-msg-1')).toHaveTextContent('false');

      // 渲染第二个气泡（isLast: true）- 模拟切换渲染不同的气泡
      rerender(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: bubble2,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      // 验证第二个气泡的调用：isLast 为 true
      expect(mockApaasifyRender).toHaveBeenCalledTimes(2);
      const [, secondBubbleArg] = mockApaasifyRender.mock.calls[1];
      expect(secondBubbleArg.isLast).toBe(true);
      expect(secondBubbleArg.id).toBe('msg-2');
      expect(screen.getByTestId('is-last-msg-2')).toHaveTextContent('true');

      // 模拟场景：移除最后一个气泡后，第一个气泡变成最后一个（isLast 从 false 变为 true）
      const updatedBubble1 = {
        ...bubble1,
        originData: {
          ...bubble1.originData,
          isLast: true, // 更新后：变成最后一个
        },
      };

      rerender(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: updatedBubble1,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      // 验证更新后的调用：isLast 从 false 变为 true
      expect(mockApaasifyRender).toHaveBeenCalledTimes(3);
      const [, updatedBubbleArg] = mockApaasifyRender.mock.calls[2];
      expect(updatedBubbleArg.isLast).toBe(true);
      expect(updatedBubbleArg.id).toBe('msg-1');
      expect(screen.getByTestId('is-last-msg-1')).toHaveTextContent('true');

      // 验证整个调用序列的 isLast 值变化：false -> true -> true
      expect(
        mockApaasifyRender.mock.calls.map((call) => call[1].isLast),
      ).toEqual([false, true, true]);

      // 验证同一个气泡（msg-1）的 isLast 从 false 变为 true
      const msg1Calls = mockApaasifyRender.mock.calls.filter(
        (call) => call[1].id === 'msg-1',
      );
      expect(msg1Calls.map((call) => call[1].isLast)).toEqual([false, true]);
    });

    it('应该在移除最后一个气泡后，之前的倒数第二个气泡的 isLast 从 false 更新为 true', () => {
      const isLastValues: boolean[] = [];
      const bubbleIds: string[] = [];

      const mockApaasifyRender = vi.fn((props: any, bubble: any) => {
        isLastValues.push(bubble?.isLast ?? false);
        bubbleIds.push(bubble?.id ?? 'unknown');

        return (
          <div data-testid={`apaasify-bubble-${bubble?.id}`}>
            <span data-testid={`is-last-${bubble?.id}`}>
              {String(bubble?.isLast ?? false)}
            </span>
          </div>
        );
      });

      const mockEditorStore = {
        editorProps: {
          apaasify: {
            enable: true,
            render: mockApaasifyRender,
          },
        },
      };

      // 初始状态：有三个气泡，第三个是最后一个
      const initialBubble2 = {
        ...mockBubbleData,
        originData: {
          ...mockBubbleData.originData,
          id: 'msg-2',
          isLast: false, // 第二个气泡：不是最后一个
        },
      };

      const { rerender } = render(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: initialBubble2,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      // 验证初始状态：isLast 为 false
      expect(mockApaasifyRender).toHaveBeenCalledTimes(1);
      expect(isLastValues[0]).toBe(false);
      expect(bubbleIds[0]).toBe('msg-2');

      // 移除最后一个气泡后，第二个气泡变成最后一个（isLast 从 false 变为 true）
      const updatedBubble2 = {
        ...initialBubble2,
        originData: {
          ...initialBubble2.originData,
          isLast: true, // 更新后：变成最后一个
        },
      };

      rerender(
        <ConfigProvider>
          <BubbleConfigContext.Provider
            value={{
              standalone: false,
              locale: {} as any,
              bubble: updatedBubble2,
            }}
          >
            <EditorStoreContext.Provider value={mockEditorStore as any}>
              <Schema element={mockElement} attributes={mockAttributes}>
                {null}
              </Schema>
            </EditorStoreContext.Provider>
          </BubbleConfigContext.Provider>
        </ConfigProvider>,
      );

      // 验证更新后的状态：isLast 从 false 变为 true
      expect(mockApaasifyRender).toHaveBeenCalledTimes(2);
      expect(isLastValues[1]).toBe(true);
      expect(bubbleIds[1]).toBe('msg-2');

      // 验证 isLast 值的变化序列
      expect(isLastValues).toEqual([false, true]);
    });
  });
});
