import BarChart, {
  BarChartDataItem,
} from '@ant-design/agentic-ui/Plugins/chart/BarChart';
import { Switch } from 'antd';
import React, { useState } from 'react';

const BarChartWithLabelsExample: React.FC = () => {
  const [showLabels, setShowLabels] = useState(true);

  // 扁平化数据结构 - 带数据标签的柱状图
  const [data] = useState<BarChartDataItem[]>([
    // 产品销量数据 - 全球
    {
      category: '产品销量',
      type: '手机',
      x: 1,
      y: 1250,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '手机',
      x: 2,
      y: 1580,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '手机',
      x: 3,
      y: 1890,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '手机',
      x: 4,
      y: 2150,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },

    {
      category: '产品销量',
      type: '电脑',
      x: 1,
      y: 850,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '电脑',
      x: 2,
      y: 920,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '电脑',
      x: 3,
      y: 1050,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '电脑',
      x: 4,
      y: 1200,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },

    {
      category: '产品销量',
      type: '平板',
      x: 1,
      y: 420,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '平板',
      x: 2,
      y: 580,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '平板',
      x: 3,
      y: 650,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },
    {
      category: '产品销量',
      type: '平板',
      x: 4,
      y: 720,
      xtitle: '季度',
      ytitle: '销量（台）',
      filterLabel: '全球',
    },

    // 部门预算数据 - 全球
    {
      category: '部门预算',
      type: '研发部',
      x: 1,
      y: 185000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
    {
      category: '部门预算',
      type: '研发部',
      x: 2,
      y: 225000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
    {
      category: '部门预算',
      type: '研发部',
      x: 3,
      y: 268000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
    {
      category: '部门预算',
      type: '研发部',
      x: 4,
      y: 312000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },

    {
      category: '部门预算',
      type: '市场部',
      x: 1,
      y: 95000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
    {
      category: '部门预算',
      type: '市场部',
      x: 2,
      y: 128000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
    {
      category: '部门预算',
      type: '市场部',
      x: 3,
      y: 145000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
    {
      category: '部门预算',
      type: '市场部',
      x: 4,
      y: 168000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },

    {
      category: '部门预算',
      type: '销售部',
      x: 1,
      y: 125000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
    {
      category: '部门预算',
      type: '销售部',
      x: 2,
      y: 158000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
    {
      category: '部门预算',
      type: '销售部',
      x: 3,
      y: 182000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
    {
      category: '部门预算',
      type: '销售部',
      x: 4,
      y: 215000,
      xtitle: '部门',
      ytitle: '预算金额',
      filterLabel: '全球',
    },
  ]);

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: '0 0 12px' }}>带数据标签的柱状图</h3>
      <div
        style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}
      >
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>显示数据标签：</span>
          <Switch checked={showLabels} onChange={setShowLabels} />
        </div>

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
          💡 通过 showDataLabels 属性控制是否在柱子顶部显示数值标签
        </div>
      </div>

      <BarChart
        title="季度产品销量"
        data={data}
        width={700}
        height={500}
        showDataLabels={showLabels}
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
        <h4 style={{ marginTop: 0, color: '#333' }}>数据标签配置示例：</h4>
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
          {`<BarChart
  data={data}
  showDataLabels={true}  // 开启数据标签
/>`}
        </pre>
      </div>

      {/* 使用场景说明 */}
      <div
        style={{
          marginTop: '15px',
          backgroundColor: '#fffbe6',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #ffe58f',
        }}
      >
        <h4 style={{ marginTop: 0, color: '#333' }}>💡 数据标签特性：</h4>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li>
            <strong>垂直柱状图：</strong>数值显示在柱子顶部
          </li>
          <li>
            <strong>条形图（横向）：</strong>数值显示在柱子右侧
          </li>
          <li>
            <strong>堆叠图：</strong>在最外层显示累计总和
          </li>
          <li>
            <strong>自定义格式：</strong>
            支持通过 dataLabelFormatter
            自定义显示格式（添加单位、千分位、保留小数等）
          </li>
          <li>
            <strong>默认格式：</strong>未提供格式化函数时，自动添加千分位分隔符
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BarChartWithLabelsExample;
