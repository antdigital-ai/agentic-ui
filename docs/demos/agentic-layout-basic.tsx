import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import React from 'react';

const CenterContent = () => (
  <ChatLayout header={{ title: 'AI 助手' }}>
    <div style={{ padding: '16px 24px' }}>
      {[
        '你好！我是 AI 助手。',
        '有什么可以帮您？',
        '请随时告诉我您的需求。',
      ].map((text, i) => (
        <div
          key={i}
          style={{
            padding: '8px 12px',
            marginBottom: 8,
            background:
              i % 2 === 0
                ? 'var(--ant-color-bg-text-hover, #f5f5f5)'
                : 'transparent',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {text}
        </div>
      ))}
    </div>
  </ChatLayout>
);

const BasicDemo = () => (
  <div
    style={{
      height: 480,
      background: 'var(--ant-color-bg-layout, #f5f5f5)',
      padding: 6,
      borderRadius: 16,
    }}
  >
    <AgenticLayout
      style={{ height: '100%', minHeight: 0 }}
      center={<CenterContent />}
    />
  </div>
);

export default BasicDemo;