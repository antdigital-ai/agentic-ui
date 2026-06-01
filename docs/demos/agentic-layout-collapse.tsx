import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Button, Space, Tag } from 'antd';
import React, { useState } from 'react';

const HistoryPanel = () => (
  <div
    style={{
      padding: '8px 0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'auto',
    }}
  >
    <div
      style={{
        padding: '0 12px 8px',
        fontSize: 12,
        color: 'var(--ant-color-text-tertiary, rgba(0,0,0,45))',
      }}
    >
      今天
    </div>
    {['组件集成方案', '布局使用指南'].map((text, i) => (
      <div
        key={i}
        style={{
          padding: '8px 12px',
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
          borderInlineStart:
            i === 0
              ? '2px solid var(--ant-color-primary, #1677ff)'
              : '2px solid transparent',
        }}
      >
        {text}
      </div>
    ))}
    <div
      style={{
        padding: '12px 12px 8px',
        fontSize: 12,
        color: 'var(--ant-color-text-tertiary, rgba(0,0,0,45))',
      }}
    >
      昨天
    </div>
    {['样式定制问题', '拖拽调整宽度', '折叠状态管理'].map((text) => (
      <div
        key={text}
        style={{
          padding: '8px 12px',
          fontSize: 13,
          cursor: 'pointer',
          color: 'var(--ant-color-text-secondary, rgba(0,0,0,65))',
          borderInlineStart: '2px solid transparent',
        }}
      >
        {text}
      </div>
    ))}
  </div>
);

const CenterContent = () => (
  <ChatLayout>
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
        你好！我是 AI 助手，可以帮你解答问题、分析数据、生成代码。
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
        请介绍 AgenticLayout 的折叠功能。
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
        左右侧栏均支持折叠，可通过 header 配置受控或非受控模式。受控模式下由外部
        state 管理折叠状态，非受控模式下组件内部自动维护。
      </div>
    </div>
  </ChatLayout>
);

const WorkspacePanel = () => (
  <div
    style={{
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      height: '100%',
      overflow: 'auto',
    }}
  >
    <div
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--ant-color-text, rgba(0,0,0,88))',
        marginBottom: 2,
      }}
    >
      工作区
    </div>
    {[
      {
        label: '实时跟随',
        desc: '正在分析项目结构…',
        status: 'active' as const,
      },
      { label: '任务列表', desc: '已完成 2/5 项', status: 'default' as const },
      { label: '文件管理', desc: '6 个文件', status: 'default' as const },
    ].map((item, i) => (
      <div
        key={i}
        style={{
          padding: '10px 12px',
          borderRadius: 8,
          background: 'var(--ant-color-bg-text-hover, rgba(0,0,0,0.04))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: 'var(--ant-color-text, rgba(0,0,0,88))',
              fontWeight: 500,
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'var(--ant-color-text-tertiary, rgba(0,0,0,45))',
            }}
          >
            {item.desc}
          </span>
        </div>
        <Tag
          color={item.status === 'active' ? 'processing' : 'default'}
          style={{ margin: 0, fontSize: 11, flexShrink: 0 }}
        >
          {item.status === 'active' ? '运行中' : '就绪'}
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
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: 'var(--ant-color-text-tertiary, #888)',
        }}
      >
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
