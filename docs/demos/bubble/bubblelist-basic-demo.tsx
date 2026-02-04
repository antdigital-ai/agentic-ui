import {
  BubbleList,
  BubbleMetaData,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

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

// 初始消息
const initialMessages: MessageBubbleData[] = [
  createMockMessage('1', 'assistant', '欢迎使用 BubbleList 组件！'),
  createMockMessage('2', 'user', '这个组件功能很强大！'),
];

export default () => {
  const bubbleListRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<any>();

  // 状态管理
  const [bubbleList, setBubbleList] =
    useState<MessageBubbleData[]>(initialMessages);

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

  // 添加消息
  const addMessage = useCallback(() => {
    const newMessage = createMockMessage(
      `msg-${Date.now()}`,
      bubbleList.length % 2 === 0 ? 'user' : 'assistant',
      `这是第 ${bubbleList.length + 1} 条消息`,
    );
    newMessage.extra = {
      ...newMessage.extra,
      preMessage: bubbleList.at(-1) || undefined,
    };
    setBubbleList((prev) => [...prev, newMessage]);
    message.success('消息已添加');
  }, [bubbleList.length]);

  return (
    <BubbleDemoCard
      title="📋 BubbleList 基础用法"
      description={`当前消息数: ${bubbleList.length}`}
    >
      {/* 控制区域 */}
      <div style={{ padding: 24, paddingBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={addMessage}>
          添加消息
        </Button>
      </div>

      {/* 消息列表 */}
      <BubbleList
        markdownRenderConfig={{
          tableConfig: {
            pure: true,
          },
        }}
        pure
        bubbleList={bubbleList}
        bubbleListRef={bubbleListRef}
        bubbleRef={bubbleRef}
        assistantMeta={assistantMeta}
        userMeta={userMeta}
        style={{
          height: 400,
          overflow: 'auto',
          borderRadius: '20px', // 与卡片容器保持一致
        }}
      />

      {/* 说明 */}
      <div
        style={{
          padding: 16,
          background: '#e6f7ff',
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <strong>📖 基础用法：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>
            <strong>bubbleList:</strong> 消息列表数据
          </li>
          <li>
            <strong>assistantMeta:</strong> 助手元数据配置
          </li>
          <li>
            <strong>userMeta:</strong> 用户元数据配置
          </li>
        </ul>
      </div>
    </BubbleDemoCard>
  );
};
