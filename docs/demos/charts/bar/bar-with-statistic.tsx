import BarChart, {
  BarChartDataItem,
} from '@ant-design/agentic-ui/Plugins/chart/BarChart';
import React from 'react';

const data: BarChartDataItem[] = [
  {
    category: '营收',
    type: '本季度',
    x: 'Q1',
    y: 320,
    xtitle: '季度',
    ytitle: '营收 (万)',
  },
  {
    category: '营收',
    type: '本季度',
    x: 'Q2',
    y: 410,
    xtitle: '季度',
    ytitle: '营收 (万)',
  },
  {
    category: '营收',
    type: '本季度',
    x: 'Q3',
    y: 365,
    xtitle: '季度',
    ytitle: '营收 (万)',
  },
  {
    category: '营收',
    type: '本季度',
    x: 'Q4',
    y: 452,
    xtitle: '季度',
    ytitle: '营收 (万)',
  },
  { category: '营收', type: '去年同期', x: 'Q1', y: 280 },
  { category: '营收', type: '去年同期', x: 'Q2', y: 330 },
  { category: '营收', type: '去年同期', x: 'Q3', y: 310 },
  { category: '营收', type: '去年同期', x: 'Q4', y: 360 },
];

const statistic = [
  {
    title: '年度目标完成率',
    value: 0.73,
    formatter: (value: number | string | null | undefined) => {
      if (value === null || value === undefined) return '--';
      const num = Number(value);
      if (!Number.isFinite(num)) return '--';
      return `${(num * 100).toFixed(1)}%`;
    },
  },
  {
    title: '季度营收合计',
    value: 1547,
    suffix: ' 万元',
    precision: 0,
  },
];

const BarWithStatisticDemo: React.FC = () => {
  return (
    <BarChart
      title="季度营收对比"
      data={data}
      width={700}
      height={420}
      statistic={statistic}
    />
  );
};

export default BarWithStatisticDemo;
