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
        isLoading={false}
        thoughtChainList={[
          {
            category: 'TableSql',
            info: '查看 ${tableName} 数据',
            input: {
              sql: "SELECT user_name, order_count FROM orders LIMIT 2",
            },
            meta: {
              data: {
                tableName: [{ name: '订单示例表' }],
              },
            },
            runId: '1',
            output: {
              columns: ['user_name', 'order_count'],
              tableData: {
                user_name: ['Alice', 'Bob'],
                order_count: ['12', '8'],
              },
            },
          },
          {
            category: 'RagRetrieval',
            info: '查询 ${article} 相关文章',
            input: {
              searchQueries: ['React 性能'],
            },
            meta: {
              data: {
                article: [{ name: 'React 文档' }],
              },
            },
            runId: '2',
            output: {
              chunks: [
                {
                  content: '使用 React.memo 与 useMemo 减少不必要渲染。',
                  originUrl: 'https://react.dev/reference/react/memo',
                  docMeta: {
                    doc_name: 'React 文档',
                    doc_id: 'react-001',
                    type: 'doc',
                  },
                },
              ],
            },
          },
        ]}
      />

      <ThoughtChainList
        isLoading={true}
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
              data: '```json\n{"query": "Agent 框架对比", "count": 3}\n```\n\n搜索中…',
              type: 'END',
            },
          },
          {
            category: 'DeepThink',
            info: '正在整理结果',
            runId: '1',
            output: {
              data: '已获取 2 条摘要，准备生成结论。',
              type: 'END',
            },
          },
          {
            category: 'DeepThink',
            info: '正在生成报告',
            runId: '2',
            output: {
              type: 'RUNNING',
            },
          },
        ]}
      />

      <h3>正在运行中的思维链（收起状态）</h3>
      <ThoughtChainList
        isLoading={true}
        bubble={{
          isFinished: false,
          createAt: Date.now() - 10000,
        }}
        thoughtChainList={[
          {
            category: 'TableSql',
            info: '正在查询 ${tableName} 数据',
            input: {
              sql: 'SELECT product_name, category, stock_quantity, unit_price FROM inventory WHERE stock_quantity < 100 ORDER BY stock_quantity ASC',
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
