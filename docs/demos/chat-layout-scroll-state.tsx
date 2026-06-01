import {
  BubbleList,
  ChatLayout,
  ChatLayoutRef,
  ChatLayoutScrollState,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button } from 'antd';
import React, { useRef, useState } from 'react';

const assistantAvatar =
  'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original';
const userAvatar =
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';

const INITIAL_MESSAGES: MessageBubbleData[] = Array.from(
  { length: 15 },
  (_, i) => ({
    id: `msg-${i}`,
    role: i % 2 === 0 ? 'assistant' : 'user',
    content:
      i % 2 === 0
        ? `这是第 ${i + 1} 条助手消息。向上滚动后观察右下角"回到底部"按钮的出现与消失。`
        : `这是第 ${i + 1} 条用户消息。`,
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    meta: {
      avatar: i % 2 === 0 ? assistantAvatar : userAvatar,
      title: i % 2 === 0 ? 'AI 助手' : '用户',
    },
    fileMap: new Map(),
  }),
);

const ScrollStateDemo = () => {
  const chatRef = useRef<ChatLayoutRef>(null);
  const [scrollState, setScrollState] = useState<ChatLayoutScrollState>({
    isAtBottom: true,
    isPinned: true,
  });
  const [messages, setMessages] =
    useState<MessageBubbleData[]>(INITIAL_MESSAGES);

  const handleAddMessage = () => {
    const isAssistant = messages.length % 2 === 0;
    const newMessage: MessageBubbleData = {
      id: `msg-${Date.now()}`,
      role: isAssistant ? 'assistant' : 'user',
      content: isAssistant
        ? '新增的助手消息。如果你停留在底部，内容会自动跟随滚动。'
        : '新增的用户消息。',
      createAt: Date.now(),
      updateAt: Date.now(),
      isFinished: true,
      meta: {
        avatar: isAssistant ? assistantAvatar : userAvatar,
        title: isAssistant ? 'AI 助手' : '用户',
      },
      fileMap: new Map(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div
      style={{
        height: 520,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <ChatLayout
        ref={chatRef}
        header={{ title: '滚动状态监听' }}
        onScrollStateChange={setScrollState}
        footer={
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            <Button type="primary" onClick={handleAddMessage}>
              添加消息
            </Button>
          </div>
        }
      >
        <BubbleList
          pure
          bubbleList={messages}
          assistantMeta={{ avatar: assistantAvatar, title: 'AI 助手' }}
          userMeta={{ avatar: userAvatar, title: '用户' }}
          onLike={() => {}}
          onDisLike={() => {}}
        />
      </ChatLayout>

      {!scrollState.isPinned && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          onClick={() => chatRef.current?.scrollToBottom('smooth')}
          title="回到底部"
          style={{
            position: 'absolute',
            right: 24,
            bottom: 80,
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          ↓
        </Button>
      )}

      <div
        style={{
          marginTop: 12,
          padding: '8px 12px',
          background: '#fafafa',
          borderRadius: 8,
          fontSize: 13,
          color: '#666',
          display: 'flex',
          gap: 24,
        }}
      >
        <span>
          isAtBottom:{' '}
          <strong
            style={{ color: scrollState.isAtBottom ? '#52c41a' : '#ff4d4f' }}
          >
            {String(scrollState.isAtBottom)}
          </strong>
        </span>
        <span>
          isPinned:{' '}
          <strong
            style={{ color: scrollState.isPinned ? '#52c41a' : '#ff4d4f' }}
          >
            {String(scrollState.isPinned)}
          </strong>
        </span>
      </div>
    </div>
  );
};

export default ScrollStateDemo;
