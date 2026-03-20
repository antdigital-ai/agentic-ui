import { Bubble, MessageBubbleData } from '@ant-design/agentic-ui';
import { Button, Space, Switch } from 'antd';
import React, { useMemo, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

const assistantAvatar = {
  avatar:
    'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
  title: 'AI 助手',
};

const buildMessage = (isThinking: boolean): MessageBubbleData =>
  ({
    id: 'thinking-demo-message',
    role: 'assistant',
    content: isThinking
      ? '...'
      : '已完成回答：这里展示的是“思考中”结束后的最终内容。',
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: !isThinking,
    meta: assistantAvatar,
  }) satisfies MessageBubbleData;

export default () => {
  const [isThinking, setIsThinking] = useState(true);
  const message = useMemo(() => buildMessage(isThinking), [isThinking]);

  return (
    <BubbleDemoCard
      title="🤔 思考中（DOM 轻量加载）"
      description="切换状态查看 Bubble 在思考中分支的纯 DOM 加载效果（文本 + dots）"
    >
      <div style={{ padding: 16 }}>
        <Space style={{ marginBottom: 12 }}>
          <span>思考状态：</span>
          <Switch
            checked={isThinking}
            onChange={setIsThinking}
            checkedChildren="思考中"
            unCheckedChildren="已完成"
          />
          <Button onClick={() => setIsThinking((prev) => !prev)}>
            切换状态
          </Button>
        </Space>

        <Bubble
          pure
          placement="left"
          avatar={assistantAvatar}
          originData={message}
          classNames={{
            bubbleLoadingIconClassName: 'thinking-dom-demo-dots',
          }}
          styles={{
            bubbleLoadingIconStyle: {
              marginInlineStart: 2,
            },
          }}
        />
      </div>
    </BubbleDemoCard>
  );
};
