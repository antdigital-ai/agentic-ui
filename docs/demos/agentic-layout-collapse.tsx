import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Button, Space, Tag } from 'antd';
import React, { useState } from 'react';

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
      {Array.from({ length: 6 }, (_, i) => (
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

const CollapseDemo = () => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Space>
          <Tag color={leftCollapsed ? 'red' : 'green'}>
            leftCollapsed: {String(leftCollapsed)}
          </Tag>
          <Tag color={rightCollapsed ? 'red' : 'green'}>
            rightCollapsed: {String(rightCollapsed)}
          </Tag>
        </Space>
        <Space>
          <Button size="small" onClick={() => setLeftCollapsed((v) => !v)}>
            切换左侧
          </Button>
          <Button size="small" onClick={() => setRightCollapsed((v) => !v)}>
            切换右侧
          </Button>
          <Button
            size="small"
            onClick={() => {
              setLeftCollapsed(false);
              setRightCollapsed(false);
            }}
          >
            全部展开
          </Button>
        </Space>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--ant-color-text-tertiary, #888)' }}>
        点击头部折叠按钮或上方按钮切换折叠状态。状态由外部受控管理。
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
            title: '受控折叠',
            leftCollapsed,
            rightCollapsed,
            onLeftCollapse: (v) => {
              setLeftCollapsed(v);
              console.log('左侧折叠:', v);
            },
            onRightCollapse: (v) => {
              setRightCollapsed(v);
              console.log('右侧折叠:', v);
            },
          }}
        />
      </div>
    </div>
  );
};

export default CollapseDemo;