import { ScatterChart, ScatterChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const ScatterChartStatisticExample: React.FC = () => {
  const data: ScatterChartDataItem[] = [
    { category: '产品A', x: 20, y: 65 },
    { category: '产品A', x: 25, y: 75 },
    { category: '产品A', x: 30, y: 85 },
    { category: '产品A', x: 35, y: 70 },
    { category: '产品A', x: 40, y: 95 },
    { category: '产品B', x: 18, y: 55 },
    { category: '产品B', x: 22, y: 65 },
    { category: '产品B', x: 28, y: 75 },
    { category: '产品B', x: 32, y: 60 },
    { category: '产品B', x: 38, y: 85 },
  ];

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <ScatterChart
          title="散点图统计指标"
          data={data}
          width={600}
          height={400}
          dataTime="2024年数据"
          statistic={[
            { title: '平均X值', value: 28.3, precision: 1 },
            { title: '平均Y值', value: 71.4, precision: 1 },
            { title: '数据点', value: 10, suffix: '个' },
          ]}
        />
      </div>
    </div>
  );
};

export default ScatterChartStatisticExample;
