import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Tag } from 'antd';
import React from 'react';

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
        非受控折叠模式下，折叠状态如何管理？
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
        使用 leftDefaultCollapsed / rightDefaultCollapsed
        设置初始值，后续状态由组件内部维护，无需外部 state。
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

/**
 * 非受控模式：通过 leftDefaultCollapsed / rightDefaultCollapsed 指定初始值，
 * 折叠状态由组件内部维护，无需外部 state。
 */
const UncontrolledDemo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <p
      style={{
        margin: 0,
        fontSize: 13,
        color: 'var(--ant-color-text-tertiary, #888)',
      }}
    >
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
