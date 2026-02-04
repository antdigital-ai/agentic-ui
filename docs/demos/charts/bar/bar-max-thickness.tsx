import BarChart, {
  BarChartDataItem,
} from '@ant-design/agentic-ui/Plugins/chart/BarChart';
import { Slider } from 'antd';
import React, { useState } from 'react';

const BarMaxThicknessExample: React.FC = () => {
  const [maxBarThickness, setMaxBarThickness] = useState<number>(50);

  // 少量数据示例 - 用于展示柱子宽度控制
  const data: BarChartDataItem[] = [
    {
      category: '销售数据',
      type: '本季度销售额',
      x: 'Q1',
      y: 85000,
      xtitle: '季度',
      ytitle: '销售额（元）',
    },
    {
      category: '销售数据',
      type: '本季度销售额',
      x: 'Q2',
      y: 92000,
      xtitle: '季度',
      ytitle: '销售额（元）',
    },
    {
      category: '销售数据',
      type: '本季度销售额',
      x: 'Q3',
      y: 78000,
      xtitle: '季度',
      ytitle: '销售额（元）',
    },
  ];

  return (
    <div style={{ padding: '12px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        柱子最大宽度控制示例
      </h2>

      <div
        style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          border: '1px solid #e8e8e8',
        }}
      >
        <div style={{ marginBottom: '12px', color: '#333', fontWeight: 500 }}>
          柱子最大宽度：{maxBarThickness}
        </div>
        <Slider
          min={20}
          max={150}
          value={maxBarThickness}
          onChange={setMaxBarThickness}
          marks={{
            20: '20px',
            50: '50px',
            80: '80px',
            150: '150px',
          }}
          tooltip={{ formatter: (value) => `${value}px` }}
        />
        <div
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#666',
            lineHeight: '1.6',
          }}
        >
          💡 提示：当数据较少时，通过设置 <code>maxBarThickness</code>{' '}
          可以避免柱子过宽，保持美观。建议值：30-80 像素。
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>
          当前设置: maxBarThickness = {maxBarThickness}px
        </div>
        <BarChart
          title="季度销售数据"
          data={data}
          width={700}
          height={400}
          maxBarThickness={maxBarThickness}
          showDataLabels={true}
          dataLabelFormatter={({ value }) => `¥${value.toLocaleString()}`}
        />
      </div>

      {/* 对比说明 */}
      <div
        style={{
          marginTop: '20px',
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e8e8e8',
        }}
      >
        <h4 style={{ marginTop: 0, color: '#333' }}>使用场景说明：</h4>
        <ul style={{ color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>
            <strong>数据点较少时（如 2-5 个）</strong>
            ：不设置此参数会导致柱子非常宽，影响视觉美观
          </li>
          <li>
            <strong>推荐设置范围</strong>：30-80
            像素，具体取决于图表大小和设计需求
          </li>
          <li>
            <strong>横向条形图</strong>：此参数同样适用，控制条形的最大高度
          </li>
          <li>
            <strong>堆叠柱状图</strong>：参数对堆叠的整体柱子生效
          </li>
        </ul>

        <h4 style={{ marginTop: '16px', color: '#333' }}>代码示例：</h4>
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '12px',
            margin: 0,
            overflow: 'auto',
          }}
        >
          {`<BarChart
  data={data}
  maxBarThickness={50}  // 限制柱子最大宽度为 50 像素
  title="季度销售数据"
/>`}
        </pre>
      </div>
    </div>
  );
};

export default BarMaxThicknessExample;
