import { Chart } from 'chart.js';

export type ChartProps = {
  data: any[];
  xField: string;
  yField: string;
  index: number;
  colorLegend?: string;
  chartRef?: React.MutableRefObject<Chart | undefined>;
};
