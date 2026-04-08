/**
 * title: 暗黑主题
 * description: 设置 theme="dark"，与 ChartContainer 暗色算法一致
 */
import React from 'react';
import { HistogramChart } from '@ant-design/agentic-ui';

/** 可复现的伪随机，保证文档预览每次一致 */
const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export default () => {
  const rand = mulberry32(20250323);
  const data: { value: number }[] = [];
  for (let i = 0; i < 200; i++) {
    const u1 = Math.max(Number.EPSILON, rand());
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const value = 50 + 15 * z;
    data.push({ value: Math.round(value * 10) / 10 });
  }

  return (
    <HistogramChart
      theme="dark"
      title="考试成绩分布"
      data={data}
      height={400}
      xAxisLabel="分数"
      yAxisLabel="人数"
      dataTime="示例数据"
    />
  );
};
