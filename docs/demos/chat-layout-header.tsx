import { ChatLayout } from '@ant-design/agentic-ui';
import { Badge, Button, Space, Tag } from 'antd';
import React, { useState } from 'react';

const MessageList = ({
  prefix,
  count,
}: {
  prefix: string;
  count: number;
}) => (
  <div style={{ padding: 16 }}>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        style={{
          padding: '10px 14px',
          marginBottom: 8,
          background: i % 2 === 0 ? '#f0f5ff' : '#fff7e6',
          borderRadius: 8,
          fontSize: 14,
          color: '#333',
        }}
      >
        {prefix} 消息 {i + 1}
      </div>
    ))}
  </div>
);

const HeaderApiDemo = () => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. 基础标题 + 分享 */}
      <div>
        <Tag color="blue" style={{ marginBottom: 8 }}>
          title + showShare + onShare
        </Tag>
        <div style={{ height: 200 }}>
          <ChatLayout
            header={{
              title: '项目助手',
              showShare: true,
              onShare: () => alert('分享链接已复制！'),
            }}
          >
            <MessageList prefix="标题与分享按钮" count={3} />
          </ChatLayout>
        </div>
      </div>

      {/* 2. 自定义左右额外内容 */}
      <div>
        <Tag color="purple" style={{ marginBottom: 8 }}>
          leftExtra + rightExtra
        </Tag>
        <div style={{ height: 200 }}>
          <ChatLayout
            header={{
              title: '工作台',
              leftExtra: (
                <Badge count={3} size="small">
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
          >
            <MessageList prefix="自定义额外内容" count={3} />
          </ChatLayout>
        </div>
      </div>

      {/* 3. 左侧折叠（受控） */}
      <div>
        <Tag color="green" style={{ marginBottom: 8 }}>
          leftCollapsible + leftCollapsed（受控）
        </Tag>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>
          leftCollapsed: <strong>{String(leftCollapsed)}</strong>
        </p>
        <div style={{ height: 200 }}>
          <ChatLayout
            header={{
              title: 'AI 对话',
              leftCollapsible: true,
              leftCollapsed: leftCollapsed,
              onLeftCollapse: (collapsed) => {
                setLeftCollapsed(collapsed);
                console.log('左侧折叠状态变更:', collapsed);
              },
            }}
          >
            <MessageList prefix="左侧折叠受控" count={3} />
          </ChatLayout>
        </div>
      </div>

      {/* 4. 右侧折叠（受控） */}
      <div>
        <Tag color="orange" style={{ marginBottom: 8 }}>
          rightCollapsible + rightCollapsed（受控）
        </Tag>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>
          rightCollapsed: <strong>{String(rightCollapsed)}</strong>
        </p>
        <div style={{ height: 200 }}>
          <ChatLayout
            header={{
              title: 'AI 对话',
              rightCollapsible: true,
              rightCollapsed: rightCollapsed,
              onRightCollapse: (collapsed) => {
                setRightCollapsed(collapsed);
                console.log('右侧折叠状态变更:', collapsed);
              },
            }}
          >
            <MessageList prefix="右侧折叠受控" count={3} />
          </ChatLayout>
        </div>
      </div>

      {/* 5. 非受控默认折叠 */}
      <div>
        <Tag color="cyan" style={{ marginBottom: 8 }}>
          leftDefaultCollapsed + rightDefaultCollapsed（非受控）
        </Tag>
        <div style={{ height: 200 }}>
          <ChatLayout
            header={{
              title: '默认折叠',
              leftCollapsible: true,
              rightCollapsible: true,
              leftDefaultCollapsed: true,
              rightDefaultCollapsed: false,
              onLeftCollapse: (c) => console.log('左侧折叠:', c),
              onRightCollapse: (c) => console.log('右侧折叠:', c),
            }}
          >
            <MessageList prefix="非受控模式" count={3} />
          </ChatLayout>
        </div>
      </div>

      {/* 6. 自定义标题节点 */}
      <div>
        <Tag color="magenta" style={{ marginBottom: 8 }}>
          title 支持 ReactNode
        </Tag>
        <div style={{ height: 200 }}>
          <ChatLayout
            header={{
              title: (
                <Space size={6}>
                  <span>代码助手</span>
                  <Tag color="success" style={{ margin: 0 }}>
                    Beta
                  </Tag>
                </Space>
              ),
              showShare: true,
              onShare: () => console.log('分享'),
            }}
          >
            <MessageList prefix="自定义标题节点" count={3} />
          </ChatLayout>
        </div>
      </div>
    </div>
  );
};

export default HeaderApiDemo;
