import { Flex } from 'antd';
import cx from 'classnames';
import React from 'react';

import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../hooks/useStyle';
import { formatTime } from '../utils/formatTime';
import { BubbleProps, MessageBubbleData } from './type';

const TITLE_GAP = 8;

const getFlexDirection = (
  placement: BubbleProps['placement'],
): React.CSSProperties['flexDirection'] => {
  return placement === 'left' ? 'row' : 'row-reverse';
};

/**
 * BubbleTitle 组件属性
 */
export interface TitleProps {
  /** 标题内容 */
  title: React.ReactNode;
  /** 布局位置 */
  placement?: BubbleProps['placement'];
  /** 时间信息 */
  time?: MessageBubbleData['updateAt'] | MessageBubbleData['createAt'];
  /** 自定义类名 */
  className?: string;
  /** 前缀类名 */
  prefixClass?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 气泡名称类名 */
  bubbleNameClassName?: string;
  /** 引用内容 */
  quote?: React.ReactNode;
}

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      font: 'var(--font-text-h6-base)',
      letterSpacing: ['var(--letter-spacing-h6-base, normal)', 'normal'],
      textAlign: 'justify',
      color: 'var(--color-gray-text-default)',
      '&-time': {
        visibility: 'hidden',
        font: 'var(--font-text-body-sm)',
        letterSpacing: 'var(--letter-spacing-body-sm, normal)',
        color: 'var(--color-gray-text-light)',
      },
      '&:hover': {
        [`${token.componentCls}-time`]: {
          visibility: 'visible',
        },
      },
    },
  };
};

const useStyle = (prefixCls?: string) => {
  return useEditorStyleRegister('Title', (token) => {
    const titleToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [resetComponent(titleToken), genStyle(titleToken)];
  });
};

/**
 * BubbleTitle 组件
 *
 * 显示聊天气泡的标题和时间，支持左右布局
 *
 * @example
 * ```tsx
 * <BubbleTitle
 *   title="AI助手"
 *   time={new Date()}
 *   placement="left"
 * />
 * ```
 */
export const BubbleTitle: React.FC<TitleProps> = ({
  style,
  prefixClass,
  className,
  placement,
  time,
  bubbleNameClassName,
  quote,
  title,
}) => {
  const { wrapSSR, hashId } = useStyle(prefixClass);

  const flexStyle: React.CSSProperties = {
    flexDirection: getFlexDirection(placement),
    display: 'flex',
    alignItems: 'center',
    ...style,
  };

  return wrapSSR(
    <>
      <Flex
        className={cx(hashId, prefixClass, className)}
        style={flexStyle}
        gap={TITLE_GAP}
        data-testid="bubble-title"
      >
        {title && <span className={bubbleNameClassName}>{title}</span>}
        {time && (
          <time
            className={cx(`${prefixClass}-time`, hashId)}
            data-testid="bubble-time"
          >
            {formatTime(time)}
          </time>
        )}
      </Flex>
      {quote}
    </>,
  );
};
