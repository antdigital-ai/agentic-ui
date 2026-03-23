import { FunnelChart, FunnelChartDataItem } from '@ant-design/agentic-ui';
import React from 'react';

const data: FunnelChartDataItem[] = [
  {
    category: '电商转化',
    type: '漏斗',
    x: '访问',
    y: 12000,
    ratio: 80,
  },
  {
    category: '电商转化',
    type: '漏斗',
    x: '浏览',
    y: 8200,
    ratio: 65,
  },
  {
    category: '电商转化',
    type: '漏斗',
    x: '加购',
    y: 5400,
    ratio: 41,
  },
  {
    category: '电商转化',
    type: '漏斗',
    x: '下单',
    y: 2600,
    ratio: 33,
  },
  {
    category: '电商转化',
    type: '漏斗',
    x: '支付',
    y: 1800,
    ratio: 0,
  },
  {
    category: '活动页',
    type: '漏斗',
    x: '访问',
    y: 8000,
    ratio: 75,
  },
  {
    category: '活动页',
    type: '漏斗',
    x: '浏览',
    y: 5200,
    ratio: 60,
  },
  {
    category: '活动页',
    type: '漏斗',
    x: '加购',
    y: 3100,
    ratio: 38,
  },
  {
    category: '活动页',
    type: '漏斗',
    x: '下单',
    y: 1500,
    ratio: 28,
  },
  {
    category: '活动页',
    type: '漏斗',
    x: '支付',
    y: 1100,
    ratio: 0,
  },
];

const FunnelChartDarkDemo: React.FC = () => (
  <div style={{ padding: 16 }}>
    <p
      style={{
        margin: '0 0 12px',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
      }}
    >
      设置{' '}
      <code style={{ color: 'rgba(255,255,255,0.65)' }}>
        theme=&quot;dark&quot;
      </code>
      ，含工具栏类目筛选（电商转化 / 活动页）
    </p>
    <FunnelChart
      theme="dark"
      title="漏斗图（暗黑主题）"
      data={data}
      height={320}
      renderFilterInToolbar
      dataTime="示例数据"
    />
  </div>
);

export default FunnelChartDarkDemo;
