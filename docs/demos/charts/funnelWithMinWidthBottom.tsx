import { FunnelChart, FunnelChartDataItem } from '@ant-design/agentic-ui';
import { Slider } from 'antd';
import React, { useState } from 'react';

// 模拟数据跨度很大的场景
const data: FunnelChartDataItem[] = [
  {
    category: '用户转化',
    type: '转化',
    x: '曝光',
    y: 100000,
    ratio: 20,
  },
  {
    category: '用户转化',
    type: '转化',
    x: '点击',
    y: 20000,
    ratio: 30,
  },
  {
    category: '用户转化',
    type: '转化',
    x: '注册',
    y: 6000,
    ratio: 50,
  },
  {
    category: '用户转化',
    type: '转化',
    x: '激活',
    y: 3000,
    ratio: 33,
  },
  {
    category: '用户转化',
    type: '转化',
    x: '付费',
    y: 1000,
    ratio: 0,
  },
];

const FunnelMinWidthDemo: React.FC = () => {
  const [minWidth, setMinWidth] = useState<number>(0.1);

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ marginBottom: 16 }}>漏斗图 - 最小宽度控制</h2>
      <p style={{ marginBottom: 16, color: '#666' }}>
        当数据跨度很大时（如 100000 → 1000），最底层会变得很窄难以交互。
        <br />
        使用 <code>bottomLayerMinWidth</code>{' '}
        可以保证底层最小宽度，便于鼠标悬停查看数据。
      </p>

      <div style={{ marginBottom: 24, maxWidth: 400 }}>
        <div style={{ marginBottom: 8 }}>
          最小宽度占比: <strong>{(minWidth * 100).toFixed(0)}%</strong>
        </div>
        <Slider
          min={0}
          max={0.5}
          step={0.05}
          value={minWidth}
          onChange={setMinWidth}
          marks={{
            0: '0%',
            0.15: '15%',
            0.3: '30%',
            0.5: '50%',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h3>不使用最小宽度限制</h3>
          <FunnelChart
            title="默认漏斗图"
            data={data}
            height="300px"
            bottomLayerMinWidth={0}
          />
          <p style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
            注意：最底层（付费）非常窄，难以交互
          </p>
        </div>

        <div>
          <h3>使用最小宽度限制</h3>
          <FunnelChart
            title="优化后的漏斗图"
            data={data}
            height="300px"
            bottomLayerMinWidth={minWidth}
          />
          <p style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
            最底层宽度至少为最大层的 {(minWidth * 100).toFixed(0)}%，易于交互
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: '#f5f5f5',
          borderRadius: 4,
        }}
      >
        <h4>说明：</h4>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li>
            左侧图表未使用最小宽度限制，底层（1000）相对顶层（100000）非常窄
          </li>
          <li>
            右侧图表使用了 <code>bottomLayerMinWidth</code>
            ，视觉宽度被调整以保证可交互性
          </li>
          <li>Tooltip 和标签仍然显示真实数据值（1000），不受视觉调整影响</li>
          <li>推荐值：0.1 ~ 0.2（10% ~ 20%）</li>
          <li>仅接受 0-1 之间的合法值，非法值（≤0 或 &gt;1）将被视为不限制</li>
        </ul>
      </div>
    </div>
  );
};

export default FunnelMinWidthDemo;
