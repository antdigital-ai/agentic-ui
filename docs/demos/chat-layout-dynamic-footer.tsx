import { ChatLayout, ChatLayoutRef } from '@ant-design/agentic-ui';
import { Button, Input, Tag } from 'antd';
import React, { useRef, useState } from 'react';

const { TextArea } = Input;

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
        消息 {i + 1} — 输入多行文本观察底部高度自动调整
      </div>
    ))}
  </div>
);

const DynamicFooterDemo = () => {
  const chatRef = useRef<ChatLayoutRef>(null);
  const [text, setText] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 动态高度 footer */}
      <div>
        <Tag color="blue" style={{ marginBottom: 8 }}>
          footer 高度随内容自适应 — 输入多行文本
        </Tag>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>
          ChatLayout 会自动检测 footer
          实际高度并调整内容区底部留白，无需手动同步 footerHeight。
        </p>
        <div style={{ height: 420 }}>
          <ChatLayout
            ref={chatRef}
            header={{ title: '动态底部高度' }}
            footer={
              <div
                style={{
                  padding: '8px 16px 12px',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-end',
                  background: '#fff',
                }}
              >
                <TextArea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="输入多行文本，观察底部高度变化..."
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  style={{ flex: 1 }}
                />
                <Button type="primary">发送</Button>
              </div>
            }
          >
            <MessageList count={10} />
          </ChatLayout>
        </div>
      </div>

      {/* 固定 footerHeight 对比 */}
      <div>
        <Tag color="orange" style={{ marginBottom: 8 }}>
          footerHeight 最小高度约束 — footer 实际高度大于 footerHeight
          时以实际为准
        </Tag>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>
          footerHeight=48（默认值），但 footer
          实际内容更高时，布局仍能正确适配。
        </p>
        <div style={{ height: 300 }}>
          <ChatLayout
            header={{ title: 'footerHeight 对比' }}
            footerHeight={48}
            footer={
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    background: '#f6ffed',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#52c41a',
                  }}
                >
                  提示：footerHeight 仅设置最小高度，实际高度由内容撑开
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input placeholder="输入框" style={{ flex: 1 }} />
                  <Button type="primary">发送</Button>
                </div>
              </div>
            }
          >
            <MessageList count={5} />
          </ChatLayout>
        </div>
      </div>
    </div>
  );
};

export default DynamicFooterDemo;
