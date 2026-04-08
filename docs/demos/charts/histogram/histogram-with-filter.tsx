/**
 * title: 带筛选的直方图
 * description: 支持按分类筛选数据
 */
import React from 'react';
import { HistogramChart } from '@ant-design/agentic-ui';

export default () => {
  // 生成模拟数据
  const generateData = (
    count: number,
    mean: number,
    std: number,
    category: string,
  ) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const value = mean + std * z;
      data.push({
        value: Math.round(value * 10) / 10,
        category,
      });
    }
    return data;
  };

  const data = [
    ...generateData(200, 50, 10, '第一季度'),
    ...generateData(200, 55, 12, '第二季度'),
    ...generateData(200, 60, 8, '第三季度'),
  ];

  return (
    <HistogramChart
      title="季度销售分布"
      data={data}
      height={400}
      xAxisLabel="销售额（万元）"
      yAxisLabel="天数"
    />
  );
};