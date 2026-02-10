import {
  BubbleList,
  BubbleMetaData,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { message } from 'antd';
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

// 示例消息
const sampleMessages: MessageBubbleData[] = [
  createMockMessage(
    '1',
    'assistant',
    '根据你的描述，推荐使用 TanStack Query 来管理服务端状态，它提供了自动缓存、请求去重和乐观更新等开箱即用的功能。',
  ),
  createMockMessage(
    '2',
    'assistant',
    '另外，对于表单状态管理，建议使用 React Hook Form 搭配 Zod 做类型安全的表单校验。',
  ),
  createMockMessage(
    '3',
    'user',
    '好的，那如果我需要在多个页面间共享用户偏好设置，应该用什么方案？',
  ),
];

export default () => {
  const bubbleListRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<any>();

  // 状态管理
  const [bubbleList, setBubbleList] =
    useState<MessageBubbleData[]>(sampleMessages);

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

  // 处理点赞
  const handleLike = useCallback(async (bubble: MessageBubbleData) => {
    message.success(`已点赞消息: ${bubble.id}`);
    console.log('点赞:', bubble);
  }, []);

  // 处理点踩
  const handleDisLike = useCallback(async (bubble: MessageBubbleData) => {
    message.info(`已点踩消息: ${bubble.id}`);
    console.log('点踩:', bubble);
  }, []);

  // 处理回复
  const handleReply = useCallback((content: string) => {
    const replyMessage = createMockMessage(
      `reply-${Date.now()}`,
      'user',
      `回复: ${content}`,
    );
    setBubbleList((prev) => [...prev, replyMessage]);
    message.success('回复已发送');
  }, []);

  // 处理头像点击
  const handleAvatarClick = useCallback(() => {
    message.success(
      '👤 点击了头像！可以在这里实现用户资料查看、切换用户等功能',
    );
    console.log('头像被点击了');
  }, []);

  // 处理双击
  const handleDoubleClick = useCallback(() => {
    message.success('🖱️ 双击了消息！可以在这里实现消息编辑、复制等功能');
    console.log('消息被双击了');
  }, []);

  return (
    <BubbleDemoCard
      title="🔧 BubbleList 交互功能演示"
      description="💡 点击消息下方的按钮体验各种交互功能，或双击消息查看双击事件"
    >
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
        onLike={handleLike}
        onDisLike={handleDisLike}
        onReply={handleReply}
        onAvatarClick={handleAvatarClick}
        onDoubleClick={handleDoubleClick}
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
        <strong>📖 交互功能：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>
            <strong>onLike:</strong> 点赞回调函数
          </li>
          <li>
            <strong>onDisLike:</strong> 点踩回调函数
          </li>
          <li>
            <strong>onReply:</strong> 回复回调函数
          </li>
          <li>
            <strong>onAvatarClick:</strong> 头像点击回调 - 点击头像触发
          </li>
          <li>
            <strong>onDoubleClick:</strong> 双击回调函数 - 双击消息触发
          </li>
        </ul>
      </div>
    </BubbleDemoCard>
  );
};
