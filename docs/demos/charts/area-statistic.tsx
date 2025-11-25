import { AreaChart, AreaChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const AreaChartStatisticExample: React.FC = () => {
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
          title="面积图统计指标"
          data={data}
          width={700}
          height={400}
          dataTime="2024年数据"
          statistic={[
            { title: '总营收', value: 225000, suffix: '元' },
            { title: '总成本', value: 120000, suffix: '元' },
            { title: '净利润', value: 105000, suffix: '元' },
          ]}
        />
      </div>
    </div>
  );
};

export default AreaChartStatisticExample;
