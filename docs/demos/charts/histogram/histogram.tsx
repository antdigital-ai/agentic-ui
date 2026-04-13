/**
 * title: 基础直方图
 * description: 展示数据分布频率，自动使用 Sturges 规则计算分箱数量
 */
import React from 'react';
import { HistogramChart } from '@ant-design/agentic-ui';

export default () => {
  // 生成正态分布的模拟数据
  const generateNormalData = (count: number, mean: number, std: number) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      // Box-Muller 变换生成正态分布
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const value = mean + std * z;
      data.push({ value: Math.round(value * 10) / 10 });
    }
    return data;
  };

  const data = generateNormalData(200, 50, 15);

  return (
    <HistogramChart
      title="考试成绩分布"
      data={data}
      height={400}
      xAxisLabel="分数"
      yAxisLabel="人数"
    />
  );
};