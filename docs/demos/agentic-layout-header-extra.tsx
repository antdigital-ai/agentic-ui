import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Badge, Button, Space, Tag } from 'antd';
import React from 'react';

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

const SidebarPanel = ({ label }: { label: string }) => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      color: 'var(--ant-color-text-secondary, #555)',
    }}
  >
    {label}
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
          left={<SidebarPanel label="历史记录" />}
          center={<CenterContent />}
          right={<SidebarPanel label="工作区" />}
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