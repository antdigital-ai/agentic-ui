import { AreaChart, AreaChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const AreaChartStatisticExample: React.FC = () => {
  // 保留 Q1~Q4 作为系列，每个系列提供多个点，形成连续面积
  const data: AreaChartDataItem[] = [
    // 营收：Q1
    {
      category: '营收数据',
      type: 'Q1',
      x: 1,
      y: 15000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q1',
      x: 2,
      y: 18000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q1',
      x: 3,
      y: 22000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    // 营收：Q2
    {
      category: '营收数据',
      type: 'Q2',
      x: 4,
      y: 23000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q2',
      x: 5,
      y: 25000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q2',
      x: 6,
      y: 28000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    // 营收：Q3
    {
      category: '营收数据',
      type: 'Q3',
      x: 7,
      y: 24000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q3',
      x: 8,
      y: 27000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q3',
      x: 9,
      y: 30000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    // 营收：Q4
    {
      category: '营收数据',
      type: 'Q4',
      x: 10,
      y: 26000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q4',
      x: 11,
      y: 29000,
      xtitle: '季度',
      ytitle: '营收金额',
    },
    {
      category: '营收数据',
      type: 'Q4',
      x: 12,
      y: 32000,
      xtitle: '季度',
      ytitle: '营收金额',
    },

    // 成本：Q1
    {
      category: '成本数据',
      type: 'Q1',
      x: 1,
      y: 8000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q1',
      x: 2,
      y: 9500,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q1',
      x: 3,
      y: 11000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    // 成本：Q2
    {
      category: '成本数据',
      type: 'Q2',
      x: 4,
      y: 12000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q2',
      x: 5,
      y: 13500,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q2',
      x: 6,
      y: 15000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    // 成本：Q3
    {
      category: '成本数据',
      type: 'Q3',
      x: 7,
      y: 14500,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q3',
      x: 8,
      y: 16000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q3',
      x: 9,
      y: 17500,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    // 成本：Q4
    {
      category: '成本数据',
      type: 'Q4',
      x: 10,
      y: 17000,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q4',
      x: 11,
      y: 18500,
      xtitle: '季度',
      ytitle: '成本金额',
    },
    {
      category: '成本数据',
      type: 'Q4',
      x: 12,
      y: 20000,
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
            { title: '总营收', value: 299000, suffix: '元' },
            { title: '总成本', value: 172500, suffix: '元' },
            { title: '净利润', value: 126500, suffix: '元' },
          ]}
        />
      </div>
    </div>
  );
};

export default AreaChartStatisticExample;
