import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Badge, Button, Space, Tag } from 'antd';
import React from 'react';

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
      {Array.from({ length: 4 }, (_, i) => (
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

const HeaderExtraDemo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    {/* title 支持 ReactNode */}
    <div>
      <Tag color="blue" style={{ marginBottom: 8 }}>
        title 支持 ReactNode
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
          style={{ height: '100%', minHeight: 0 }}
          center={<CenterContent />}
          header={{
            title: (
              <Space size={6}>
                <span>代码助手</span>
                <Tag color="success" style={{ margin: 0 }}>
                  Beta
                </Tag>
              </Space>
            ),
          }}
        />
      </div>
    </div>

    {/* showShare */}
    <div>
      <Tag color="purple" style={{ marginBottom: 8 }}>
        showShare + onShare
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
          style={{ height: '100%', minHeight: 0 }}
          center={<CenterContent />}
          header={{
            title: '智能助手',
            showShare: true,
            onShare: () => alert('分享链接已复制！'),
          }}
        />
      </div>
    </div>

    {/* leftExtra + rightExtra */}
    <div>
      <Tag color="green" style={{ marginBottom: 8 }}>
        leftExtra + rightExtra — 头部自定义扩展内容
      </Tag>
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
            title: '工作台',
            leftCollapsible: true,
            rightCollapsible: true,
            leftExtra: (
              <Badge count={5} size="small">
                <Button size="small" type="text">
                  通知
                </Button>
              </Badge>
            ),
            rightExtra: (
              <Space size={4}>
                <Button size="small">设置</Button>
                <Button size="small" type="primary">
                  新建
                </Button>
              </Space>
            ),
          }}
        />
      </div>
    </div>
  </div>
);

export default HeaderExtraDemo;