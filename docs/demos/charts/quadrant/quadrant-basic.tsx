import { QuadrantChart } from '@ant-design/agentic-ui';
import React from 'react';

/**
 * 直接使用 QuadrantChart（不走 Markdown 注释路径）。
 *
 * 与 `chartType: "quadrant"` 的数据契约一致：前两列表头对应 `columns` 的
 * `dataIndex`，`data` 为行数组；前 4 行依次映射为 2×2 网格。
 */
const QuadrantBasicDemo: React.FC = () => {
  const columns = [
    { title: '象限', dataIndex: '象限', key: '象限' },
    { title: '内容', dataIndex: '内容', key: '内容' },
  ];

  const data = [
    { 象限: '重要且紧急', 内容: '线上故障, 客户投诉, 安全漏洞' },
    { 象限: '重要不紧急', 内容: '架构演进; 文档沉淀；人才培养' },
    { 象限: '不重要但紧急', 内容: '部分会议，临时报表' },
    { 象限: '不重要不紧急', 内容: '闲杂邮件，无效社交' },
  ];

  return (
    <div style={{ padding: 16, background: '#fafafa' }}>
      <QuadrantChart title="艾森豪威尔矩阵" columns={columns} data={data} />
    </div>
  );
};

export default QuadrantBasicDemo;
