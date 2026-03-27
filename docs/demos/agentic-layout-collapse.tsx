import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Button, Space, Tag } from 'antd';
import React, { useState } from 'react';

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
      {Array.from({ length: 6 }, (_, i) => (
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

const CollapseDemo = () => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
      <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
        点击头部折叠按钮或上方按钮切换折叠状态。状态由外部受控管理。
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
          left={<SidebarPanel label="历史记录" bg="#f6ffed" />}
          center={<CenterContent />}
          right={<SidebarPanel label="工作区" bg="#fff7e6" />}
          header={{
            title: '受控折叠',
            leftCollapsed: leftCollapsed,
            rightCollapsed: rightCollapsed,
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
