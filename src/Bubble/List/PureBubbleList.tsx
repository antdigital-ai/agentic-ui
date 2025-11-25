import SkeletonList from './SkeletonList';

import { MutableRefObject, useContext, useMemo } from 'react';

import type { BubbleMetaData, BubbleProps, MessageBubbleData } from '../type';

import { ConfigProvider } from 'antd';
import cx from 'classnames';
import React from 'react';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { PureAIBubble, PureUserBubble } from '../PureBubble';
import { useStyle } from './style';

export interface PureBubbleListProps {
  bubbleList: MessageBubbleData[];
  readonly?: boolean;
  bubbleListRef?: MutableRefObject<HTMLDivElement | null>;
  bubbleRef?: MutableRefObject<any | undefined>;
  isLoading?: boolean;
  className?: string;
  bubbleRenderConfig?: BubbleProps['bubbleRenderConfig'];
  style?: React.CSSProperties;
  userMeta?: BubbleMetaData;
  assistantMeta?: BubbleMetaData;
  styles?: BubbleProps['styles'];
  classNames?: BubbleProps['classNames'];
  markdownRenderConfig?: BubbleProps['markdownRenderConfig'];
  docListProps?: BubbleProps['docListProps'];
  onDisLike?: BubbleProps['onDisLike'];
  onLike?: BubbleProps['onLike'];
  onCancelLike?: BubbleProps['onCancelLike'];
  onReply?: BubbleProps['onReply'];
  onAvatarClick?: BubbleProps['onAvatarClick'];
  onDoubleClick?: BubbleProps['onDoubleClick'];
  shouldShowCopy?: BubbleProps['shouldShowCopy'];
  shouldShowVoice?: BubbleProps['shouldShowVoice'];
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  onWheel?: (
    event: React.WheelEvent<HTMLDivElement>,
    bubbleListRef: HTMLDivElement | null,
  ) => void;
  onTouchMove?: (
    event: React.TouchEvent<HTMLDivElement>,
    bubbleListRef: HTMLDivElement | null,
  ) => void;
}

export const PureBubbleList: React.FC<PureBubbleListProps> = (props) => {
  const {
    bubbleList,
    bubbleListRef,
    bubbleRenderConfig,
    className,
    classNames,
    docListProps,
    isLoading,
    markdownRenderConfig,
    onAvatarClick,
    onCancelLike,
    onDisLike,
    onDoubleClick,
    onLike,
    onReply,
    onScroll,
    onTouchMove,
    onWheel,
    shouldShowCopy,
    shouldShowVoice,
    style,
    styles,
    userMeta,
    assistantMeta,
  } = props;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { compact } = useContext(BubbleConfigContext) || {};
  const prefixClass = getPrefixCls('agentic-bubble-list');
  const { wrapSSR, hashId } = useStyle(prefixClass);

  const deps = useMemo(() => [props.style], [JSON.stringify(props.style)]);

  const listDom = useMemo(() => {
    return bubbleList.map((item, index) => {
      const placement = item.role === 'user' ? 'right' : 'left';
      const BubbleComponent =
        placement === 'right' ? PureUserBubble : PureAIBubble;
      const isLast = index === bubbleList.length - 1;
      (item as any).isLatest = isLast;
      (item as any).isLast = isLast;

      return (
        <BubbleComponent
          key={item.id}
          data-id={item.id}
          avatar={{
            ...(placement === 'right' ? userMeta : assistantMeta),
            ...(item as any).meta,
          }}
          preMessage={bubbleList[index - 1]}
          id={item.id}
          style={{
            ...styles?.bubbleListItemStyle,
          }}
          originData={item}
          placement={placement}
          time={item.updateAt || item.createAt}
          deps={deps}
          pure
          bubbleListRef={bubbleListRef}
          bubbleRenderConfig={bubbleRenderConfig}
          classNames={classNames}
          bubbleRef={props.bubbleRef}
          markdownRenderConfig={markdownRenderConfig}
          docListProps={docListProps}
          styles={{
            ...styles,
            bubbleListItemContentStyle: {
              ...styles?.bubbleListItemContentStyle,
              ...(placement === 'right'
                ? styles?.bubbleListRightItemContentStyle
                : styles?.bubbleListLeftItemContentStyle),
            },
          }}
          readonly={props.readonly}
          onReply={onReply}
          onDisLike={onDisLike}
          onLike={onLike}
          onCancelLike={onCancelLike}
          onAvatarClick={onAvatarClick}
          onDoubleClick={onDoubleClick}
          customConfig={bubbleRenderConfig?.customConfig}
          shouldShowCopy={shouldShowCopy}
          shouldShowVoice={shouldShowVoice}
        />
      );
    });
  }, [bubbleList, props.style]);

  if (isLoading) {
    return wrapSSR(
      <div
        className={cx(prefixClass, `${prefixClass}-loading`, className, hashId)}
        ref={bubbleListRef}
        style={{
          padding: 24,
        }}
      >
        <SkeletonList />
      </div>,
    );
  }

  return wrapSSR(
    <div
      className={cx(`${prefixClass}`, className, hashId, {
        [`${prefixClass}-readonly`]: props.readonly,
        [`${prefixClass}-compact`]: compact,
      })}
      data-chat-list={bubbleList.length}
      style={style}
      ref={bubbleListRef}
      onScroll={onScroll}
      onWheel={(event) => onWheel?.(event, bubbleListRef?.current || null)}
      onTouchMove={(event) =>
        onTouchMove?.(event, bubbleListRef?.current || null)
      }
    >
      {listDom}
    </div>,
  );
};

export default PureBubbleList;
