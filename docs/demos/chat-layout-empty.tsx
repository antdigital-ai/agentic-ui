import {
  BubbleList,
  ChatLayout,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button, Input, Tag } from 'antd';
import React, { useState } from 'react';

const assistantAvatar =
  'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original';
const userAvatar =
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';

const SUGGESTIONS = [
  '帮我写一段 React 组件代码',
  '解释一下 TypeScript 泛型',
  '如何优化前端性能？',
  '对比 React 和 Vue 的区别',
];

const EmptyStateDemo = () => {
  const [messages, setMessages] = useState<MessageBubbleData[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = (text?: string) => {
    const content = text || inputValue.trim();
    if (!content) return;

    const userMsg: MessageBubbleData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createAt: Date.now(),
      updateAt: Date.now(),
      isFinished: true,
      meta: { avatar: userAvatar, title: '用户' },
      fileMap: new Map(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    setTimeout(() => {
      const assistantMsg: MessageBubbleData = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `收到你的问题："${content}"，让我来为你解答。这是一个模拟的 AI 回复，实际场景中可对接真实的对话接口。`,
        createAt: Date.now(),
        updateAt: Date.now(),
        isFinished: true,
        meta: { avatar: assistantAvatar, title: 'AI 助手' },
        fileMap: new Map(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 600);
  };

  const handleReset = () => {
    setMessages([]);
    setInputValue('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 空状态 + 快捷提问 */}
      <div>
        <Tag color="blue" style={{ marginBottom: 8 }}>
          空状态 — 新对话欢迎页
        </Tag>
        <div style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
          <ChatLayout
            header={{
              title: 'AI 助手',
              showShare: true,
              onShare: () => console.log('分享'),
            }}
            footer={
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <Input
                  placeholder="输入你的问题..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={() => handleSend()}
                  style={{ flex: 1 }}
                />
                <Button type="primary" onClick={() => handleSend()}>
                  发送
                </Button>
                {messages.length > 0 && (
                  <Button onClick={handleReset}>重置对话</Button>
                )}
              </div>
            }
          >
            {messages.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: 32,
                  color: '#999',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: '#f0f5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginBottom: 16,
                  }}
                >
                  💬
                </div>
                <h3
                  style={{
                    margin: '0 0 8px',
                    fontSize: 16,
                    color: '#333',
                    fontWeight: 500,
                  }}
                >
                  开始新对话
                </h3>
                <p
                  style={{
                    margin: '0 0 20px',
                    fontSize: 14,
                    color: '#999',
                    textAlign: 'center',
                  }}
                >
                  你可以输入任何问题，或点击下方快捷提问
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    justifyContent: 'center',
                    maxWidth: 480,
                  }}
                >
                  {SUGGESTIONS.map((s) => (
                    <Button
                      key={s}
                      size="small"
                      onClick={() => handleSend(s)}
                      style={{ borderRadius: 16 }}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <BubbleList
                pure
                bubbleList={messages}
                assistantMeta={{ avatar: assistantAvatar, title: 'AI 助手' }}
                userMeta={{ avatar: userAvatar, title: '用户' }}
                onLike={() => {}}
                onDisLike={() => {}}
              />
            )}
          </ChatLayout>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateDemo;
