import {
  BubbleList,
  ChatLayout,
  ChatLayoutRef,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button } from 'antd';
import React, { useRef, useState } from 'react';

const assistantAvatar =
  'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original';
const userAvatar =
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';

const INITIAL_MESSAGES: MessageBubbleData[] = [
  {
    id: '1',
    role: 'assistant',
    content: '你好！我是 AI 助手，有什么可以帮你的吗？',
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    meta: { avatar: assistantAvatar, title: 'AI 助手' },
    fileMap: new Map(),
  },
  {
    id: '2',
    role: 'user',
    content: '请介绍一下 ChatLayout 组件的基本用法。',
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    meta: { avatar: userAvatar, title: '用户' },
    fileMap: new Map(),
  },
  {
    id: '3',
    role: 'assistant',
    content: `**ChatLayout**：header / 内容区（常放 \`BubbleList\`）/ footer；内容增高时可配合自动滚到底部。`,
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    meta: { avatar: assistantAvatar, title: 'AI 助手' },
    fileMap: new Map(),
  },
];

const BasicDemo = () => {
  const [messages, setMessages] = useState<MessageBubbleData[]>(INITIAL_MESSAGES);
  const chatRef = useRef<ChatLayoutRef>(null);

  const handleAddMessage = () => {
    const newMessage: MessageBubbleData = {
      id: `msg-${Date.now()}`,
      role: messages.length % 2 === 0 ? 'assistant' : 'user',
      content:
        messages.length % 2 === 0
          ? '这是一条新的 AI 回复，ChatLayout 会自动滚动到这里。'
          : '这是一条新的用户消息。',
      createAt: Date.now(),
      updateAt: Date.now(),
      isFinished: true,
      meta: {
        avatar: messages.length % 2 === 0 ? assistantAvatar : userAvatar,
        title: messages.length % 2 === 0 ? 'AI 助手' : '用户',
      },
      fileMap: new Map(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div style={{ height: 480, display: 'flex', flexDirection: 'column' }}>
      <ChatLayout
        ref={chatRef}
        header={{
          title: 'AI 助手',
          showShare: true,
          onShare: () => console.log('分享对话'),
        }}
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
            <Button onClick={() => chatRef.current?.scrollToBottom()}>
              滚动到底部
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
    </div>
  );
};

export default BasicDemo;
