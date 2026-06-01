import { AgenticLayout, ChatLayout } from '@ant-design/agentic-ui';
import { Badge, Button, Space, Tag } from 'antd';
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
        header 支持哪些自定义扩展？
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
        header 支持 title 自定义 ReactNode、分享按钮、以及 leftExtra /
        rightExtra 扩展插槽。
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
