import {
  BubbleList,
  BubbleMetaData,
  OllamaChatMessage,
  useOllamaMessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

/** Ollama POST /api/chat 的 messages[] 形状（role + content，可选 images / tool_calls / thinking） */
export default () => {
  const sessionStartedAt = useRef(Date.now()).current;
  const [messages, setMessages] = useState<OllamaChatMessage[]>([
    { role: 'user', content: '用一句话介绍 Ollama' },
    {
      role: 'assistant',
      content: 'Ollama 是在本地运行大模型的工具。',
    },
  ]);

  const bubbleList = useOllamaMessageBubbleData(messages, {
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

  const streamAssistant = useCallback(() => {
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

  return (
    <BubbleDemoCard title="Ollama /api/chat messages → BubbleList（useOllamaMessageBubbleData）">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Button type="primary" onClick={streamAssistant}>
          模拟流式追加（最后一条 assistant）
        </Button>
        <BubbleList
          bubbleList={bubbleList}
          assistantMeta={assistantMeta}
          userMeta={userMeta}
        />
      </Space>
    </BubbleDemoCard>
  );
};
