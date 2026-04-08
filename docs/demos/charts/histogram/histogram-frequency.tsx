/**
 * title: 频率直方图
 * description: 显示频率而非计数，便于比较不同样本量的分布
 */
import React from 'react';
import { HistogramChart } from '@ant-design/agentic-ui';

export default () => {
  // 生成模拟数据
  const generateData = (count: number, min: number, max: number, type: string) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const value = min + Math.random() * (max - min);
      data.push({ value: Math.round(value * 100) / 100, type });
    }
    return data;
  };

  const data = [
    ...generateData(300, 0, 100, '样本A'),
    ...generateData(200, 0, 100, '样本B'),
  ];

  return (
    <HistogramChart
      title="数据分布频率对比"
      data={data}
      height={400}
      showLegend={true}
      showFrequency={true}
      xAxisLabel="数值范围"
      yAxisLabel="频率"
    />
  );
};