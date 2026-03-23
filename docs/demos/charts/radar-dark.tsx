import { RadarChart, RadarChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const data: RadarChartDataItem[] = [
  { category: '研发', label: '技术', type: '当前', score: 75 },
  { category: '研发', label: '设计', type: '当前', score: 60 },
  { category: '研发', label: '产品', type: '当前', score: 80 },
  { category: '研发', label: '运营', type: '当前', score: 65 },
  { category: '研发', label: '技术', type: '目标', score: 90 },
  { category: '研发', label: '设计', type: '目标', score: 85 },
  { category: '研发', label: '产品', type: '目标', score: 95 },
  { category: '研发', label: '运营', type: '目标', score: 80 },
  { category: '市场', label: '技术', type: '当前', score: 55 },
  { category: '市场', label: '设计', type: '当前', score: 70 },
  { category: '市场', label: '产品', type: '当前', score: 62 },
  { category: '市场', label: '运营', type: '当前', score: 78 },
  { category: '市场', label: '技术', type: '目标', score: 80 },
  { category: '市场', label: '设计', type: '目标', score: 88 },
  { category: '市场', label: '产品', type: '目标', score: 85 },
  { category: '市场', label: '运营', type: '目标', score: 92 },
];

const RadarChartDarkDemo: React.FC = () => (
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
      ，含工具栏类目筛选（研发 / 市场）
    </p>
    <RadarChart
      theme="dark"
      title="雷达图（暗黑主题）"
      data={data}
      width={640}
      height={420}
      renderFilterInToolbar
      dataTime="示例数据"
    />
  </div>
);

export default RadarChartDarkDemo;
