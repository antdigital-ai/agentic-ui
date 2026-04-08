import BarChart, {
  BarChartDataItem,
} from '@ant-design/agentic-ui/Plugins/chart/BarChart';
import type { ChartOptions } from 'chart.js';
import React from 'react';

/**
 * `y` 使用「小数 + 空格 + 亿元」等口语字符串时，图表会解析为以「元」为单位的数值。
 * 与 Markdown 表格 / 图表块的数据预处理行为一致。
 */
const data: BarChartDataItem[] = [
  {
    category: 'IPO',
    type: '募资',
    x: '研发类项目 (85%)',
    y: '35.78 亿元',
    xtitle: '用途',
    ytitle: '金额',
  },
  {
    category: 'IPO',
    type: '募资',
    x: '制造基地建设 (15%)',
    y: '6.24 亿元',
    xtitle: '用途',
    ytitle: '金额',
  },
];

const chartOptions: Partial<ChartOptions<'bar'>> = {
  scales: {
    y: {
      ticks: {
        callback(tickValue) {
          const n = Number(tickValue);
          if (!Number.isFinite(n)) return String(tickValue);
          return `${(n / 1e8).toFixed(1)} 亿`;
        },
      },
    },
  },
};

const BarChineseCurrencyDemo: React.FC = () => {
  return (
    <BarChart
      title="IPO 募资用途分配（约 42 亿募资用途分布）"
      data={data}
      width={700}
      height={420}
      showDataLabels
      dataLabelFormatter={({ value }) => {
        if (typeof value === 'number' && Number.isFinite(value)) {
          return `${(value / 1e8).toFixed(2)} 亿`;
        }
        return '';
      }}
      chartOptions={chartOptions}
    />
  );
};

export default BarChineseCurrencyDemo;
