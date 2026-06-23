import { MarkdownEditor, QuadrantChart } from '@ant-design/agentic-ui';
import React from 'react';

/**
 * - 不足 4 行：剩余象限用默认标签 Q3/Q4 且条目为空；
 * - `columns` / `data` 为空：展示占位文案（与编辑器空态一致）。
 */
const QuadrantFallbackDemo: React.FC = () => {
  const columns = [
    { title: '象限', dataIndex: '象限', key: '象限' },
    { title: '内容', dataIndex: '内容', key: '内容' },
  ];

  const twoRowsOnly = [
    { 象限: '仅两行示例', 内容: '第一象限' },
    { 象限: '第二象限', 内容: '第二象限条目 A，条目 B' },
  ];

  const minimalMarkdown = `## 仅 1 行数据（其余象限补空占位）

<!-- {"chartType": "quadrant", "title": "流式起始"} -->

| 象限 | 内容 |
| :--- | :--- |
| 待填充 | 表格行随流式输出追加 |
`;

  return (
    <div
      style={{
        padding: 16,
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <QuadrantChart
        title="仅 2 行数据 → 自动补 Q3、Q4"
        columns={columns}
        data={twoRowsOnly}
      />

      <QuadrantChart title="组件级空数据" columns={[]} data={[]} />

      <MarkdownEditor
        readonly
        toc={false}
        style={{ border: '1px solid #eee', borderRadius: 8 }}
        initValue={minimalMarkdown}
      />
    </div>
  );
};

export default QuadrantFallbackDemo;
