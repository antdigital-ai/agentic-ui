import { RadarChart, RadarChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const RadarChartStatisticExample: React.FC = () => {
  const data: RadarChartDataItem[] = [
    { category: '团队A', x: '产品', y: 85 },
    { category: '团队A', x: '技术', y: 90 },
    { category: '团队A', x: '运营', y: 75 },
    { category: '团队A', x: '设计', y: 80 },
    { category: '团队A', x: '服务', y: 88 },
    { category: '团队B', x: '产品', y: 75 },
    { category: '团队B', x: '技术', y: 85 },
    { category: '团队B', x: '运营', y: 70 },
    { category: '团队B', x: '设计', y: 80 },
    { category: '团队B', x: '服务', y: 82 },
  ];

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <RadarChart
          title="雷达图统计指标"
          data={data}
          width={600}
          height={400}
          dataTime="团队评估数据"
          statistic={[
            { title: '团队A平均分', value: 83.6, precision: 1 },
            { title: '团队B平均分', value: 78.4, precision: 1 },
          ]}
        />
      </div>
    </div>
  );
};

export default RadarChartStatisticExample;
