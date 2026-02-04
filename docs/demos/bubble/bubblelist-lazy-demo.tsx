/**
 * title: BubbleList 懒加载示例
 * description: 展示 BubbleList 的懒加载功能，适用于长列表场景，包含 200 个消息项
 */
import {
  BubbleList,
  BubbleMetaData,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Space, Statistic, Switch } from 'antd';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

// 创建模拟消息
const createMockMessage = (
  id: string,
  role: 'user' | 'assistant',
  content: string,
  index: number,
): MessageBubbleData => ({
  id,
  role,
  content,
  createAt: Date.now() - (200 - index) * 1000,
  updateAt: Date.now() - (200 - index) * 1000,
  isFinished: true,
  meta: {
    avatar:
      role === 'assistant'
        ? 'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original'
        : 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    title: role === 'assistant' ? 'AI助手' : '用户',
  } as BubbleMetaData,
});

// 生成 200 条消息
const generateMessages = (): MessageBubbleData[] => {
  const messages: MessageBubbleData[] = [];
  const contents = [
    '这是一条测试消息，用于展示懒加载功能。',
    '懒加载可以显著提升长列表的渲染性能。',
    '只有进入视口的气泡才会被渲染。',
    '这样可以减少初始渲染时间，提升用户体验。',
    'IntersectionObserver API 用于检测元素是否进入视口。',
    '占位符保持布局稳定，避免滚动时的跳动。',
    '支持自定义占位符高度和提前加载距离。',
    '适用于包含大量消息的聊天场景。',
    '性能优化是前端开发的重要课题。',
    '通过懒加载可以减少 DOM 节点数量。',
  ];

  for (let i = 0; i < 200; i++) {
    const role = i % 2 === 0 ? 'assistant' : 'user';
    const contentIndex = i % contents.length;
    const content = `[消息 ${i + 1}] ${contents[contentIndex]}`;
    messages.push(createMockMessage(`msg-${i}`, role, content, i));
  }

  return messages;
};

export default () => {
  const bubbleListRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<any>();
  const [lazyEnabled, setLazyEnabled] = useState(true);
  const [renderTime, setRenderTime] = useState<number | null>(null);

  // 生成 200 条消息
  const bubbleList = useMemo(() => generateMessages(), []);

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

  // 切换懒加载
  const handleLazyToggle = (checked: boolean) => {
    const startTime = performance.now();
    setLazyEnabled(checked);
    // 在下一帧测量渲染时间
    requestAnimationFrame(() => {
      const endTime = performance.now();
      setRenderTime(Math.round(endTime - startTime));
    });
  };

  // 统计信息
  const stats = useMemo(() => {
    const userCount = bubbleList.filter((msg) => msg.role === 'user').length;
    const assistantCount = bubbleList.filter(
      (msg) => msg.role === 'assistant',
    ).length;
    return { total: bubbleList.length, userCount, assistantCount };
  }, [bubbleList]);

  // 初始滚动到底部，显示最新消息
  // 使用 useLayoutEffect 在 DOM 更新后、浏览器绘制前立即设置滚动位置
  // 直接设置 scrollTop 属性，避免任何动画效果
  useLayoutEffect(() => {
    const container = bubbleListRef.current;
    if (!container) return;

    // 使用 requestAnimationFrame 确保在浏览器渲染前执行
    const rafId = requestAnimationFrame(() => {
      // 直接设置 scrollTop，无动画，立即生效
      container.scrollTop = container.scrollHeight;
    });

    return () => cancelAnimationFrame(rafId);
  }, [lazyEnabled, bubbleList.length]);

  return (
    <BubbleDemoCard
      title="🚀 BubbleList 懒加载示例"
      description={`共 ${stats.total} 条消息（用户: ${stats.userCount}，助手: ${stats.assistantCount}）`}
    >
      {/* 控制区域 */}
      <div
        style={{
          padding: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>启用懒加载：</strong>
              <span style={{ marginLeft: 8, color: '#666', fontSize: 12 }}>
                只渲染可见区域内的气泡，提升性能
              </span>
            </div>
            <Switch
              checked={lazyEnabled}
              onChange={handleLazyToggle}
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </div>

          {/* 统计信息 */}
          <Space size="large">
            <Statistic
              title="消息总数"
              value={stats.total}
              valueStyle={{ fontSize: 16 }}
            />
            <Statistic
              title="用户消息"
              value={stats.userCount}
              valueStyle={{ fontSize: 16 }}
            />
            <Statistic
              title="助手消息"
              value={stats.assistantCount}
              valueStyle={{ fontSize: 16 }}
            />
            {renderTime !== null && (
              <Statistic
                title="渲染时间"
                value={renderTime}
                suffix="ms"
                valueStyle={{ fontSize: 16 }}
              />
            )}
          </Space>
        </Space>
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
        lazy={
          lazyEnabled
            ? {
                enable: true,
                placeholderHeight: 80,
                rootMargin: '200px',
                // 最后 10 条消息不启用懒加载，优先渲染，确保初始时能看到最新消息
                shouldLazyLoad: (index, total) => {
                  const lastMessagesCount = 10;
                  return index < total - lastMessagesCount;
                },
                renderPlaceholder: ({ style, elementInfo }) => (
                  <div
                    style={{
                      ...style,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'loading 1.5s ease-in-out infinite',
                      borderRadius: 8,
                      color: '#999',
                      fontSize: 12,
                    }}
                  >
                    <span>
                      {elementInfo?.role === 'user' ? '👤' : '🤖'} 加载中... (
                      {elementInfo?.index !== undefined
                        ? elementInfo.index + 1
                        : '?'}
                      /{elementInfo?.total || '?'})
                    </span>
                  </div>
                ),
              }
            : undefined
        }
        style={{
          height: 600,
          overflow: 'auto',
        }}
      />

      {/* 说明 */}
      <div
        style={{
          padding: 16,
          background: '#e6f7ff',
          borderRadius: 8,
          fontSize: 14,
          margin: 16,
        }}
      >
        <strong>📖 懒加载功能说明：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>
            <strong>性能优化：</strong>
            只渲染可见区域内的气泡，减少初始 DOM 节点数量
          </li>
          <li>
            <strong>占位符：</strong>
            使用占位符保持布局稳定，避免滚动时的布局跳动
          </li>
          <li>
            <strong>提前加载：</strong>
            通过 rootMargin 配置提前加载距离（默认 200px）
          </li>
          <li>
            <strong>自定义占位符：</strong>
            支持通过 renderPlaceholder 自定义占位符渲染
          </li>
          <li>
            <strong>元素信息：</strong>
            占位符渲染函数可以获取气泡的索引、总数和角色信息
          </li>
          <li>
            <strong>适用场景：</strong>
            适用于包含大量消息的长列表场景，如聊天记录、消息历史等
          </li>
        </ul>
      </div>

      {/* 样式 */}
      <style>
        {`
          @keyframes loading {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
    </BubbleDemoCard>
  );
};
