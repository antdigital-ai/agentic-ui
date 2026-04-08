import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Badge, Button, Space, Tag } from 'antd';
import React from 'react';

const CenterContent = () => (
  <ChatLayout>
    <div style={{ padding: '24px 32px' }}>
      {Array.from({ length: 4 }, (_, i) => (
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

const HeaderExtraDemo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    {/* title 支持 ReactNode */}
    <div>
      <Tag color="blue" style={{ marginBottom: 8 }}>
        title 支持 ReactNode
      </Tag>
      <div
        style={{
          height: 300,
          background: 'var(--color-gray-bg-page, #f5f5f5)',
          padding: 6,
          borderRadius: 16,
        }}
      >
        <AgenticLayout
          style={{ height: '100%' }}
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
          height: 300,
          background: 'var(--color-gray-bg-page, #f5f5f5)',
          padding: 6,
          borderRadius: 16,
        }}
      >
        <AgenticLayout
          style={{ height: '100%' }}
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
          height: 340,
          background: 'var(--color-gray-bg-page, #f5f5f5)',
          padding: 6,
          borderRadius: 16,
        }}
      >
        <AgenticLayout
          style={{ height: '100%' }}
          left={<SidebarPanel label="历史记录" bg="#f6ffed" />}
          center={<CenterContent />}
          right={<SidebarPanel label="工作区" bg="#fff7e6" />}
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
