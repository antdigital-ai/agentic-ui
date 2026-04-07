import {
  BubbleList,
  BubbleMetaData,
  OpenClawChatMessage,
  useOpenClawMessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

/**
 * OpenClaw 会话 / transcript 风格：可选 `timestamp`（毫秒）、工具结果可用 `toolResult`
 */
export default () => {
  const sessionStartedAt = useRef(Date.now()).current;
  const [messages, setMessages] = useState<OpenClawChatMessage[]>([
    {
      role: 'user',
      content: '列出当前目录',
      timestamp: sessionStartedAt,
    },
    {
      role: 'assistant',
      content: '正在列出…',
      timestamp: sessionStartedAt + 1000,
    },
    {
      role: 'toolResult',
      content: 'package.json\nREADME.md',
      tool_call_id: 'call_demo_1',
      timestamp: sessionStartedAt + 2000,
    },
    {
      role: 'assistant',
      content: '目录中包含 `package.json` 与 `README.md`。',
      timestamp: sessionStartedAt + 3000,
    },
  ]);

  const bubbleList = useOpenClawMessageBubbleData(messages, {
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

  const appendToLastAssistant = useCallback(() => {
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
    <BubbleDemoCard title="OpenClaw 风格 messages → BubbleList（useOpenClawMessageBubbleData）">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space>
          <Button type="primary" onClick={appendToLastAssistant}>
            模拟流式追加（最后一条 assistant）
          </Button>
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
