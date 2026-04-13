/**
 * title: 多系列直方图
 * description: 支持多系列堆叠显示，便于对比不同组别的数据分布
 */
import React from 'react';
import { HistogramChart } from '@ant-design/agentic-ui';

export default () => {
  // 生成正态分布的模拟数据
  const generateNormalData = (
    count: number,
    mean: number,
    std: number,
    type: string,
  ) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const value = mean + std * z;
      data.push({ value: Math.round(value * 10) / 10, type });
    }
    return data;
  };

  const data = [
    ...generateNormalData(150, 70, 12, '实验组'),
    ...generateNormalData(150, 65, 15, '对照组'),
  ];

  return (
    <HistogramChart
      title="实验结果分布对比"
      data={data}
      height={400}
      showLegend={true}
      xAxisLabel="数值"
      yAxisLabel="频数"
      stacked={true}
    />
  );
};