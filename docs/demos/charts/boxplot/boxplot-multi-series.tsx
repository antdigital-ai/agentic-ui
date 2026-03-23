/**
 * title: 多系列箱线图
 * description: 支持多系列分组显示，便于对比不同组别的数据分布
 */
import { BoxPlotChart } from '@ant-design/agentic-ui';

export default () => {
  const data = [
    { label: '一月', values: [12, 15, 18, 22, 25, 28, 32], type: '产品A' },
    { label: '一月', values: [18, 22, 25, 28, 30, 33, 36], type: '产品B' },
    { label: '二月', values: [15, 18, 22, 26, 30, 34, 38], type: '产品A' },
    { label: '二月', values: [20, 24, 28, 32, 36, 40, 44], type: '产品B' },
    { label: '三月', values: [18, 22, 26, 30, 35, 40, 45], type: '产品A' },
    { label: '三月', values: [22, 26, 30, 35, 40, 45, 50], type: '产品B' },
  ];

  return (
    <BoxPlotChart
      title="产品销售分布对比"
      data={data}
      height={400}
      showLegend={true}
      xAxisLabel="月份"
      yAxisLabel="销售额（万元）"
    />
  );
};