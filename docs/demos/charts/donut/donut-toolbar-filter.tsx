import { DonutChart, DonutChartData } from '@ant-design/agentic-ui';
import React from 'react';

const DonutChartToolbarFilterExample: React.FC = () => {
  const data: DonutChartData[] = [
    { category: '产品A', label: '产品A', value: 35 },
    { category: '产品A', label: '产品B', value: 28 },
    { category: '产品A', label: '产品C', value: 22 },
    { category: '产品A', label: '产品D', value: 15 },
    { category: '产品B', label: '产品E', value: 42 },
    { category: '产品B', label: '产品F', value: 30 },
    { category: '产品B', label: '产品G', value: 28 },
    { category: '产品C', label: '产品H', value: 50 },
    { category: '产品C', label: '产品I', value: 30 },
    { category: '产品C', label: '产品J', value: 20 },
  ];

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <DonutChart
          title="环形图工具栏过滤器"
          data={data}
          width={400}
          height={400}
          renderFilterInToolbar
          dataTime="2024年数据"
        />
      </div>
    </div>
  );
};

export default DonutChartToolbarFilterExample;
