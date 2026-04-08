import { ScatterChart, ScatterChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const data: ScatterChartDataItem[] = [
  { category: '实验组', type: 'A组', x: 1, y: 25 },
  { category: '实验组', type: 'A组', x: 2, y: 35 },
  { category: '实验组', type: 'A组', x: 3, y: 42 },
  { category: '实验组', type: 'A组', x: 4, y: 48 },
  { category: '实验组', type: 'B组', x: 1, y: 30 },
  { category: '实验组', type: 'B组', x: 2, y: 38 },
  { category: '实验组', type: 'B组', x: 3, y: 45 },
  { category: '实验组', type: 'B组', x: 4, y: 52 },
  { category: '对照组', type: 'A组', x: 1, y: 20 },
  { category: '对照组', type: 'A组', x: 2, y: 28 },
  { category: '对照组', type: 'A组', x: 3, y: 36 },
  { category: '对照组', type: 'A组', x: 4, y: 40 },
  { category: '对照组', type: 'B组', x: 1, y: 22 },
  { category: '对照组', type: 'B组', x: 2, y: 32 },
  { category: '对照组', type: 'B组', x: 3, y: 38 },
  { category: '对照组', type: 'B组', x: 4, y: 46 },
];

const ScatterChartDarkDemo: React.FC = () => (
  <div style={{ padding: 16 }}>
    <p
      style={{
        margin: '0 0 12px',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
      }}
    >
      设置{' '}
      <code style={{ color: 'rgba(255,255,255,0.65)' }}>
        theme=&quot;dark&quot;
      </code>
      ，含工具栏类目筛选（实验组 / 对照组）
    </p>
    <ScatterChart
      theme="dark"
      title="散点图（暗黑主题）"
      data={data}
      width={640}
      height={400}
      renderFilterInToolbar
      dataTime="示例数据"
    />
  </div>
);

export default ScatterChartDarkDemo;
