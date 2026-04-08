import { ChartStatistic } from '@ant-design/agentic-ui';
import React from 'react';

const ChartStatisticDarkDemo: React.FC = () => (
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
      ；页面底色与图表暗黑 demo 一致（#141414），指标卡置于 #1f1f1f 内容区
    </p>
    <div
      style={{
        background: '#1f1f1f',
        padding: 16,
        borderRadius: 8,
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      <ChartStatistic title="暗色主题" value={3456} suffix="次" theme="dark" />
      <ChartStatistic
        title="带提示信息"
        value={789}
        suffix="台"
        theme="dark"
        tooltip="这是提示信息"
      />
    </div>
  </div>
);

export default ChartStatisticDarkDemo;
