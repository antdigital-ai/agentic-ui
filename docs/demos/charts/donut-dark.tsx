import { DonutChart, DonutChartData } from '@ant-design/agentic-ui';
import React from 'react';

const data: DonutChartData[] = [
  { category: '华东', label: '产品 A', value: 35 },
  { category: '华东', label: '产品 B', value: 40 },
  { category: '华东', label: '产品 C', value: 25 },
  { category: '华北', label: '产品 A', value: 28 },
  { category: '华北', label: '产品 B', value: 45 },
  { category: '华北', label: '产品 C', value: 27 },
];

const DonutChartDarkDemo: React.FC = () => (
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
      ，含工具栏类目筛选（华东 / 华北）
    </p>
    <DonutChart
      theme="dark"
      title="环形图（暗黑主题）"
      data={data}
      width={400}
      height={320}
      showToolbar
      renderFilterInToolbar
      dataTime="示例数据"
      configs={[{ chartStyle: 'donut', showLegend: true }]}
    />
  </div>
);

export default DonutChartDarkDemo;
