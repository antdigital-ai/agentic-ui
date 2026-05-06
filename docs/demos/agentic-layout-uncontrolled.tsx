import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Tag } from 'antd';
import React from 'react';

const HistoryPanel = () => (
  <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
    {['对话记录 A', '对话记录 B', '对话记录 C', '对话记录 D'].map((text, i) => (
      <div
        key={i}
        style={{
          padding: '8px 10px',
          borderRadius: 6,
          fontSize: 13,
          cursor: 'pointer',
          background:
            i === 0
              ? 'var(--ant-color-bg-text-hover, rgba(0,0,0,0.04))'
              : 'transparent',
          color:
            i === 0
              ? 'var(--ant-color-text, rgba(0,0,0,88))'
              : 'var(--ant-color-text-secondary, rgba(0,0,0,65))',
          fontWeight: i === 0 ? 500 : 400,
        }}
      >
        {text}
      </div>
    ))}
  </div>
);

const CenterContent = () => (
  <ChatLayout>
    <div style={{ padding: '16px 24px' }}>
      {Array.from({ length: 5 }, (_, i) => (
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
          消息 {i + 1}
        </div>
      ))}
    </div>
  </ChatLayout>
);

const WorkspacePanel = () => (
  <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
    {[
      { label: '实时跟随', status: '运行中' },
      { label: '任务列表', status: '3/5' },
      { label: '文件管理', status: '6 个文件' },
    ].map((item, i) => (
      <div
        key={i}
        style={{
          padding: '10px 12px',
          borderRadius: 6,
          background: 'var(--ant-color-bg-text-hover, rgba(0,0,0,0.04))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
        }}
      >
        <span style={{ color: 'var(--ant-color-text, rgba(0,0,0,88))' }}>
          {item.label}
        </span>
        <Tag
          color={i === 0 ? 'processing' : 'default'}
          style={{ margin: 0, fontSize: 11 }}
        >
          {item.status}
        </Tag>
      </div>
    ))}
  </div>
);

/**
 * 非受控模式：通过 leftDefaultCollapsed / rightDefaultCollapsed 指定初始值，
 * 折叠状态由组件内部维护，无需外部 state。
 */
const UncontrolledDemo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <p style={{ margin: 0, fontSize: 13, color: 'var(--ant-color-text-tertiary, #888)' }}>
      使用 <code>leftDefaultCollapsed</code> /{' '}
      <code>rightDefaultCollapsed</code>{' '}
      设置初始折叠状态，折叠行为由组件内部管理，无需外部 state。
    </p>
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
        left={<HistoryPanel />}
        center={<CenterContent />}
        right={<WorkspacePanel />}
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