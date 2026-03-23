/**
 * title: 暗黑主题
 * description: 设置 theme="dark"，与 ChartContainer 暗色算法一致
 */
import { BoxPlotChart } from '@ant-design/agentic-ui';

export default () => {
  const data = [
    {
      label: '实验组',
      values: [12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52],
    },
    {
      label: '对照组',
      values: [18, 22, 25, 28, 30, 33, 36, 40, 42, 45, 48, 52, 55],
    },
  ];

  return (
    <BoxPlotChart
      theme="dark"
      title="实验结果分布"
      data={data}
      height={400}
      dataTime="示例数据"
    />
  );
};
