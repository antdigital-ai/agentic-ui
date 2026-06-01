import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Segmented, Tag } from 'antd';
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
  <ChatLayout header={{ title: '中间内容区' }}>
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
        请介绍 AgenticLayout 的三栏布局用法。
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
        AgenticLayout
        提供左中右三栏布局，左侧放会话历史，中间放对话区，右侧放工作区。左右侧栏均可折叠，右侧栏支持拖拽调整宽度。
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

const SidebarDemo = () => {
  const [leftWidth, setLeftWidth] = useState(200);
  const [rightWidth, setRightWidth] = useState(320);

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
        <span
          style={{
            fontSize: 13,
            color: 'var(--ant-color-text-tertiary, #999)',
          }}
        >
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
          options={[240, 320, 400, 480]}
          value={rightWidth}
          onChange={(v) => setRightWidth(v as number)}
        />
        <span
          style={{
            fontSize: 13,
            color: 'var(--ant-color-text-tertiary, #999)',
          }}
        >
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
