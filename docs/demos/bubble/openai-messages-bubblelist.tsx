import {
  BubbleList,
  BubbleMetaData,
  OpenAIChatMessage,
  useOpenAIMessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

/**
 * 演示：OpenAI Chat Completions 风格的 messages，经 useOpenAIMessageBubbleData 转为 BubbleList
 * 流式场景：在 state 中更新最后一条 assistant 的 content，message id 保持稳定（默认 openai-msg-${index}）
 */
export default () => {
  const sessionStartedAt = useRef(Date.now()).current;
  const [messages, setMessages] = useState<OpenAIChatMessage[]>([
    { role: 'user', content: '用一句话介绍 React Hooks' },
    { role: 'assistant', content: 'React Hooks 让函数组件也能使用 state 与生命周期' },
  ]);

  const bubbleList = useOpenAIMessageBubbleData(messages, {
    baseTime: sessionStartedAt,
  });

  const assistantMeta: BubbleMetaData = {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'AI助手',
  };

  const userMeta: BubbleMetaData = {
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    title: '用户',
  };

  const simulateStreamDelta = useCallback(() => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === 'assistant' && typeof last.content === 'string') {
        next[next.length - 1] = {
          ...last,
          content: `${last.content}…`,
        };
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setMessages([
      { role: 'user', content: '用一句话介绍 React Hooks' },
      { role: 'assistant', content: 'React Hooks 让函数组件也能使用 state 与生命周期' },
    ]);
  }, []);

  return (
    <BubbleDemoCard title="OpenAI messages → BubbleList（useOpenAIMessageBubbleData）">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space>
          <Button type="primary" onClick={simulateStreamDelta}>
            模拟流式追加（最后一条 assistant）
          </Button>
          <Button onClick={reset}>重置</Button>
        </Space>
        <BubbleList
          bubbleList={bubbleList}
          assistantMeta={assistantMeta}
          userMeta={userMeta}
        />
      </Space>
    </BubbleDemoCard>
  );
};
