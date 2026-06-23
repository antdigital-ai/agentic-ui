import {
  BubbleList,
  ChatLayout,
  ChatLayoutRef,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button, Flex } from 'antd';
import React, { useRef, useState } from 'react';
import {
  assistantMeta,
  createMockMessage,
  INITIAL_MESSAGES,
  userMeta,
} from './data';

const SEED_COUNT = 8;

const NoSidebarDemo: React.FC = () => {
  const chatRef = useRef<ChatLayoutRef>(null);
  const [bubbleList, setBubbleList] = useState<MessageBubbleData[]>(() => {
    const messages: MessageBubbleData[] = [];
    for (let i = 0; i < SEED_COUNT; i++) {
      const role = i % 2 === 0 ? 'assistant' : 'user';
      const content =
        i === 0 ? INITIAL_MESSAGES.assistant : INITIAL_MESSAGES.user;
      messages.push(createMockMessage(`seed-${i}`, role, content, new Map()));
    }
    return messages;
  });

  const handleAppend = () => {
    setBubbleList((prev) => {
      const nextIndex = prev.length;
      const role = nextIndex % 2 === 0 ? 'assistant' : 'user';
      return [
        ...prev,
        createMockMessage(
          `msg-${Date.now()}`,
          role,
          `追加的第 ${nextIndex + 1} 条消息（${role}）`,
          new Map(),
        ),
      ];
    });
  };

  return (
    <div style={{ padding: 12, background: 'var(--color-gray-bg-page)' }}>
      <div
        style={{
          height: 520,
          maxWidth: 720,
          margin: '0 auto',
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
            title: '无主栏 · 仅对话区',
            showShare: false,
            leftCollapsible: false,
          }}
          footer={
            <Flex
              wrap="wrap"
              gap={8}
              align="center"
              justify="center"
              style={{ padding: '12px 16px', width: '100%' }}
            >
              <Button type="primary" onClick={handleAppend}>
                追加一条消息
              </Button>
              <Button onClick={() => chatRef.current?.scrollToBottom()}>
                回到底部
              </Button>
            </Flex>
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
      </div>
    </div>
  );
};

export default NoSidebarDemo;
