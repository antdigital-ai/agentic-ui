import BarChart, {
  BarChartDataItem,
} from '@ant-design/agentic-ui/Plugins/chart/BarChart';
import { Button } from 'antd';
import React, { useState } from 'react';

const HorizontalBarChartExample: React.FC = () => {
  // 扁平化数据结构 - 条形图（水平柱状图）
  const [data, setData] = useState<BarChartDataItem[]>([
    // 产品销量数据 - 全球
    {
      category: '产品销量',
      type: '销量',
      x: 1,
      y: 320,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '销量',
      x: 2,
      y: 452,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '销量',
      x: 3,
      y: 301,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '销量',
      x: 4,
      y: 334,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '销量',
      x: 5,
      y: 390,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '全球',
    },

    // 地区销售额数据 - 全球
    {
      category: '地区销售额',
      type: '销售额',
      x: 1,
      y: 125000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '地区销售额',
      type: '销售额',
      x: 2,
      y: 168000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '地区销售额',
      type: '销售额',
      x: 3,
      y: 142000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '地区销售额',
      type: '销售额',
      x: 4,
      y: 89000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '地区销售额',
      type: '销售额',
      x: 5,
      y: 76000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },

    // 美国数据（带filterLabel）
    {
      category: '产品销量',
      type: '销量',
      x: 1,
      y: 420,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '美国',
    },
    {
      category: '产品销量',
      type: '销量',
      x: 2,
      y: 552,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '美国',
    },
    {
      category: '产品销量',
      type: '销量',
      x: 3,
      y: 401,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '美国',
    },
    {
      category: '产品销量',
      type: '销量',
      x: 4,
      y: 434,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '美国',
    },
    {
      category: '产品销量',
      type: '销量',
      x: 5,
      y: 490,
      xtitle: '销量',
      ytitle: '产品',
      filterLabel: '美国',
    },

    {
      category: '地区销售额',
      type: '销售额',
      x: 1,
      y: 185000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '地区销售额',
      type: '销售额',
      x: 2,
      y: 228000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '地区销售额',
      type: '销售额',
      x: 3,
      y: 192000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '地区销售额',
      type: '销售额',
      x: 4,
      y: 139000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '地区销售额',
      type: '销售额',
      x: 5,
      y: 116000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
  ]);

  const handleRandomize = () => {
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        y:
          item.category === '产品销量'
            ? Math.floor(Math.random() * 500) + 200 // 产品销量数据范围 200-700
            : Math.floor(Math.random() * 150000) + 50000, // 销售额数据范围 50000-200000
      })),
    );
  };

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: '0 0 12px' }}>条形图（横向柱状图）</h3>
      <div
        style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}
      >
        <Button type="primary" onClick={handleRandomize}>
          随机更新数据
        </Button>

        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          💡 使用扁平化数据结构，包含 xtitle 和 ytitle
          字段，支持二级筛选。支持通过 chartOptions 属性自定义 Chart.js
          选项。自动计算标签宽度并调整图表padding。
        </div>
      </div>

      <BarChart
        title="条形图（横向柱状图）"
        data={data}
        width={700}
        height={500}
        indexAxis="y"
        dataLabelFormatter={(params) => {
          return `top${params.dataIndex + 1}条形图（横向柱状图）助手`;
        }}
        showDataLabels={true}
      />

      {/* 数据格式说明 */}
      <div
        style={{
          marginTop: '20px',
          backgroundColor: '#f0f8ff',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e8e8e8',
        }}
      >
        <h4 style={{ marginTop: 0, color: '#333' }}>扁平化数据格式示例：</h4>
        <pre
          style={{
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '11px',
            margin: 0,
            overflow: 'auto',
          }}
        >
          {`// 扁平化数据格式：包含 xtitle 和 ytitle 字段
[
  {
    category: "产品销量",
    type: "销量",
    x: 1,
    y: 320,
    xtitle: "销量",
    ytitle: "产品"
  },
  {
    category: "地区销售额",
    type: "销售额",
    x: 1,
    y: 125000,
    xtitle: "销售额",
    ytitle: "地区"
  },
  // ... 更多数据
]`}
        </pre>
      </div>

      {/* 自动标签宽度计算说明 */}
      <div
        style={{
          marginTop: '20px',
          backgroundColor: '#f6ffed',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #b7eb8f',
        }}
      >
        <h4 style={{ marginTop: 0, color: '#333' }}>自动标签宽度计算功能：</h4>
        <ul
          style={{
            margin: '10px 0',
            paddingLeft: '20px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          <li>
            📏 <strong>自动测量</strong>：使用Canvas API精确测量标签文本宽度
          </li>
          <li>
            📐 <strong>动态调整</strong>
            ：根据最大标签宽度自动调整图表layout.padding
          </li>
          <li>
            🎯 <strong>智能适配</strong>
            ：水平柱状图增加右侧padding，垂直柱状图增加上方padding
          </li>
          <li>
            🔄 <strong>实时更新</strong>：数据变化时自动重新计算并调整布局
          </li>
          <li>
            ⚙️ <strong>可配置</strong>
            ：支持通过chartOptions.layout.padding手动覆盖
          </li>
        </ul>
        <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#666' }}>
          💡
          当showDataLabels为true时，组件会自动计算所有数据标签的最大宽度，并相应调整图表的内边距，确保标签不会被截断。
        </p>
      </div>
    </div>
  );
};

export default HorizontalBarChartExample;
