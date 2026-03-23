/**
 * title: 基础箱线图
 * description: 展示数据分布的统计图表，自动计算最小值、Q1、中位数、Q3、最大值
 */
import { BoxPlotChart } from '@ant-design/agentic-ui';

export default () => {
  const data = [
    { label: '实验组', values: [12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52] },
    { label: '对照组', values: [18, 22, 25, 28, 30, 33, 36, 40, 42, 45, 48, 52, 55] },
  ];

  return (
    <BoxPlotChart
      title="实验结果分布"
      data={data}
      height={400}
    />
  );
};