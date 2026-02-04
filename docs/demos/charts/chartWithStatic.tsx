import { AreaChart, AreaChartDataItem } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const ChartWithStaticDemo: React.FC = () => {
  const [data, setData] = useState<AreaChartDataItem[]>([
    // 本年营收数据
    {
      type: '本年营收',
      x: 1,
      y: 45000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 2,
      y: 52000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 3,
      y: 48000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 4,
      y: 61000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 5,
      y: 55000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 6,
      y: 67000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 7,
      y: 72000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 8,
      y: 68000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 9,
      y: 75000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 10,
      y: 78000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 11,
      y: 82000,
      xtitle: '月份',
    },
    {
      type: '本年营收',
      x: 12,
      y: 85000,
      xtitle: '月份',
    },
  ]);

  return (
    <div style={{ padding: '12px' }}>
      <h3>单个统计数据组件</h3>
      <AreaChart
        data={data}
        width={700}
        height={500}
        statistic={{
          title: '总营收',
          value: 655350,
          suffix: '元',
        }}
        legendAlign="center"
      />
      <div style={{ padding: '12px' }}>
        <h3>多个统计数据组件</h3>
        <AreaChart
          data={data}
          width={700}
          height={500}
          statistic={[
            {
              title: '总营收',
              value: 655350,
              suffix: '元',
              tooltip: '总营收tips',
            },
            {
              title: '营业天数',
              value: 365,
              suffix: '天',
              tooltip: '营业天数tips',
            },
          ]}
          legendAlign="center"
        />
      </div>

      <div style={{ padding: '12px' }}>
        <h3>Block 模式</h3>
        <AreaChart
          data={data}
          width={700}
          height={500}
          statistic={[
            {
              title: '总营收',
              value: 655350,
              suffix: '元',
              tooltip: '使用 block 模式',
              block: true,
            },
            {
              title: '营业天数',
              value: 365,
              suffix: '天',
              tooltip: '平分父容器宽度',
              block: true,
            },
            {
              title: '平均日营收',
              value: 1795,
              suffix: '元',
              tooltip: '左对齐显示',
              block: true,
            },
          ]}
          legendAlign="center"
        />
      </div>
    </div>
  );
};

export default ChartWithStaticDemo;
