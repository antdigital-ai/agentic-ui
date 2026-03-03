import DonutChart, {
  DonutChartData,
} from '@ant-design/agentic-ui/Plugins/chart/DonutChart';
import React, { useMemo } from 'react';

/** 生成大数据量饼图示例数据（用于演示图例分页与扇区数据标签） */
const generateLargeData = (count: number): DonutChartData[] => {
  return Array.from({ length: count }, (_, i) => ({
    label: `值_${i + 1}`,
    value: Math.round(50 + Math.random() * 200),
  }));
};

const DonutLargeDataDemo: React.FC = () => {
  const data = useMemo(() => generateLargeData(40), []);

  return (
    <div style={{ padding: 12, color: '#767E8B', fontSize: 12 }}>
      <p>
        大数据量饼图：数据项较多时自动启用图例分页（每页 12 条）；开启
        showDataLabels 后扇区外展示数值与占比，并通过指示线连接扇区与文案。
      </p>
      <DonutChart
        data={data}
        width={420}
        height={320}
        configs={[
          {
            chartStyle: 'pie',
            showLegend: true,
            showDataLabels: false,
          },
        ]}
        title="多分类占比分析（大数据量）"
      />
    </div>
  );
};

export default DonutLargeDataDemo;
