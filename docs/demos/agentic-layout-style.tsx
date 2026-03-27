import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Segmented, Tag } from 'antd';
import React, { useState } from 'react';

const SidebarPanel = ({ label, bg }: { label: string; bg: string }) => (
  <div
    style={{
      height: '100%',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      color: '#555',
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

const StyleDemo = () => {
  const [minHeight, setMinHeight] = useState<string | number>(400);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* minHeight */}
      <div>
        <Tag color="blue" style={{ marginBottom: 8 }}>
          minHeight — 组件最小高度
        </Tag>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Segmented
            options={[300, 400, 500, '100%']}
            value={minHeight}
            onChange={(v) => setMinHeight(v as string | number)}
          />
          <span style={{ fontSize: 13, color: '#999' }}>当前: {minHeight}</span>
        </div>
        <div
          style={{
            background: 'var(--color-gray-bg-page, #f5f5f5)',
            padding: 6,
            borderRadius: 16,
          }}
        >
          <AgenticLayout
            minHeight={minHeight}
            left={<SidebarPanel label="左侧" bg="#f6ffed" />}
            center={<CenterContent />}
            right={<SidebarPanel label="右侧" bg="#fff7e6" />}
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
            background: 'var(--color-gray-bg-page, #f5f5f5)',
            padding: 6,
            borderRadius: 16,
          }}
        >
          <AgenticLayout
            style={{
              height: 300,
              border: '2px dashed #1677ff',
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
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#888' }}>
          右侧栏左边缘有拖拽手柄，鼠标悬停时高亮，拖动可调整宽度（最小 400px，最大窗口的 70%）。
        </p>
        <div
          style={{
            height: 340,
            background: 'var(--color-gray-bg-page, #f5f5f5)',
            padding: 6,
            borderRadius: 16,
          }}
        >
          <AgenticLayout
            style={{ height: '100%' }}
            rightWidth={280}
            left={<SidebarPanel label="历史记录" bg="#f6ffed" />}
            center={<CenterContent />}
            right={<SidebarPanel label="工作区（可拖拽调整宽度）" bg="#fff7e6" />}
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
