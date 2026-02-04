import { FunnelChart, FunnelChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const FunnelChartStatisticExample: React.FC = () => {
  const data: FunnelChartDataItem[] = [
    { category: '2024', x: '访问', y: 1000 },
    { category: '2024', x: '浏览', y: 800 },
    { category: '2024', x: '加购', y: 600 },
    { category: '2024', x: '支付', y: 400 },
  ];

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <FunnelChart
          title="漏斗图统计指标"
          data={data}
          width={600}
          height={400}
          dataTime="2024年数据"
          statistic={[
            { title: '总访问', value: 1000, suffix: '人次' },
            { title: '总支付', value: 400, suffix: '人次' },
            { title: '转化率', value: 40, suffix: '%' },
          ]}
        />
      </div>
    </div>
  );
};

export default FunnelChartStatisticExample;
