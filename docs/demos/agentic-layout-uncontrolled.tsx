import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import React from 'react';

const SidebarPanel = ({
  label,
  bg,
}: {
  label: string;
  bg: string;
}) => (
  <div
    style={{
      height: '100%',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      color: '#555',
      fontWeight: 500,
    }}
  >
    {label}
  </div>
);

const CenterContent = () => (
  <ChatLayout>
    <div style={{ padding: '24px 32px' }}>
      {Array.from({ length: 5 }, (_, i) => (
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
          消息 {i + 1}
        </div>
      ))}
    </div>
  </ChatLayout>
);

/**
 * 非受控模式：通过 leftDefaultCollapsed / rightDefaultCollapsed 指定初始值，
 * 折叠状态由组件内部维护，无需外部 state。
 */
const UncontrolledDemo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
      使用 <code>leftDefaultCollapsed</code> / <code>rightDefaultCollapsed</code>{' '}
      设置初始折叠状态，折叠行为由组件内部管理，无需外部 state。
    </p>
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
        left={<SidebarPanel label="历史记录（默认展开）" bg="#f6ffed" />}
        center={<CenterContent />}
        right={<SidebarPanel label="工作区（默认折叠）" bg="#fff7e6" />}
        header={{
          title: '非受控折叠',
          leftDefaultCollapsed: false,
          rightDefaultCollapsed: true,
          onLeftCollapse: (v) => console.log('左侧折叠状态:', v),
          onRightCollapse: (v) => console.log('右侧折叠状态:', v),
        }}
      />
    </div>
  </div>
);

export default UncontrolledDemo;
