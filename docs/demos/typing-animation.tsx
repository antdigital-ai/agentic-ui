import { TypingAnimation } from '@ant-design/agentic-ui';
import React from 'react';

export default () => (
  <div
    style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}
  >
    <section>
      <h4 style={{ margin: '0 0 8px' }}>基础 - 单条字符串</h4>
      <TypingAnimation style={{ fontSize: 20 }}>
        你好，我是你的 AI 助手 👋
      </TypingAnimation>
    </section>

    <section>
      <h4 style={{ margin: '0 0 8px' }}>多词循环（loop）</h4>
      <TypingAnimation
        style={{ fontSize: 20 }}
        words={['Agentic UI', '让智能体协作更直观', 'Build with Ant Design']}
        loop
        duration={80}
        deleteSpeed={40}
        pauseDelay={1200}
      />
    </section>

    <section>
      <h4 style={{ margin: '0 0 8px' }}>不同光标样式</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TypingAnimation cursorStyle="line" duration={60}>
          line cursor
        </TypingAnimation>
        <TypingAnimation cursorStyle="block" duration={60}>
          block cursor
        </TypingAnimation>
        <TypingAnimation cursorStyle="underscore" duration={60}>
          underscore cursor
        </TypingAnimation>
      </div>
    </section>
  </div>
);
