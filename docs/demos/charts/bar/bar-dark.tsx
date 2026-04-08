import { BarChart, BarChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const data: BarChartDataItem[] = [
  {
    category: '华东',
    type: 'Q1',
    x: 1,
    y: 120,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华东',
    type: 'Q1',
    x: 2,
    y: 156,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华东',
    type: 'Q1',
    x: 3,
    y: 142,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华东',
    type: 'Q2',
    x: 1,
    y: 168,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华东',
    type: 'Q2',
    x: 2,
    y: 175,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华东',
    type: 'Q2',
    x: 3,
    y: 190,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华北',
    type: 'Q1',
    x: 1,
    y: 90,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华北',
    type: 'Q1',
    x: 2,
    y: 102,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华北',
    type: 'Q1',
    x: 3,
    y: 98,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华北',
    type: 'Q2',
    x: 1,
    y: 110,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华北',
    type: 'Q2',
    x: 2,
    y: 125,
    xtitle: '月份',
    ytitle: '万件',
  },
  {
    category: '华北',
    type: 'Q2',
    x: 3,
    y: 118,
    xtitle: '月份',
    ytitle: '万件',
  },
];

const BarChartDarkDemo: React.FC = () => (
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
    <BarChart
      theme="dark"
      title="柱状图（暗黑主题）"
      data={data}
      width={640}
      height={400}
      renderFilterInToolbar
      dataTime="示例数据"
    />
  </div>
);

export default BarChartDarkDemo;
