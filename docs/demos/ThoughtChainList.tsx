import { ThoughtChainList } from '@ant-design/agentic-ui';
import React from 'react';

export default function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: 64,
        fontSize: 14,
      }}
    >
      <ThoughtChainList
        loading={false}
        thoughtChainList={[
          {
            category: 'TableSql',
            info: '查看 ${tableName} 数据',
            input: {
              sql: "SELECT user_id, user_name, order_count, total_amount FROM customer_orders WHERE region = '华东' ORDER BY total_amount DESC LIMIT 10",
            },
            meta: {
              data: {
                tableName: [
                  {
                    name: '客户订单统计表',
                  },
                ],
              },
            },
            runId: '1',
            output: {
              columns: ['user_name', 'order_count', 'total_amount'],
              tableData: {
                user_name: ['张明', '李芳', '王建国'],
                order_count: ['156', '89', '72'],
                total_amount: ['¥128,500', '¥67,200', '¥54,800'],
              },
            },
          },
          {
            category: 'RagRetrieval',
            info: '查询 ${article} 相关文章',
            input: {
              searchQueries: ['React 组件性能优化', '虚拟列表渲染方案'],
            },
            meta: {
              data: {
                article: [
                  {
                    name: 'React 性能优化最佳实践',
                  },
                  {
                    name: '前端长列表渲染方案对比',
                  },
                ],
              },
            },
            runId: '2',
            output: {
              chunks: [
                {
                  content:
                    'React.memo 与 useMemo 在组件渲染优化中的最佳实践，包括避免不必要的重渲染和状态管理策略。',
                  originUrl: 'https://react.dev/reference/react/memo',
                  docMeta: {
                    doc_name: 'React 官方性能优化指南',
                    doc_id: 'react-perf-001',
                    type: 'doc',
                  },
                },
                {
                  content:
                    '虚拟滚动方案对比：react-window vs react-virtualized，针对大数据量列表的渲染性能分析。',
                  originUrl:
                    'https://web.dev/articles/virtualize-long-lists-react-window',
                  docMeta: {
                    doc_name: 'Web.dev 虚拟列表技术文档',
                    doc_id: 'webdev-virtual-002',
                    type: 'doc',
                  },
                },
              ],
            },
          },
          {
            category: 'DeepThink',
            info: '分析前端性能瓶颈',
            runId: '3',
            output: {
              data: '根据检索到的文档和数据库查询结果，当前项目的主要性能瓶颈集中在以下几个方面：\n\n1. **组件重渲染问题**：客户列表组件在每次状态更新时都会触发全量重渲染，建议使用 React.memo 包裹子组件，并配合 useMemo 缓存计算结果。\n\n2. **大数据量渲染**：订单统计表包含超过 10,000 条记录，建议采用 react-window 实现虚拟滚动，仅渲染可视区域内的行。\n\n3. **状态管理优化**：将全局状态拆分为独立的 Context，避免无关组件因状态变更而触发更新。',
              type: 'END',
            },
          },
          {
            category: 'ToolCall',
            info: '调用 ${toolName} 工具',
            input: {
              inputArgs: {
                params: {
                  filePath: 'src/components/CustomerList.tsx',
                  optimization: 'memo',
                },
              },
            },
            meta: {
              data: {
                toolName: [
                  {
                    name: 'code_refactor',
                  },
                  {
                    name: 'performance_analyzer',
                  },
                ],
              },
            },
            runId: '4',
            output: {
              response: {
                error: false,
                data: '重构完成：已为 CustomerList 组件添加 React.memo 优化，预计减少 60% 的不必要重渲染。',
              },
              type: 'END',
            },
          },
        ]}
      />

      <ThoughtChainList
        loading={true}
        bubble={{
          isFinished: false,
          createAt: Date.now() - 5000,
        }}
        thoughtChainList={[
          {
            category: 'DeepThink',
            info: '正在执行: web_search',
            runId: '0',
            output: {
              data: '```json\n{"query": "2025年 AI Agent 框架对比 LangChain AutoGen CrewAI", "count": 5}\n```\n\n搜索中...',
              type: 'END',
            },
          },
          {
            category: 'DeepThink',
            info: '正在整理搜索结果',
            runId: '1',
            output: {
              data: '\nTitle: LangChain vs AutoGen vs CrewAI：2025年多智能体框架深度对比\nDescription: 详细对比三大主流 AI Agent 框架在任务编排、工具调用、记忆管理等核心能力上的差异...\nURL: https://blog.langchain.dev/multi-agent-comparison\n\nTitle: Building Production-Ready AI Agents in 2025\nDescription: A comprehensive guide to choosing the right agent framework for your production workloads...\nURL: https://docs.anthropic.com/guides/agent-frameworks\n\nTitle: CrewAI 1.0 发布：角色化多智能体协作的新范式\nDescription: CrewAI 1.0 引入了全新的角色定义系统和任务委派机制，使多智能体协作更加自然...\nURL: https://www.crewai.com/blog/v1-release',
              type: 'END',
            },
          },
          {
            category: 'DeepThink',
            info: '正在执行: get_documentation',
            runId: '2',
            output: {
              data: '```json\n{"source": "langchain", "section": "agent-architecture"}\n```\n\nLangChain 的 Agent 架构采用 ReAct 模式，支持工具调用链和多步推理。核心模块包括：\n- **AgentExecutor**: 负责循环执行 Agent 的思考-行动-观察流程\n- **ToolKit**: 管理可用工具集合，支持动态加载\n- **Memory**: 短期和长期记忆管理',
              type: 'END',
            },
          },
          {
            category: 'DeepThink',
            info: '正在执行: rag_search',
            runId: '3',
            output: {
              data: '```json\n{"query": "AutoGen 多智能体通信协议", "limit": 5}\n```\n\nAutoGen 使用基于消息传递的通信模型，每个 Agent 都是独立的对话实体。支持：\n- 点对点消息传递\n- 群组对话（GroupChat）\n- 嵌套对话模式',
              type: 'END',
            },
          },
          {
            category: 'DeepThink',
            info: '正在执行: code_analysis',
            runId: '4',
            output: {
              data: '```json\n{"framework": "crewai", "feature": "role-based-agents"}\n```\n\nCrewAI 的核心创新在于角色化设计：\n- **Agent**: 定义角色、目标和背景故事\n- **Task**: 描述具体任务和期望输出\n- **Crew**: 编排多个 Agent 的协作流程\n- **Process**: 支持顺序执行和层级委派两种模式',
              type: 'END',
            },
          },
          {
            category: 'DeepThink',
            info: '正在执行: comparison_analysis',
            runId: '5',
            output: {
              data: '```json\n{"frameworks": ["langchain", "autogen", "crewai"], "dimensions": ["易用性", "扩展性", "生产就绪度"]}\n```\n\n综合分析三个框架的核心差异：\n\n| 维度 | LangChain | AutoGen | CrewAI |\n|------|-----------|---------|--------|\n| 学习曲线 | 中等 | 较高 | 较低 |\n| 生产就绪 | 高 | 中等 | 中等 |\n| 社区活跃度 | 最高 | 高 | 快速增长 |',
              type: 'END',
            },
          },
          {
            category: 'DeepThink',
            info: '正在生成分析报告',
            runId: '6',
            output: {
              type: 'RUNNING',
            },
          },
        ]}
      />

      <h3>正在运行中的思维链（收起状态）</h3>
      <ThoughtChainList
        loading={true}
        bubble={{
          isFinished: false,
          createAt: Date.now() - 10000,
        }}
        thoughtChainList={[
          {
            category: 'TableSql',
            info: '正在查询 ${tableName} 数据',
            input: {
              sql: "SELECT product_name, category, stock_quantity, unit_price FROM inventory WHERE stock_quantity < 100 ORDER BY stock_quantity ASC",
            },
            meta: {
              data: {
                tableName: [
                  {
                    name: '商品库存预警表',
                  },
                ],
              },
            },
            runId: '1',
            output: {
              type: 'RUNNING',
            },
          },
          {
            category: 'RagRetrieval',
            info: '正在检索 ${query} 相关文档',
            input: {
              searchQueries: ['库存管理策略', '供应链优化方案'],
            },
            meta: {
              data: {
                query: [
                  {
                    name: '智能补货与库存预测',
                  },
                ],
              },
            },
            runId: '2',
            output: {
              type: 'RUNNING',
            },
          },
          {
            category: 'DeepThink',
            info: '正在生成补货建议方案',
            runId: '3',
            output: {
              type: 'RUNNING',
            },
          },
        ]}
      />
    </div>
  );
}
