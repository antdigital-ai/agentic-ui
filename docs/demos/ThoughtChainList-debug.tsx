/**
 * 与 ThoughtChainList.tsx 展示场景重叠，用于本地调试；文档站见 ThoughtChainList.tsx。
 */
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
              sql: 'SELECT * FROM table_name',
            },
            meta: {
              data: {
                tableName: [
                  {
                    name: '用户表',
                  },
                ],
              },
            },
            runId: '1',
            output: {
              columns: ['name', 'age', 'address'],
              tableData: {
                name: ['Tom', 'Jim', 'Lucy'],
                age: ['18', '20', '22'],
                address: ['Shanghai', 'Beijing', 'Hangzhou'],
              },
            },
          },
          {
            category: 'RagRetrieval',
            info: '查询 ${article} 相关文章',
            input: {
              searchQueries: ['内容', '标题'],
            },
            meta: {
              data: {
                article: [
                  {
                    name: '文章标题',
                  },
                  {
                    name: '文章内容',
                  },
                ],
              },
            },
            runId: '2',
            output: {
              chunks: [
                {
                  content: '产品介绍',
                  originUrl: 'https://www.alipay.com',
                  docMeta: { doc_name: '产品手册', doc_id: '1', type: 'doc' },
                },
                {
                  content: '产品使用',
                  originUrl: 'https://www.alipay.com',
                  docMeta: {
                    doc_name: '产品使用说明',
                    doc_id: '2',
                    type: 'doc',
                  },
                },
              ],
            },
          },
          {
            category: 'DeepThink',
            info: '如何解决工作效率问题',
            runId: '3',
            output: {
              data: '工作效率问题解决方案，提高工作效率，提高工作效率，工作效率问题解决方案 ，提高工作效率 ，提高工作效率工作效率问题解决方案 ，提高工作效率 ，提高工作效率工作效率问题解决方案 ，提高工作效率 ，提高工作效率工作效率问题解决方案 ，提高工作效率 ，提高工作效率工作效率问题解决方案 ，提高工作效率 ，提高工作效率',
              type: 'END',
            },
          },
          {
            category: 'ToolCall',
            info: '调用 ${toolName} 工具',
            input: {
              inputArgs: {
                params: { name: '参数' },
              },
            },
            meta: {
              data: {
                toolName: [
                  {
                    name: '工具1',
                  },
                  {
                    name: '工具2',
                  },
                ],
              },
            },
            runId: '4',
            output: {
              response: {
                error: false,
                data: '调用工具成功',
              },
              type: 'END',
            },
          },
        ]}
        markdownRenderProps={{
          eleItemRender: (ele, defaultDom) => {
            return <div>ele-{defaultDom}</div>;
          },
        }}
      />
      <div>
        <h4>Props 说明</h4>
        <ul>
          <li>
            <code>loading</code> - 加载状态，设置为 false 表示已加载完成
          </li>
          <li>
            <code>thoughtChainList</code> -
            思维链列表数据，包含多个不同类型的思维节点
          </li>
          <li>
            <code>thoughtChainList[].category</code> - 思维节点类型，如
            TableSql、RagRetrieval、DeepThink、ToolCall
          </li>
          <li>
            <code>thoughtChainList[].info</code> -
            思维节点信息描述，支持模板变量
          </li>
          <li>
            <code>thoughtChainList[].input</code> - 输入参数，包含具体的输入数据
          </li>
          <li>
            <code>thoughtChainList[].meta</code> - 元数据，包含模板变量的具体值
          </li>
          <li>
            <code>thoughtChainList[].runId</code> - 运行
            ID，用于标识不同的执行实例
          </li>
          <li>
            <code>thoughtChainList[].output</code> - 输出结果，包含执行后的数据
          </li>
          <li>
            <code>markdownRenderProps</code> - Markdown 渲染属性配置
          </li>
          <li>
            <code>markdownRenderProps.eleItemRender</code> -
            元素项渲染函数，自定义渲染逻辑
          </li>
          <li>
            <code>ele</code> - 元素对象，传递给渲染函数
          </li>
          <li>
            <code>defaultDom</code> - 默认 DOM 元素，传递给渲染函数
          </li>
        </ul>
      </div>
    </div>
  );
}
