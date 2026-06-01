import {
  BubbleList,
  ChatLayout,
  ChatLayoutRef,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button, Flex, Input } from 'antd';
import React, { useRef, useState } from 'react';
import {
  assistantMeta,
  createMockMessage,
  INITIAL_MESSAGES,
  userMeta,
} from './data';

const FOOTER_MIN_HEIGHT = 96;

const FooterHeightDemo: React.FC = () => {
  const chatRef = useRef<ChatLayoutRef>(null);
  const [draft, setDraft] = useState('');
  const [bubbleList, setBubbleList] = useState<MessageBubbleData[]>(() => {
    const messages: MessageBubbleData[] = [];
    for (let i = 0; i < 6; i++) {
      const role = i % 2 === 0 ? 'assistant' : 'user';
      const content =
        i === 0 ? INITIAL_MESSAGES.assistant : INITIAL_MESSAGES.user;
      messages.push(createMockMessage(`fh-${i}`, role, content, new Map()));
    }
    return messages;
  });

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setBubbleList((prev) => [
      ...prev,
      createMockMessage(`msg-${Date.now()}`, 'user', text, new Map()),
    ]);
    setDraft('');
    setTimeout(() => chatRef.current?.scrollToBottom(), 0);
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
          footerHeight={FOOTER_MIN_HEIGHT}
          header={{
            title: 'footerHeight 与多行底部',
            showShare: false,
            leftCollapsible: false,
          }}
          footer={
            <Flex
              vertical
              gap={8}
              style={{ padding: '12px 16px', width: '100%' }}
            >
              <Input.TextArea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="多行输入占位，观察内容区底部留白随 footer 增高"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
              <Flex justify="flex-end" gap={8}>
                <Button onClick={() => setDraft('')}>清空</Button>
                <Button type="primary" onClick={handleSend}>
                  发送
                </Button>
              </Flex>
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

export default FooterHeightDemo;
