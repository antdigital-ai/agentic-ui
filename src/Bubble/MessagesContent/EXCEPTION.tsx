import { theme } from 'antd';
import React from 'react';
import { MessageBubbleData } from '../type';

/**
 * EXCEPTION 组件 - 异常消息组件
 *
 * 该组件用于显示异常或错误消息，使用错误主题色进行样式化。
 * 主要用于显示系统错误、网络异常或其他异常状态的消息。
 *
 * @component
 * @description 异常消息组件，用于显示错误和异常信息
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.extra - 额外的内容，显示在错误消息下方
 * @param {string} props.content - 异常消息内容
 * @param {Record<string, any> & MessageBubbleData} [props.originData] - 原始消息数据
 *
 * @example
 * ```tsx
 * import { EXCEPTION } from './EXCEPTION';
 *
 * <EXCEPTION
 *   content="网络连接失败，请检查网络设置"
 *   extra={<RetryButton onClick={handleRetry} />}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的异常消息组件
 *
 * @remarks
 * - 使用 Ant Design 的错误主题色
 * - 支持额外的内容显示
 * - 自动换行和文本包装
 * - 响应式设计
 */
export const EXCEPTION = ({
  extra,
  content,
}: {
  extra: React.ReactNode;
  content: string;
  originData?: Record<string, any> & MessageBubbleData<Record<string, any>>;
}) => {
  const { token } = theme.useToken();
  return (
    <>
      <div
        style={{
          color: token.colorError,
          lineHeight: '24px',
          padding: '4px var(--padding-3x)',
          wordBreak: 'break-all',
          textWrap: 'wrap',
        }}
      >
        {content}
      </div>
      {extra}
    </>
  );
};
