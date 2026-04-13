/**
 * title: 自定义分箱数量
 * description: 手动指定分箱数量，而非使用自动计算
 */
import React from 'react';
import { HistogramChart } from '@ant-design/agentic-ui';

export default () => {
  // 生成模拟数据
  const data = [];
  for (let i = 0; i < 500; i++) {
    const value = 20 + Math.random() * 80;
    data.push({ value: Math.round(value * 10) / 10 });
  }

  return (
    <HistogramChart
      title="数据分布（10个分箱）"
      data={data}
      height={400}
      binCount={10}
      xAxisLabel="数值"
      yAxisLabel="频数"
    />
  );
};