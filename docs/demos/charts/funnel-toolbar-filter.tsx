import { FunnelChart, FunnelChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const FunnelChartToolbarFilterExample: React.FC = () => {
  const data: FunnelChartDataItem[] = [
    { category: '2024', x: '访问', y: 1000 },
    { category: '2024', x: '浏览', y: 800 },
    { category: '2024', x: '加购', y: 600 },
    { category: '2024', x: '支付', y: 400 },
    { category: '2025', x: '访问', y: 1200 },
    { category: '2025', x: '浏览', y: 950 },
    { category: '2025', x: '加购', y: 750 },
    { category: '2025', x: '支付', y: 500 },
  ];

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <FunnelChart
          title="漏斗图工具栏过滤器"
          data={data}
          width={600}
          height={400}
          renderFilterInToolbar
          dataTime="转化漏斗数据"
        />
      </div>
    </div>
  );
};

export default FunnelChartToolbarFilterExample;
