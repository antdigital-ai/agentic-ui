import { DonutChart, DonutChartData } from '@ant-design/agentic-ui';
import React from 'react';

const DonutChartStatisticExample: React.FC = () => {
  const data: DonutChartData[] = [
    { category: '产品A', label: '产品A', value: 35 },
    { category: '产品A', label: '产品B', value: 28 },
    { category: '产品A', label: '产品C', value: 22 },
    { category: '产品A', label: '产品D', value: 15 },
  ];

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <DonutChart
          title="环形图统计指标"
          data={data}
          width={400}
          height={400}
          dataTime="2024年数据"
          statistic={[
            { title: '总销量', value: 100, suffix: '万件' },
            { title: '同比增长', value: 15.8, suffix: '%' },
          ]}
        />
      </div>
    </div>
  );
};

export default DonutChartStatisticExample;
