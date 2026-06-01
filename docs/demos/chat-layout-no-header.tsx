import { ChatLayout, ChatLayoutRef } from '@ant-design/agentic-ui';
import { Button, Tag } from 'antd';
import React, { useRef, useState } from 'react';

const MessageList = ({ count }: { count: number }) => (
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
        消息 {i + 1} — 无头部模式下，内容区占据全部可用高度
      </div>
    ))}
  </div>
);

const NoHeaderDemo = () => {
  const chatRef = useRef<ChatLayoutRef>(null);
  const [msgCount, setMsgCount] = useState(5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. 纯净无头部 + 无底部 */}
      <div>
        <Tag color="blue" style={{ marginBottom: 8 }}>
          不传 header 和 footer — 纯净内容区
        </Tag>
        <div style={{ height: 280 }}>
          <ChatLayout>
            <MessageList count={8} />
          </ChatLayout>
        </div>
      </div>

      {/* 2. 无头部 + 有底部 */}
      <div>
        <Tag color="purple" style={{ marginBottom: 8 }}>
          不传 header + 有 footer — 底部操作栏
        </Tag>
        <div style={{ height: 320 }}>
          <ChatLayout
            ref={chatRef}
            footer={
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'center',
                }}
              >
                <Button onClick={() => setMsgCount((c) => c + 3)}>
                  加载更多 ({msgCount})
                </Button>
                <Button
                  type="primary"
                  onClick={() => chatRef.current?.scrollToBottom()}
                >
                  回到底部
                </Button>
              </div>
            }
          >
            <MessageList count={msgCount} />
          </ChatLayout>
        </div>
      </div>

      {/* 3. 无头部 + 自定义样式 */}
      <div>
        <Tag color="green" style={{ marginBottom: 8 }}>
          不传 header + 自定义 styles — 嵌入式面板
        </Tag>
        <div style={{ height: 260 }}>
          <ChatLayout
            styles={{
              root: { borderRadius: 12, border: '1px solid #e8e8e8' },
              content: { background: '#fafafa' },
            }}
            footer={
              <div
                style={{
                  padding: '10px 16px',
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#999',
                }}
              >
                嵌入式面板底部
              </div>
            }
          >
            <MessageList count={4} />
          </ChatLayout>
        </div>
      </div>
    </div>
  );
};

export default NoHeaderDemo;
