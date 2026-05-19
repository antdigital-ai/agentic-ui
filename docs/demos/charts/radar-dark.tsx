import { RadarChart, RadarChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const data: RadarChartDataItem[] = [
  { category: '研发', x: '技术', type: '当前', y: 75 },
  { category: '研发', x: '设计', type: '当前', y: 60 },
  { category: '研发', x: '产品', type: '当前', y: 80 },
  { category: '研发', x: '运营', type: '当前', y: 65 },
  { category: '研发', x: '技术', type: '目标', y: 90 },
  { category: '研发', x: '设计', type: '目标', y: 85 },
  { category: '研发', x: '产品', type: '目标', y: 95 },
  { category: '研发', x: '运营', type: '目标', y: 80 },
  { category: '市场', x: '技术', type: '当前', y: 55 },
  { category: '市场', x: '设计', type: '当前', y: 70 },
  { category: '市场', x: '产品', type: '当前', y: 62 },
  { category: '市场', x: '运营', type: '当前', y: 78 },
  { category: '市场', x: '技术', type: '目标', y: 80 },
  { category: '市场', x: '设计', type: '目标', y: 88 },
  { category: '市场', x: '产品', type: '目标', y: 85 },
  { category: '市场', x: '运营', type: '目标', y: 92 },
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
