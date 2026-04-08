import { AreaChart, AreaChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const data: AreaChartDataItem[] = [
  {
    category: '营收',
    type: '本年',
    x: 1,
    y: 45000,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '营收',
    type: '本年',
    x: 2,
    y: 52000,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '营收',
    type: '本年',
    x: 3,
    y: 48000,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '营收',
    type: '去年',
    x: 1,
    y: 38000,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '营收',
    type: '去年',
    x: 2,
    y: 41000,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '营收',
    type: '去年',
    x: 3,
    y: 42000,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '成本',
    type: '本年',
    x: 1,
    y: 28000,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '成本',
    type: '本年',
    x: 2,
    y: 31000,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '成本',
    type: '本年',
    x: 3,
    y: 29500,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '成本',
    type: '去年',
    x: 1,
    y: 25000,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '成本',
    type: '去年',
    x: 2,
    y: 26500,
    xtitle: '月份',
    ytitle: '金额',
  },
  {
    category: '成本',
    type: '去年',
    x: 3,
    y: 25800,
    xtitle: '月份',
    ytitle: '金额',
  },
];

const AreaChartDarkDemo: React.FC = () => (
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
      ，含工具栏类目筛选（营收 / 成本）
    </p>
    <AreaChart
      theme="dark"
      title="面积图（暗黑主题）"
      data={data}
      width={640}
      height={400}
      renderFilterInToolbar
      dataTime="示例数据"
    />
  </div>
);

export default AreaChartDarkDemo;
