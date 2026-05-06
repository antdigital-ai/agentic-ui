import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Segmented, Tag } from 'antd';
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
  <ChatLayout header={{ title: '中间内容区' }}>
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

const SidebarDemo = () => {
  const [leftWidth, setLeftWidth] = useState(200);
  const [rightWidth, setRightWidth] = useState(240);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Tag color="blue">leftWidth</Tag>
        <Segmented
          options={[160, 200, 256, 320]}
          value={leftWidth}
          onChange={(v) => setLeftWidth(v as number)}
        />
        <span style={{ fontSize: 13, color: 'var(--ant-color-text-tertiary, #999)' }}>
          当前: {leftWidth}px
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Tag color="purple">rightWidth</Tag>
        <Segmented
          options={[200, 280, 360, 440]}
          value={rightWidth}
          onChange={(v) => setRightWidth(v as number)}
        />
        <span style={{ fontSize: 13, color: 'var(--ant-color-text-tertiary, #999)' }}>
          当前: {rightWidth}px
        </span>
      </div>
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
          leftWidth={leftWidth}
          rightWidth={rightWidth}
          left={<HistoryPanel />}
          center={<CenterContent />}
          right={<WorkspacePanel />}
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