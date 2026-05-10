import { GradientText } from '@ant-design/agentic-ui';
import React from 'react';

export default () => (
  <div
    style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}
  >
    <h3 style={{ margin: 0 }}>默认渐变</h3>
    <GradientText style={{ fontSize: 32, fontWeight: 600 }}>
      Agentic UI · 让智能体协作更直观
    </GradientText>

    <h3 style={{ margin: 0 }}>自定义渐变色</h3>
    <GradientText
      style={{ fontSize: 28, fontWeight: 600 }}
      colors={['#ff6b6b', '#feca57', '#48dbfb', '#ff6b6b']}
      animationSpeed={4}
    >
      Customize Your Gradient
    </GradientText>

    <h3 style={{ margin: 0 }}>静态（动画速度极慢）</h3>
    <GradientText
      style={{ fontSize: 24 }}
      colors={['#1677ff', '#722ed1']}
      animationSpeed={9999}
    >
      静态展示也可以
    </GradientText>
  </div>
);
