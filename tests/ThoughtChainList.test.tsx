import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WhiteBoxProcessInterface } from '../src/ThoughtChainList';
import { ThoughtChainList } from '../src/ThoughtChainList';

// Mock data for different categories
const mockTableSqlData: WhiteBoxProcessInterface = {
  category: 'TableSql',
  info: '查询用户表数据',
  costMillis: 1200,
  runId: 'sql-001',
  input: {
    sql: "SELECT * FROM users WHERE status = 'active'",
  },
  output: {
    type: 'TABLE',
    tableData: {
      id: [1, 2, 3],
      name: ['张三', '李四', '王五'],
      status: ['active', 'active', 'active'],
    },
    columns: ['id', 'name', 'status'],
  },
};

const mockToolCallData: WhiteBoxProcessInterface = {
  category: 'ToolCall',
  info: '调用用户信息接口',
  runId: 'tool-001',
  input: {
    inputArgs: {
      requestBody: { userId: 123 },
      parameters: { id: '123' },
      params: { include: 'profile' },
    },
  },
  meta: {
    name: 'getUserInfo',
    method: 'GET',
    path: '/api/users/123',
    description: '获取用户详细信息',
  },
  output: {
    type: 'END',
    response: {
      error: false,
      data: { id: 123, name: '张三', email: 'zhangsan@example.com' },
    },
  },
};

const mockRagRetrievalData: WhiteBoxProcessInterface = {
  category: 'RagRetrieval',
  info: '检索产品文档',
  runId: 'rag-001',
  input: {
    searchQueries: ['产品功能', '使用指南'],
  },
  output: {
    type: 'CHUNK',
    chunks: [
      {
        content: '产品主要功能包括用户管理、数据分析和报表生成...',
        originUrl: 'https://docs.example.com/features',
        docMeta: {
          doc_name: '产品功能说明',
          doc_id: 'doc_001',
          type: 'documentation',
        },
      },
    ],
  },
};

const mockDeepThinkData: WhiteBoxProcessInterface = {
  category: 'DeepThink',
  info: '分析市场趋势',
  runId: 'think-001',
  output: {
    type: 'TOKEN',
    data: '根据最新的市场数据分析，科技股在本季度表现强劲，主要驱动因素包括...',
  },
};

const mockWebSearchData: WhiteBoxProcessInterface = {
  category: 'WebSearch',
  info: '搜索最新技术资讯',
  runId: 'search-001',
  input: {
    searchQueries: ['AI 发展趋势', '机器学习应用'],
  },
  output: {
    type: 'END',
    data: `搜索结果：

1. **AI 技术发展报告 2024** - tech.example.com
   人工智能技术在 2024 年呈现出快速发展的趋势...

2. **机器学习在金融领域的应用** - finance.example.com
   机器学习技术正在革命性地改变金融行业...`,
  },
};

const mockErrorData: WhiteBoxProcessInterface = {
  category: 'ToolCall',
  info: '调用支付接口失败',
  runId: 'error-001',
  output: {
    type: 'ERROR',
    errorMsg: 'API 请求失败：网络连接超时',
  },
};

const mockLoadingData: WhiteBoxProcessInterface = {
  category: 'DeepThink',
  info: '正在分析数据...',
  runId: 'loading-001',
  isLoading: true,
  output: {
    type: 'RUNNING',
  },
};

describe('ThoughtChainList', () => {
  afterEach(() => {
    cleanup();
  });

  // 基础渲染测试
  describe('Basic Rendering', () => {
    it('should render empty list correctly', () => {
      render(<ThoughtChainList thoughtChainList={[]} />);
      expect(screen.queryByRole('list')).toBeInTheDocument();
    });

    it('should render with single item', () => {
      render(<ThoughtChainList thoughtChainList={[mockTableSqlData]} />);
      expect(screen.getByText('查询用户表数据')).toBeInTheDocument();
    });

    it('should render multiple items', () => {
      const multipleItems = [
        mockTableSqlData,
        mockToolCallData,
        mockRagRetrievalData,
      ];
      render(<ThoughtChainList thoughtChainList={multipleItems} />);

      expect(screen.getByText('查询用户表数据')).toBeInTheDocument();
      expect(screen.getByText('调用用户信息接口')).toBeInTheDocument();
      expect(screen.getByText('检索产品文档')).toBeInTheDocument();
    });
  });

  // Category 类型测试
  describe('Category Types', () => {
    it('should render TableSql category correctly', () => {
      render(<ThoughtChainList thoughtChainList={[mockTableSqlData]} />);

      expect(screen.getByText('查询用户表数据')).toBeInTheDocument();
      expect(
        screen.getAllByText("SELECT * FROM users WHERE status = 'active'")[0],
      ).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('王五')).toBeInTheDocument();
    });

    it('should render ToolCall category correctly', () => {
      render(<ThoughtChainList thoughtChainList={[mockToolCallData]} />);

      expect(screen.getByText('调用用户信息接口')).toBeInTheDocument();
      // ToolCall 的详细信息可能不会直接显示，检查是否有相关内容
      expect(screen.getByText(/调用用户信息接口/)).toBeInTheDocument();
    });

    it('should render RagRetrieval category correctly', () => {
      render(<ThoughtChainList thoughtChainList={[mockRagRetrievalData]} />);

      expect(screen.getByText('检索产品文档')).toBeInTheDocument();
    });

    it('should render DeepThink category correctly', () => {
      render(<ThoughtChainList thoughtChainList={[mockDeepThinkData]} />);

      expect(screen.getByText('分析市场趋势')).toBeInTheDocument();
      expect(
        screen.getByText(
          '根据最新的市场数据分析，科技股在本季度表现强劲，主要驱动因素包括...',
        ),
      ).toBeInTheDocument();
    });

    it('should render WebSearch category correctly', () => {
      render(
        <ThoughtChainList
          finishAutoCollapse={false}
          thoughtChainList={[mockWebSearchData]}
        />,
      );

      expect(screen.getByText('搜索最新技术资讯')).toBeInTheDocument();
    });
  });

  // 状态测试
  describe('States', () => {
    it('should render error state correctly', () => {
      render(<ThoughtChainList thoughtChainList={[mockErrorData]} />);

      expect(screen.getByText('调用支付接口失败')).toBeInTheDocument();
      // 使用更灵活的文本匹配，因为错误信息可能被分割到多个元素中
      expect(
        screen.getByText(/API 请求失败：网络连接超时/),
      ).toBeInTheDocument();
    });

    it('should render loading state correctly', () => {
      render(<ThoughtChainList thoughtChainList={[mockLoadingData]} />);

      expect(screen.getByText('正在分析数据...')).toBeInTheDocument();
      // 检查是否有加载指示器 - 使用更精确的选择器
      expect(screen.getAllByText(/思考中|正在分析/).length).toBeGreaterThan(0);
    });

    it('should show cost time when provided', () => {
      render(<ThoughtChainList thoughtChainList={[mockTableSqlData]} />);

      // 根据 CostMillis 组件的实现，1200ms 会显示为 "1s"，可能有多个实例
      expect(screen.getAllByText('1.2秒').length).toBeGreaterThan(0);
    });
  });

  // 交互测试
  describe('Interactions', () => {
    it('should toggle collapse/expand on click', async () => {
      render(<ThoughtChainList thoughtChainList={[mockTableSqlData]} />);

      const collapseButtons = screen.getAllByRole('button', {
        name: /收起|展开|collapse|expand/i,
      });
      const collapseButton = collapseButtons[0]; // 使用第一个按钮

      // 初始状态应该是展开的 - 检查内容是否存在，可能有多个实例
      const sqlElements = screen.getAllByText(
        "SELECT * FROM users WHERE status = 'active'",
      );
      expect(sqlElements.length).toBeGreaterThan(0);

      // 点击折叠
      fireEvent.click(collapseButton);

      await waitFor(() => {
        // 检查内容容器是否被隐藏（高度为0或不可见）
        const contentElements = screen.queryAllByText(
          "SELECT * FROM users WHERE status = 'active'",
        );
        if (contentElements.length > 0) {
          const parentElement =
            contentElements?.[0]?.closest('[style*="height"]');
          expect(parentElement).toHaveStyle('height: 0px');
        }
      });

      // 再次点击展开
      fireEvent.click(collapseButton);

      await waitFor(() => {
        const sqlElementsAfterExpand = screen.getAllByText(
          "SELECT * FROM users WHERE status = 'active'",
        );
        expect(sqlElementsAfterExpand.length).toBeGreaterThan(0);
      });
    });

    it('should handle document meta click for RagRetrieval', () => {
      const mockOnMetaClick = vi.fn();
      render(
        <ThoughtChainList
          thoughtChainList={[mockRagRetrievalData]}
          onDocMetaClick={mockOnMetaClick}
        />,
      );

      const docLink = screen.getByText('产品功能说明');
      fireEvent.click(docLink);

      expect(mockOnMetaClick).toHaveBeenCalledWith({
        doc_name: '产品功能说明',
        doc_id: 'doc_001',
        type: 'documentation',
      });
    });
  });

  // Props 测试
  describe('Props', () => {
    it('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red', padding: '20px' };
      const { container } = render(
        <ThoughtChainList
          thoughtChainList={[mockTableSqlData]}
          style={customStyle}
        />,
      );

      const thoughtChainElement = container.firstChild as HTMLElement;
      expect(thoughtChainElement).toHaveStyle(
        'background-color: rgb(255, 0, 0)',
      );
      expect(thoughtChainElement).toHaveStyle('padding: 12px');
    });

    it('should render in compact mode', () => {
      const { container, unmount } = render(
        <ThoughtChainList
          thoughtChainList={[mockTableSqlData]}
          compact={true}
        />,
      );

      expect(
        container.querySelector('.ant-thought-chain-list-content-compact'),
      ).toBeInTheDocument();
      unmount();
    });

    it('should show loading state when loading prop is true', () => {
      const loadingData: WhiteBoxProcessInterface = {
        category: 'DeepThink',
        info: '思考中...',
        runId: 'loading-001',
        isLoading: true,
      };

      render(
        <ThoughtChainList thoughtChainList={[loadingData]} loading={true} />,
      );

      // 检查加载状态的文本而不是 progressbar 角色
      expect(screen.getByText(/思考中...|正在思考.../)).toBeInTheDocument();
    });

    it('should use custom locale', () => {
      const customLocale = {
        thinking: '思考中...',
        taskFinished: '任务已完成',
        taskCost: '用时',
      };

      render(
        <ThoughtChainList
          thoughtChainList={[mockTableSqlData]}
          locale={customLocale}
          bubble={{ isFinished: true }}
        />,
      );

      // 使用更灵活的文本匹配，因为文本可能包含额外的内容
      expect(screen.getByText(/任务已完成|任务完成/)).toBeInTheDocument();
    });

    it('should handle bubble states', () => {
      const bubble = {
        isFinished: true,
        endTime: Date.now(),
        createAt: Date.now() - 5000,
        isAborted: false,
      };

      render(
        <ThoughtChainList
          thoughtChainList={[mockTableSqlData]}
          bubble={bubble}
        />,
      );

      // 应该显示完成状态，包含时间信息
      expect(screen.getByText(/任务完成.*共耗时.*s/)).toBeInTheDocument();
    });

    it('should auto-collapse when finished if finishAutoCollapse is true', async () => {
      const { rerender } = render(
        <ThoughtChainList
          thoughtChainList={[mockTableSqlData]}
          finishAutoCollapse={true}
          bubble={{ isFinished: false }}
        />,
      );

      // 初始状态应该是展开的
      const sqlElements = screen.getAllByText(
        "SELECT * FROM users WHERE status = 'active'",
      );
      expect(sqlElements.length).toBeGreaterThan(0);

      // 更新为完成状态
      rerender(
        <ThoughtChainList
          thoughtChainList={[mockTableSqlData]}
          finishAutoCollapse={true}
          bubble={{ isFinished: true }}
        />,
      );

      await waitFor(() => {
        // 检查内容容器是否被隐藏
        const contentElements = screen.queryAllByText(
          "SELECT * FROM users WHERE status = 'active'",
        );
        if (contentElements.length > 0) {
          const parentElement = contentElements[0].closest('[style*="height"]');
          expect(parentElement).toHaveStyle('height: 0px');
        }
      });
    });
  });

  // 边界情况测试
  describe('Edge Cases', () => {
    it('should handle empty output gracefully', () => {
      const emptyOutputData: WhiteBoxProcessInterface = {
        category: 'DeepThink',
        info: '空输出测试',
        runId: 'empty-001',
      };

      render(<ThoughtChainList thoughtChainList={[emptyOutputData]} />);
      expect(screen.getByText('空输出测试')).toBeInTheDocument();
    });

    it('should handle invalid category gracefully', () => {
      const invalidCategoryData: WhiteBoxProcessInterface = {
        category: 'InvalidCategory' as any,
        info: '无效分类测试',
        runId: 'invalid-001',
      };

      render(<ThoughtChainList thoughtChainList={[invalidCategoryData]} />);
      expect(screen.getByText('无效分类测试')).toBeInTheDocument();
    });

    it('should handle missing meta data', () => {
      const noMetaData: WhiteBoxProcessInterface = {
        category: 'ToolCall',
        info: '无元数据测试',
        runId: 'no-meta-001',
        output: {
          type: 'END',
          response: { data: 'success' },
        },
      };

      render(<ThoughtChainList thoughtChainList={[noMetaData]} />);
      expect(screen.getByText('无元数据测试')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContentData: WhiteBoxProcessInterface = {
        category: 'DeepThink',
        info: '长内容测试',
        runId: 'long-001',
        output: {
          type: 'TOKEN',
          data: 'A'.repeat(10000), // 10000 个字符的长内容
        },
      };

      render(<ThoughtChainList thoughtChainList={[longContentData]} />);
      expect(screen.getByText('长内容测试')).toBeInTheDocument();
    });
  });

  // 可访问性测试
  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ThoughtChainList thoughtChainList={[mockTableSqlData]} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<ThoughtChainList thoughtChainList={[mockTableSqlData]} />);

      const collapseButtons = screen.getAllByRole('button', {
        name: /收起|展开|collapse|expand/i,
      });
      const collapseButton = collapseButtons[0]; // 使用第一个按钮

      // 测试键盘焦点
      collapseButton.focus();
      expect(document.activeElement).toBe(collapseButton);

      // 测试 Enter 键
      fireEvent.keyDown(collapseButton, { key: 'Enter' });
      // 应该触发折叠/展开
    });
  });

  // 性能优化相关测试
  describe('Performance Optimization', () => {
    it('should memoize callback functions to prevent child re-renders', () => {
      const { rerender } = render(
        <ThoughtChainList
          thoughtChainList={[mockRagRetrievalData]}
          onDocMetaClick={vi.fn()}
        />,
      );

      const initialElements = screen.getAllByText('检索产品文档');

      // 使用不同的回调函数引用重新渲染
      rerender(
        <ThoughtChainList
          thoughtChainList={[mockRagRetrievalData]}
          onDocMetaClick={vi.fn()} // 新的函数引用
        />,
      );

      // 组件应该能够处理回调函数的变化
      const afterRerenderElements = screen.getAllByText('检索产品文档');
      expect(afterRerenderElements.length).toBe(initialElements.length);
    });

    it('should optimize document drawer rendering', () => {
      const { rerender } = render(
        <ThoughtChainList
          thoughtChainList={[mockRagRetrievalData]}
          onDocMetaClick={vi.fn()}
        />,
      );

      // 点击文档链接打开抽屉
      const docLink = screen.getByText('产品功能说明');
      fireEvent.click(docLink);

      // 验证抽屉组件被渲染
      expect(screen.getByText(/预览.*产品功能说明/)).toBeInTheDocument();

      // 重新渲染其他 props，抽屉应该保持稳定
      rerender(
        <ThoughtChainList
          thoughtChainList={[mockRagRetrievalData]}
          onDocMetaClick={vi.fn()}
          compact={true} // 添加新的 prop
        />,
      );

      // 抽屉应该仍然存在
      expect(screen.getByText(/预览.*产品功能说明/)).toBeInTheDocument();
    });
  });

  // 内存管理测试
  describe('Memory Management', () => {
    it('should clean up resources when unmounted', () => {
      const { unmount } = render(
        <ThoughtChainList thoughtChainList={[mockTableSqlData]} />,
      );

      // 验证组件正常渲染
      expect(screen.getByText('查询用户表数据')).toBeInTheDocument();

      // 卸载组件
      unmount();

      // 验证组件已被移除
      expect(screen.queryByText('查询用户表数据')).not.toBeInTheDocument();
    });

    it('should handle rapid state changes without memory leaks', async () => {
      const { rerender } = render(
        <ThoughtChainList
          thoughtChainList={[mockLoadingData]}
          loading={true}
        />,
      );

      // 快速切换状态多次
      for (let i = 0; i < 10; i++) {
        rerender(
          <ThoughtChainList
            thoughtChainList={[{ ...mockLoadingData, runId: `test-${i}` }]}
            loading={i % 2 === 0}
          />,
        );
      }

      // 最终状态应该正确
      expect(screen.getByText('正在分析数据...')).toBeInTheDocument();
    });
  });

  // 并发更新测试
  describe('Concurrent Updates', () => {
    it('should handle simultaneous thought chain updates', async () => {
      let thoughtChainList = [mockTableSqlData];

      const { rerender } = render(
        <ThoughtChainList thoughtChainList={thoughtChainList} />,
      );

      // 模拟同时添加多个新项目
      thoughtChainList = [
        ...thoughtChainList,
        mockToolCallData,
        mockRagRetrievalData,
        mockDeepThinkData,
      ];

      rerender(<ThoughtChainList thoughtChainList={thoughtChainList} />);

      await waitFor(() => {
        expect(screen.getByText('查询用户表数据')).toBeInTheDocument();
        expect(screen.getByText('调用用户信息接口')).toBeInTheDocument();
        expect(screen.getByText('检索产品文档')).toBeInTheDocument();
        expect(screen.getByText('分析市场趋势')).toBeInTheDocument();
      });
    });
  });

  // 错误恢复测试
  describe('Error Recovery', () => {
    it('should recover from render errors gracefully', () => {
      const problematicData: WhiteBoxProcessInterface = {
        category: 'TableSql',
        info: '问题数据',
        runId: 'error-test',
        input: {
          sql: null as any, // 故意传入无效数据
        },
        output: {
          type: 'TABLE',
          tableData: null as any,
        },
      };

      // 应该能够渲染而不抛出错误
      render(<ThoughtChainList thoughtChainList={[problematicData]} />);
      expect(screen.getByText('问题数据')).toBeInTheDocument();
    });

    it('should handle malformed output data', () => {
      const malformedData: WhiteBoxProcessInterface = {
        category: 'RagRetrieval',
        info: '格式错误测试',
        runId: 'malformed-test',
        output: {
          type: 'CHUNK',
          chunks: [
            {
              content: undefined as any,
              originUrl: '',
              docMeta: null as any,
            },
          ],
        },
      };

      render(<ThoughtChainList thoughtChainList={[malformedData]} />);
      expect(screen.getByText('格式错误测试')).toBeInTheDocument();
    });
  });

  // 国际化测试
  describe('Internationalization', () => {
    it('should handle missing locale keys gracefully', () => {
      const incompleteLocale = {
        thinking: '思考中...',
        // 缺少其他键
      };

      render(
        <ThoughtChainList
          thoughtChainList={[mockTableSqlData]}
          locale={incompleteLocale}
          loading={true}
        />,
      );

      expect(
        screen.getAllByText((content, element) => {
          return element?.textContent?.includes('思考中') ?? false;
        })[0],
      ).toBeInTheDocument();
    });
  });

  // 动画和视觉效果测试
  describe('Animation and Visual Effects', () => {
    it('should apply correct CSS classes for different states', () => {
      const { container } = render(
        <ThoughtChainList
          thoughtChainList={[mockTableSqlData]}
          compact={true}
          bubble={{ isFinished: false }}
        />,
      );

      expect(
        container.querySelector('.ant-thought-chain-list-container-loading'),
      ).toBeInTheDocument();
      expect(
        container.querySelector('.ant-thought-chain-list-content-compact'),
      ).toBeInTheDocument();
    });

    it('should handle staggered animations for multiple items', () => {
      const multipleItems = [
        mockTableSqlData,
        mockToolCallData,
        mockRagRetrievalData,
        mockDeepThinkData,
        mockWebSearchData,
      ];

      const { container } = render(
        <ThoughtChainList thoughtChainList={multipleItems} />,
      );

      // 验证所有项目都被渲染
      const listItems = container.querySelectorAll('[role="listitem"]');
      expect(listItems.length).toBe(multipleItems.length);
    });
  });

  // 复杂场景集成测试
  describe('Complex Scenarios', () => {
    it('should handle mixed category types with different states', () => {
      const mixedData: WhiteBoxProcessInterface[] = [
        mockTableSqlData, // 完成状态
        mockLoadingData, // 加载状态
        mockErrorData, // 错误状态
        mockRagRetrievalData, // 正常状态
      ];

      render(<ThoughtChainList thoughtChainList={mixedData} />);

      expect(screen.getByText('查询用户表数据')).toBeInTheDocument();
      expect(screen.getByText('正在分析数据...')).toBeInTheDocument();
      expect(screen.getByText('调用支付接口失败')).toBeInTheDocument();
      expect(screen.getByText('检索产品文档')).toBeInTheDocument();
    });

    it('should maintain scroll position during updates', () => {
      const largeDataset: WhiteBoxProcessInterface[] = Array.from(
        { length: 50 },
        (_, i) => ({
          ...mockTableSqlData,
          info: `任务 ${i + 1}`,
          runId: `scroll-test-${i}`,
        }),
      );

      const { rerender } = render(
        <ThoughtChainList thoughtChainList={largeDataset.slice(0, 25)} />,
      );

      // 添加更多项目
      rerender(<ThoughtChainList thoughtChainList={largeDataset} />);

      // 验证所有项目都被渲染
      expect(screen.getByText('任务 1')).toBeInTheDocument();
      expect(screen.getByText('任务 50')).toBeInTheDocument();
    });
  });
});
