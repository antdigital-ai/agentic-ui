import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import React from 'react';

const CenterContent = () => (
  <ChatLayout header={{ title: 'AI 助手' }}>
    <div
      style={{
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--ant-color-bg-text-hover, rgba(0,0,0,0.04))',
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        你好！我是 AI 助手，可以帮你解答问题、分析数据、生成代码等。
      </div>
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.6,
          textAlign: 'end',
        }}
      >
        请帮我介绍一下 AgenticLayout 组件的用法。
      </div>
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--ant-color-bg-text-hover, rgba(0,0,0,0.04))',
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        AgenticLayout 提供左中右三栏布局，支持侧栏折叠和右侧栏拖拽调整宽度。
      </div>
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
