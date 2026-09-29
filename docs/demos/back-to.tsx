import {
  BackTo,
  BubbleList,
  BubbleMetaData,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import React, { useRef, useState } from 'react';

// 创建模拟消息
const createMockMessage = (
  id: string,
  role: 'user' | 'assistant',
  content: string,
): MessageBubbleData => ({
  id,
  role,
  content,
  createAt: Date.now(),
  updateAt: Date.now(),
  isFinished: true,
  meta: {
    avatar:
      role === 'assistant'
        ? 'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original'
        : 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    title: role === 'assistant' ? 'AI助手' : '用户',
  } as BubbleMetaData,
});

export default () => {
  const bubbleRef = useRef<any | null>(null);

  // 状态管理
  const [bubbleList] = useState<MessageBubbleData[]>(() => {
    const messageCount = 20;
    const messages: MessageBubbleData[] = [];

    for (let i = 0; i < messageCount; i++) {
      const role = i % 2 === 0 ? 'assistant' : 'user';
      const content = `这是第 ${i + 1} 条消息`;
      messages.push(createMockMessage(`msg-${i}`, role, content));
    }

    return messages;
  });

  // 元数据配置
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

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      {/* 消息列表 */}
      <BubbleList
        bubbleList={bubbleList}
        bubbleRef={bubbleRef}
        assistantMeta={assistantMeta}
        userMeta={userMeta}
        pure
        markdownRenderConfig={{
          tableConfig: {
            pure: true,
          },
        }}
      />
      <BackTo.Top
        tooltip="去顶部"
        shouldVisible={() => true}
        style={{ insetInlineEnd: 64 }}
      />
      <BackTo.Bottom tooltip="去底部" shouldVisible={() => true} />
    </div>
  );
};
