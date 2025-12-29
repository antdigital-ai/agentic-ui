import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleBeforeNode } from '../@ant-design/agentic-ui/Bubble/BubbleBeforeNode';
import { BubbleConfigContext } from '../@ant-design/agentic-ui/Bubble/BubbleConfigProvide';

// Mock ThoughtChainList 组件
vi.mock('../@ant-design/agentic-ui/ThoughtChainList', () => ({
  ThoughtChainList: ({ thoughtChainList, loading, bubble }: any) => (
    <div data-testid="thought-chain-list">
      <div data-testid="thought-chain-count">
        {thoughtChainList?.length || 0}
      </div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="bubble-id">{bubble?.id}</div>
      {thoughtChainList?.map((item: any, index: number) => (
        <div key={index} data-testid={`thought-item-${index}`}>
          {item.info}
        </div>
      ))}
    </div>
  ),
}));

describe('BubbleBeforeNode', () => {
  const defaultProps = {
    bubble: {
      placement: 'left' as const,
      originData: {
        id: 'test-bubble-id',
        role: 'user',
        content: 'Test content',
        isFinished: true,
        isAborted: false,
        extra: {
          white_box_process: [
            {
              info: '理解问题',
              output: {
                chunks: [{ content: 'Document 1' }],
              },
            },
            {
              info: '分析需求',
              output: {
                chunks: [{ content: 'Document 2' }],
              },
            },
          ],
        },
      },
    },
    bubbleListRef: { current: null },
  } as any;

  const defaultContext = {
    standalone: false,
    locale: {},
    thoughtChain: {
      enable: true,
      alwaysRender: false,
      thoughtChainList: [],
    },
  } as any;

  const renderWithContext = (
    props = defaultProps,
    context = defaultContext,
  ) => {
    return render(
      <BubbleConfigContext.Provider value={context}>
        <BubbleBeforeNode {...props} />
      </BubbleConfigContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染 ThoughtChainList', () => {
      renderWithContext();

      expect(screen.getByTestId('thought-chain-list')).toBeInTheDocument();
      expect(screen.getByTestId('thought-chain-count')).toHaveTextContent('2');
      expect(screen.getByTestId('bubble-id')).toHaveTextContent(
        'test-bubble-id',
      );
      expect(screen.getByTestId('thought-item-0')).toHaveTextContent(
        '理解问题',
      );
      expect(screen.getByTestId('thought-item-1')).toHaveTextContent(
        '分析需求',
      );
    });

    it('应该处理单个 white_box_process', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            extra: {
              white_box_process: {
                info: '单一处理步骤',
                output: {
                  chunks: [{ content: 'Document 1' }],
                },
              },
            },
          },
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('thought-chain-count')).toHaveTextContent('1');
      expect(screen.getByTestId('thought-item-0')).toHaveTextContent(
        '单一处理步骤',
      );
    });

    it('应该处理空的 white_box_process', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            extra: {
              white_box_process: [],
            },
          },
        },
      };

      const { container } = renderWithContext(props);

      // 空的 white_box_process 且 alwaysRender 为 false 时不应该渲染
      expect(container.firstChild).toBeNull();
    });
  });

  describe('条件渲染测试', () => {
    it('应该在 placement 为 right 时不渲染', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          placement: 'right',
        },
      };

      const { container } = renderWithContext(props);

      expect(container.firstChild).toBeNull();
    });

    it('应该在 role 为 bot 时不渲染', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            role: 'bot',
          },
        },
      };

      const { container } = renderWithContext(props);

      expect(container.firstChild).toBeNull();
    });

    it('应该在 thoughtChain.enable 为 false 时不渲染', () => {
      const context = {
        ...defaultContext,
        thoughtChain: {
          ...defaultContext.thoughtChain,
          enable: false,
        },
      };

      const { container } = renderWithContext(defaultProps, context);

      expect(container.firstChild).toBeNull();
    });

    it('应该在任务列表为空且 alwaysRender 为 false 时不渲染', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            extra: {
              white_box_process: [],
            },
          },
        },
      };

      const context = {
        ...defaultContext,
        thoughtChain: {
          ...defaultContext.thoughtChain,
          alwaysRender: false,
        },
      };

      const { container } = renderWithContext(props, context);

      expect(container.firstChild).toBeNull();
    });

    it('应该在任务列表为空但 alwaysRender 为 true 时渲染', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            extra: {
              white_box_process: [],
            },
          },
        },
      };

      const context = {
        ...defaultContext,
        thoughtChain: {
          ...defaultContext.thoughtChain,
          alwaysRender: true,
        },
      };

      renderWithContext(props, context);

      expect(screen.getByTestId('thought-chain-list')).toBeInTheDocument();
      expect(screen.getByTestId('thought-chain-count')).toHaveTextContent('1');
      expect(screen.getByTestId('thought-item-0')).toHaveTextContent(
        '理解问题',
      );
    });
  });

  describe('自定义渲染测试', () => {
    it('应该使用自定义渲染函数', () => {
      const customRender = vi
        .fn()
        .mockReturnValue(<div data-testid="custom-render">Custom Render</div>);

      const context = {
        ...defaultContext,
        thoughtChain: {
          ...defaultContext.thoughtChain,
          render: customRender,
        },
      };

      renderWithContext(defaultProps, context);

      expect(customRender).toHaveBeenCalledWith(
        defaultProps.bubble,
        '[object Object],[object Object]',
      );
      expect(screen.getByTestId('custom-render')).toBeInTheDocument();
    });

    it('应该传递正确的参数给自定义渲染函数', () => {
      const customRender = vi.fn().mockReturnValue(null);

      const context = {
        ...defaultContext,
        thoughtChain: {
          ...defaultContext.thoughtChain,
          render: customRender,
        },
      };

      renderWithContext(defaultProps, context);

      expect(customRender).toHaveBeenCalledWith(
        defaultProps.bubble,
        '[object Object],[object Object]',
      );
    });
  });

  describe('加载状态测试', () => {
    it('应该在内容为 "..." 时显示加载状态', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            content: '...',
          },
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    it('应该在内容不为 "..." 时不显示加载状态', () => {
      renderWithContext();

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('数据传递测试', () => {
    it('应该正确传递 bubble 数据', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            id: 'custom-bubble-id',
            isFinished: false,
            isAborted: true,
          },
        },
      };

      renderWithContext(props);

      expect(screen.getByTestId('bubble-id')).toHaveTextContent(
        'custom-bubble-id',
      );
    });

    it('应该处理 isFinished 和 isAborted 的组合', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            isFinished: false,
            isAborted: true,
          },
        },
      };

      renderWithContext(props);

      // 当 isAborted 为 true 时，isFinished 应该被视为 true
      expect(screen.getByTestId('thought-chain-list')).toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理没有 extra 的情况', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            extra: undefined,
          },
        },
      };

      const { container } = renderWithContext(props);

      expect(container.firstChild).toBeNull();
    });

    it('应该处理没有 white_box_process 的情况', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            extra: {},
          },
        },
      };

      const { container } = renderWithContext(props);

      expect(container.firstChild).toBeNull();
    });

    it('应该处理 white_box_process 为 null 的情况', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            extra: {
              white_box_process: null,
            },
          },
        },
      };

      const { container } = renderWithContext(props);

      expect(container.firstChild).toBeNull();
    });

    it('应该处理没有 info 的 white_box_process 项', () => {
      const props = {
        ...defaultProps,
        bubble: {
          ...defaultProps.bubble,
          originData: {
            ...defaultProps.bubble.originData,
            extra: {
              white_box_process: [
                {
                  output: {
                    chunks: [{ content: 'Document 1' }],
                  },
                },
                {
                  info: '有信息的项',
                  output: {
                    chunks: [{ content: 'Document 2' }],
                  },
                },
              ],
            },
          },
        },
      };

      renderWithContext(props);

      // 应该只渲染有 info 的项
      expect(screen.getByTestId('thought-chain-count')).toHaveTextContent('1');
      expect(screen.getByTestId('thought-item-0')).toHaveTextContent(
        '有信息的项',
      );
    });
  });

  describe('配置测试', () => {
    it('应该传递 thoughtChain 配置给 ThoughtChainList', () => {
      const context = {
        ...defaultContext,
        thoughtChain: {
          ...defaultContext.thoughtChain,
          enable: true,
          alwaysRender: false,
          // 添加其他 ThoughtChainListProps 属性
          finishAutoCollapse: true,
        },
      };

      renderWithContext(defaultProps, context);

      expect(screen.getByTestId('thought-chain-list')).toBeInTheDocument();
    });

    it('应该处理不同的 context 配置', () => {
      const context = {
        ...defaultContext,
        standalone: true,
        locale: {
          'chat.message.thinking': 'Thinking...',
        },
      };

      renderWithContext(defaultProps, context);

      expect(screen.getByTestId('thought-chain-list')).toBeInTheDocument();
    });
  });
});
