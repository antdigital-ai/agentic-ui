import { LineChart, LineChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const data: LineChartDataItem[] = [
  {
    category: '访客',
    type: '本周',
    x: 1,
    y: 120,
    xtitle: '日',
    ytitle: '人数',
  },
  {
    category: '访客',
    type: '本周',
    x: 2,
    y: 132,
    xtitle: '日',
    ytitle: '人数',
  },
  {
    category: '访客',
    type: '本周',
    x: 3,
    y: 101,
    xtitle: '日',
    ytitle: '人数',
  },
  {
    category: '访客',
    type: '上周',
    x: 1,
    y: 220,
    xtitle: '日',
    ytitle: '人数',
  },
  {
    category: '访客',
    type: '上周',
    x: 2,
    y: 182,
    xtitle: '日',
    ytitle: '人数',
  },
  {
    category: '访客',
    type: '上周',
    x: 3,
    y: 191,
    xtitle: '日',
    ytitle: '人数',
  },
  {
    category: '订单',
    type: '本周',
    x: 1,
    y: 45,
    xtitle: '日',
    ytitle: '单量',
  },
  {
    category: '订单',
    type: '本周',
    x: 2,
    y: 52,
    xtitle: '日',
    ytitle: '单量',
  },
  {
    category: '订单',
    type: '本周',
    x: 3,
    y: 48,
    xtitle: '日',
    ytitle: '单量',
  },
  {
    category: '订单',
    type: '上周',
    x: 1,
    y: 38,
    xtitle: '日',
    ytitle: '单量',
  },
  {
    category: '订单',
    type: '上周',
    x: 2,
    y: 41,
    xtitle: '日',
    ytitle: '单量',
  },
  {
    category: '订单',
    type: '上周',
    x: 3,
    y: 44,
    xtitle: '日',
    ytitle: '单量',
  },
];

const LineChartDarkDemo: React.FC = () => (
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
      ，含工具栏类目筛选（访客 / 订单）
    </p>
    <LineChart
      theme="dark"
      title="折线图（暗黑主题）"
      data={data}
      width={640}
      height={400}
      renderFilterInToolbar
      dataTime="示例数据"
    />
  </div>
);

export default LineChartDarkDemo;
