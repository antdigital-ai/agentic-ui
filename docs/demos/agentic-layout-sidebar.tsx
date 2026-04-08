import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Segmented, Tag } from 'antd';
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
  <ChatLayout header={{ title: '中间内容区' }}>
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

const SidebarDemo = () => {
  const [leftWidth, setLeftWidth] = useState(200);
  const [rightWidth, setRightWidth] = useState(240);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13 }}>
          <Tag color="blue">leftWidth</Tag>
        </span>
        <Segmented
          options={[160, 200, 256, 320]}
          value={leftWidth}
          onChange={(v) => setLeftWidth(v as number)}
        />
        <span style={{ fontSize: 13, color: '#999' }}>当前: {leftWidth}px</span>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13 }}>
          <Tag color="purple">rightWidth</Tag>
        </span>
        <Segmented
          options={[200, 280, 360, 440]}
          value={rightWidth}
          onChange={(v) => setRightWidth(v as number)}
        />
        <span style={{ fontSize: 13, color: '#999' }}>当前: {rightWidth}px</span>
      </div>

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
          leftWidth={leftWidth}
          rightWidth={rightWidth}
          left={<SidebarPanel label="左侧边栏 (History / 导航)" bg="#f6ffed" />}
          center={<CenterContent />}
          right={<SidebarPanel label="右侧边栏 (Workspace / 详情)" bg="#fff7e6" />}
          header={{
            title: '三栏布局',
            leftCollapsible: true,
            rightCollapsible: true,
          }}
        />
      </div>
    </div>
  );
};

export default SidebarDemo;
