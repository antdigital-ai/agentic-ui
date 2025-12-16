import { memo, MutableRefObject, useMemo } from 'react';

import React from 'react';
import { debugInfo } from '../Utils/debugUtils';
import { AIBubble } from './AIBubble';
import { useSchemaEditorBridge } from './schema-editor';
import type { BubbleProps } from './type';
import { UserBubble } from './UserBubble';

/**
 * Bubble 组件 - 聊天气泡组件（智能分发器）
 *
 * 该组件是聊天气泡的智能分发器，根据消息角色自动选择合适的子组件进行渲染。
 * - 用户消息（role: 'user'）使用 UserBubble 组件，采用右侧布局
 * - AI消息（其他角色）使用 AIBubble 组件，采用左侧布局，支持完整交互功能
 *
 * @component
 * @description 聊天气泡智能分发组件，根据消息角色自动选择渲染方式
 * @param {BubbleProps & {deps?: any[], bubbleRef?: MutableRefObject<any>}} props - 组件属性
 * @param {string} [props.placement] - 气泡位置，会被自动覆盖
 * @param {BubbleAvatarProps} [props.avatar] - 头像配置
 * @param {string | number | Date} [props.time] - 消息时间
 * @param {React.ReactNode} [props.children] - 消息内容
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {BubbleRenderConfig} [props.bubbleRenderConfig] - 气泡渲染配置
 * @param {BubbleClassNames} [props.classNames] - 自定义类名配置
 * @param {BubbleStyles} [props.styles] - 自定义样式配置
 * @param {Function} [props.onAvatarClick] - 头像点击回调
 * @param {any[]} [props.deps] - 依赖数组
 * @param {MutableRefObject} [props.bubbleRef] - 气泡引用
 * @param {MessageBubbleData} [props.originData] - 消息数据，包含角色信息
 * @example
 * ```tsx
 * // 用户消息会自动使用 UserBubble
 * <Bubble
 *   originData={{ role: 'user', content: '你好' }}
 *   avatar={{ avatar: "user.jpg", title: "用户" }}
 * />
 *
 * // AI消息会自动使用 AIBubble
 * <Bubble
 *   originData={{ role: 'assistant', content: '你好！有什么可以帮助你的吗？' }}
 *   avatar={{ avatar: "ai.jpg", title: "AI助手" }}
 * />
 *
 * // Schema Editor 在开发环境下自动启用
 * // 需要传入 id 以支持插件识别
 * <Bubble
 *   id="msg-1"
 *   originData={{ id: 'msg-1', role: 'assistant', originContent: '# Hello' }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的聊天气泡组件
 */
export const Bubble: React.FC<
  BubbleProps & {
    deps?: any[];
    bubbleRef?: MutableRefObject<any | undefined>;
  }
> = memo((props) => {
  const { originData } = props;
  const isStringContent = typeof originData?.content === 'string';

  /** Schema Editor Bridge - 开发环境自动启用 */
  const { content } = useSchemaEditorBridge(
    props.id,
    isStringContent ? (originData.content as string) : '',
  );

  debugInfo('useSchemaEditorBridge', content);

  /** 根据角色自动选择组件 */
  const isUserMessage =
    props.placement === undefined
      ? originData?.role === 'user'
      : props.placement === 'right';

  /** 稳定 originData 引用 */
  const memoizedOriginData = useMemo(
    () =>
      originData
        ? { ...originData, ...(isStringContent && { content }) }
        : undefined,
    [originData, isStringContent, content],
  );

  /** 构建传递给子组件的 props */
  const bubbleProps = {
    ...props,
    placement: props.placement || (isUserMessage ? 'right' : 'left'),
    originData: memoizedOriginData,
  };

  debugInfo('bubbleProps', {
    isUserMessage,
    bubbleProps,
  });

  // 根据角色分发到对应的子组件
  if (isUserMessage) {
    return (
      <UserBubble {...bubbleProps} pure={false} {...props.userBubbleProps} />
    );
  }

  return <AIBubble {...bubbleProps} {...props.aIBubbleProps} />;
});
