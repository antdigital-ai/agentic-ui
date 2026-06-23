import {
  BubbleList,
  ChatLayout,
  ChatLayoutRef,
  ChatLayoutScrollState,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button } from 'antd';
import React, { useRef, useState } from 'react';
import {
  assistantMeta,
  createMockMessage,
  INITIAL_MESSAGES,
  userMeta,
} from './data';

const SEED_COUNT = 14;

const ScrollStateDemo: React.FC = () => {
  const chatRef = useRef<ChatLayoutRef>(null);
  const [scrollState, setScrollState] = useState<ChatLayoutScrollState>({
    isAtBottom: true,
    isPinned: true,
  });
  const [bubbleList, setBubbleList] = useState<MessageBubbleData[]>(() => {
    const messages: MessageBubbleData[] = [];
    for (let i = 0; i < SEED_COUNT; i++) {
      const role = i % 2 === 0 ? 'assistant' : 'user';
      const base =
        i === 0
          ? INITIAL_MESSAGES.assistant
          : i === 1
            ? INITIAL_MESSAGES.user
            : role === 'assistant'
              ? `助手消息 ${i + 1}：上滑离开底部后，右下角出现「回到底部」。`
              : `用户消息 ${i + 1}`;
      messages.push(createMockMessage(`seed-${i}`, role, base, new Map()));
    }
    return messages;
  });

  const handleAdd = () => {
    setBubbleList((prev) => {
      const role = prev.length % 2 === 0 ? 'assistant' : 'user';
      return [
        ...prev,
        createMockMessage(
          `msg-${Date.now()}`,
          role,
          role === 'assistant'
            ? '新助手消息：若在底部会自动跟随滚动。'
            : '新用户消息。',
          new Map(),
        ),
      ];
    });
  };

  return (
    <div style={{ padding: 12, background: 'var(--color-gray-bg-page)' }}>
      <div
        style={{
          height: 560,
          maxWidth: 720,
          margin: '0 auto',
          position: 'relative',
          borderRadius: 'var(--radius-modal-base)',
          boxShadow: 'var(--shadow-card-base)',
          background: 'var(--color-gray-bg-page-light)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ChatLayout
          ref={chatRef}
          header={{
            title: 'onScrollStateChange',
            showShare: false,
            leftCollapsible: false,
          }}
          onScrollStateChange={setScrollState}
          footer={
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Button type="primary" onClick={handleAdd}>
                添加消息
              </Button>
            </div>
          }
        >
          <BubbleList
            pure
            bubbleList={bubbleList}
            assistantMeta={assistantMeta}
            userMeta={userMeta}
            onLike={() => {}}
            onDisLike={() => {}}
            shouldShowVoice={false}
            markdownRenderConfig={{
              tableConfig: { pure: true },
            }}
          />
        </ChatLayout>

        {!scrollState.isPinned && (
          <Button
            type="primary"
            shape="circle"
            size="large"
            aria-label="回到底部"
            onClick={() => chatRef.current?.scrollToBottom('smooth')}
            style={{
              position: 'absolute',
              right: 20,
              bottom: 88,
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            ↓
          </Button>
        )}

        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            background: '#fafafa',
            borderRadius: 8,
            fontSize: 13,
            color: '#666',
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
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
    </div>
  );
};

export default ScrollStateDemo;
