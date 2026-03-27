import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import React from 'react';

const CenterContent = () => (
  <ChatLayout header={{ title: 'AI 助手' }}>
    <div style={{ padding: '24px 32px' }}>
      {['你好！我是 AI 助手。', '有什么可以帮您？', '请随时告诉我您的需求。'].map(
        (text, i) => (
          <div
            key={i}
            style={{
              padding: '10px 14px',
              marginBottom: 8,
              background: i % 2 === 0 ? '#f0f5ff' : '#fff7e6',
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {text}
          </div>
        ),
      )}
    </div>
  </ChatLayout>
);

const BasicDemo = () => (
  <div
    style={{
      height: 420,
      background: 'var(--color-gray-bg-page, #f5f5f5)',
      padding: 6,
      borderRadius: 16,
    }}
  >
    <AgenticLayout
      style={{ height: '100%' }}
      center={<CenterContent />}
    />
  </div>
);

export default BasicDemo;
