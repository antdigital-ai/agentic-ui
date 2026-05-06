import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Segmented, Tag } from 'antd';
import React, { useState } from 'react';

// 通过外部 style 控制根容器 minHeight，AgenticLayout 不再内置 minHeight prop。
// 这里演示如何借助 style.minHeight 实现等价能力。

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

const StyleDemo = () => {
  const [minHeight, setMinHeight] = useState<string | number>(300);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* minHeight */}
      <div>
        <Tag color="blue" style={{ marginBottom: 8 }}>
          minHeight — 组件最小高度
        </Tag>
        <div
          style={{
            marginBottom: 8,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Segmented
            options={[200, 300, 400, 500]}
            value={minHeight}
            onChange={(v) => setMinHeight(v as number)}
          />
          <span style={{ fontSize: 13, color: 'var(--ant-color-text-tertiary, #999)' }}>
            当前: {minHeight}px
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
            style={{ height: '100%', minHeight }}
            left={<HistoryPanel />}
            center={<CenterContent />}
            right={<WorkspacePanel />}
            header={{
              title: 'minHeight 演示',
              leftCollapsible: true,
              rightCollapsible: true,
            }}
          />
        </div>
      </div>

      {/* className / style */}
      <div>
        <Tag color="purple" style={{ marginBottom: 8 }}>
          className + style — 根容器样式
        </Tag>
        <div
          style={{
            height: 360,
            background: 'var(--ant-color-bg-layout, #f5f5f5)',
            padding: 6,
            borderRadius: 16,
          }}
        >
          <AgenticLayout
            style={{
              height: '100%',
              minHeight: 0,
              border: '2px dashed var(--ant-color-primary, #1677ff)',
              borderRadius: 12,
            }}
            center={<CenterContent />}
            header={{ title: '自定义根容器样式' }}
          />
        </div>
      </div>

      {/* 右侧栏拖拽调整宽度 */}
      <div>
        <Tag color="green" style={{ marginBottom: 8 }}>
          右侧栏可拖拽调整宽度（拖动分割线）
        </Tag>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ant-color-text-tertiary, #888)' }}>
          右侧栏左边缘有拖拽手柄，鼠标悬停时高亮，拖动可调整宽度（最小
          400px，最大窗口的 70%）。
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
            rightWidth={280}
            left={<HistoryPanel />}
            center={<CenterContent />}
            right={<WorkspacePanel />}
            header={{
              title: '拖拽调整右侧宽度',
              leftCollapsible: true,
              rightCollapsible: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StyleDemo;