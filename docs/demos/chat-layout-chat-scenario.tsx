import {
  BubbleList,
  ChatLayout,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button, Input } from 'antd';
import React, { useState } from 'react';

const assistantAvatar =
  'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original';
const userAvatar =
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';

const ASSISTANT_REPLIES = [
  '好的，我来帮你分析一下这个问题。ChatLayout 提供了 header / content / footer 三区布局，内置自动滚动，非常适合聊天场景。',
  '你可以通过 `onScrollStateChange` 回调来监听滚动状态，实现"回到底部"等交互。',
  '`footerHeight` 需要设置为 footer 的实际高度，这样内容区才能正确预留空间，避免消息被底部遮挡。',
  '如果需要自定义滚动行为，可以通过 `ref.scrollToBottom()` 手动触发，或通过 `ref.scrollContainer` 直接操作 DOM。',
  'ChatLayout 的 `showFooterBackground` 属性可以在底部区域上方渲染渐变遮罩，让消息列表和输入框之间的过渡更自然。',
];

const INITIAL_MESSAGES: MessageBubbleData[] = [
  {
    id: '1',
    role: 'assistant',
    content: '你好！我是 AI 助手，请输入你的问题，我会尝试回答。',
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    meta: { avatar: assistantAvatar, title: 'AI 助手' },
    fileMap: new Map(),
  },
];

const ChatScenarioDemo = () => {
  const [messages, setMessages] =
    useState<MessageBubbleData[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || loading) return;

    const userMsg: MessageBubbleData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createAt: Date.now(),
      updateAt: Date.now(),
      isFinished: true,
      meta: { avatar: userAvatar, title: '用户' },
      fileMap: new Map(),
    };

    const nextLength = messages.length + 1;
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    setTimeout(() => {
      const replyIdx = Math.floor(nextLength / 2) % ASSISTANT_REPLIES.length;
      const assistantMsg: MessageBubbleData = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: ASSISTANT_REPLIES[replyIdx],
        createAt: Date.now(),
        updateAt: Date.now(),
        isFinished: true,
        meta: { avatar: assistantAvatar, title: 'AI 助手' },
        fileMap: new Map(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ height: 560, display: 'flex', flexDirection: 'column' }}>
      <ChatLayout
        header={{
          title: 'AI 对话',
          showShare: true,
          onShare: () => console.log('分享对话'),
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
              placeholder="输入消息..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              style={{ flex: 1 }}
              disabled={loading}
            />
            <Button type="primary" onClick={handleSend} loading={loading}>
              发送
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

export default ChatScenarioDemo;
