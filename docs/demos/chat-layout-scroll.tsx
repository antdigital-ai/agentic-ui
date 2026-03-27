import { ChatLayout, ChatLayoutRef } from '@ant-design/agentic-ui';
import { Button, Segmented, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';

const LONG_MESSAGE_COUNT = 20;

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
        第 {i + 1} 条消息 — 用于演示滚动行为
      </div>
    ))}
  </div>
);

const ScrollApiDemo = () => {
  const chatRef = useRef<ChatLayoutRef>(null);
  const [scrollBehavior, setScrollBehavior] = useState<'smooth' | 'auto'>('smooth');

  const handleScrollToBottom = () => {
    chatRef.current?.scrollToBottom();
    console.log('scrollContainer:', chatRef.current?.scrollContainer);
  };

  const handleScrollToTop = () => {
    chatRef.current?.scrollContainer?.scrollTo({ top: 0, behavior: scrollBehavior });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* scrollBehavior + ref.scrollToBottom */}
      <div>
        <Tag color="blue" style={{ marginBottom: 8 }}>
          scrollBehavior + ChatLayoutRef.scrollToBottom
        </Tag>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#666' }}>scrollBehavior:</span>
          <Segmented
            options={['smooth', 'auto']}
            value={scrollBehavior}
            onChange={(v) => setScrollBehavior(v as 'smooth' | 'auto')}
          />
        </div>
        <div style={{ height: 380 }}>
          <ChatLayout
            ref={chatRef}
            header={{ title: '滚动行为演示' }}
            scrollBehavior={scrollBehavior}
            footer={
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'center' }}>
                <Space>
                  <Button onClick={handleScrollToTop}>滚动到顶部</Button>
                  <Button type="primary" onClick={handleScrollToBottom}>
                    scrollToBottom()
                  </Button>
                </Space>
              </div>
            }
          >
            <MessageList count={LONG_MESSAGE_COUNT} />
          </ChatLayout>
        </div>
      </div>

      {/* ref.scrollContainer */}
      <div>
        <Tag color="purple" style={{ marginBottom: 8 }}>
          ChatLayoutRef.scrollContainer — 访问滚动容器 DOM
        </Tag>
        <div style={{ height: 320 }}>
          <ChatLayout
            ref={chatRef}
            header={{ title: '访问 scrollContainer' }}
            footer={
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'center' }}>
                <Button
                  onClick={() => {
                    const el = chatRef.current?.scrollContainer;
                    if (el) {
                      console.log('scrollTop:', el.scrollTop, 'scrollHeight:', el.scrollHeight);
                      alert(
                        `scrollTop: ${el.scrollTop}\nscrollHeight: ${el.scrollHeight}\nclientHeight: ${el.clientHeight}`,
                      );
                    }
                  }}
                >
                  打印 scrollContainer 信息
                </Button>
              </div>
            }
          >
            <MessageList count={10} />
          </ChatLayout>
        </div>
      </div>
    </div>
  );
};

export default ScrollApiDemo;
