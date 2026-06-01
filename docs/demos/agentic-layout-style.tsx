import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Segmented, Tag } from 'antd';
import React, { useState } from 'react';

// 通过外部 style 控制根容器 minHeight，AgenticLayout 不再内置 minHeight prop。
// 这里演示如何借助 style.minHeight 实现等价能力。

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
        如何自定义 AgenticLayout 的样式？
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
        通过 style 和 className 属性自定义根容器样式，也可以覆盖默认的
        minHeight。
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
          <span
            style={{
              fontSize: 13,
              color: 'var(--ant-color-text-tertiary, #999)',
            }}
          >
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
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 13,
            color: 'var(--ant-color-text-tertiary, #888)',
          }}
        >
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
