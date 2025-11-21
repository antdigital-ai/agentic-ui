import { AreaChart, AreaChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const AreaChartToolbarFilterExample: React.FC = () => {
  const data: AreaChartDataItem[] = [
    {
      category: '营收数据',
      type: 'Q1',
      x: 1,
      y: 45000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q2',
      x: 2,
      y: 52000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q3',
      x: 3,
      y: 61000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q4',
      x: 4,
      y: 67000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '成本数据',
      type: 'Q1',
      x: 1,
      y: 25000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q2',
      x: 2,
      y: 28000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q3',
      x: 3,
      y: 32000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q4',
      x: 4,
      y: 35000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
  ];

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <AreaChart
          title="面积图工具栏过滤器"
          data={data}
          width={700}
          height={400}
          renderFilterInToolbar
          dataTime="2024年数据"
        />
      </div>
    </div>
  );
};

export default AreaChartToolbarFilterExample;
