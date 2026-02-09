import { memo, MutableRefObject, useContext } from 'react';

import { ConfigProvider, Flex } from 'antd';
import cx from 'clsx';
import React from 'react';
import { Quote, QuoteProps } from '../Quote';
import { BubbleConfigContext } from './BubbleConfigProvide';
import { BubbleMessageDisplay } from './MessagesContent';
import { MessagesContext } from './MessagesContent/BubbleContext';
import { BubbleExtra } from './MessagesContent/BubbleExtra';
import { useStyle } from './style';
import type { BubbleMetaData, BubbleProps } from './type';

import { runRender } from './AIBubble';
import { BubbleFileView } from './FileView';
import { BubbleTitle } from './Title';

const USER_PLACEMENT = 'right' as const;
const BUBBLE_GAP = 12;
const FILE_VIEW_PADDING_LEFT = 12;

const getContentContainerStyle = (): React.CSSProperties => ({
  display: 'flex',
  gap: 4,
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const getFileViewStyle = (
  standalone: boolean | undefined,
  customStyle?: React.CSSProperties,
): React.CSSProperties => ({
  minWidth: standalone ? 'min(296px,100%)' : '0px',
  paddingLeft: FILE_VIEW_PADDING_LEFT,
  ...customStyle,
});

const getContentStyle = (
  standalone: boolean | undefined,
  customStyle?: React.CSSProperties,
): React.CSSProperties => ({
  minWidth: standalone ? 'min(16px,100%)' : '0px',
  ...customStyle,
});

/**
 * UserBubble 组件
 *
 * 显示用户发送的消息，采用右侧布局
 *
 * @example
 * ```tsx
 * <UserBubble
 *   avatar={{ avatar: "url", title: "用户" }}
 *   time={new Date()}
 * >
 *   用户消息内容
 * </UserBubble>
 * ```
 */
export const UserBubble: React.FC<
  BubbleProps & {
    deps?: any[];
    bubbleRef?: MutableRefObject<any | undefined>;
    quote?: QuoteProps;
  }
> = memo((props) => {
  const {
    className,
    style,
    bubbleRenderConfig,
    classNames,
    styles,
    originData,
    quote,
  } = props;

  const [hidePadding, setHidePadding] = React.useState(false);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const context = useContext(BubbleConfigContext);
  const { compact, standalone, locale } = context || {};

  const prefixClass = getPrefixCls('agentic');
  const { wrapSSR, hashId } = useStyle(prefixClass, classNames);

  const time = originData?.createAt || props.time;
  const placement = USER_PLACEMENT;
  const hasFileMap = (originData?.fileMap?.size || 0) > 0;

  const quoteElement = quote?.quoteDescription ? <Quote {...quote} /> : null;

  const titleDom = runRender(
    bubbleRenderConfig?.titleRender,
    props,
    <BubbleTitle
      quote={quoteElement}
      bubbleNameClassName={classNames?.bubbleNameClassName}
      className={classNames?.bubbleListItemTitleClassName}
      style={styles?.bubbleListItemTitleStyle}
      prefixClass={cx(`${prefixClass}-bubble-title`)}
      title={''}
      placement={placement}
      time={time}
    />,
  );

  const messageContent = (
    <BubbleMessageDisplay
      markdownRenderConfig={props.markdownRenderConfig}
      docListProps={props.docListProps}
      bubbleListRef={props.bubbleListRef}
      bubbleListItemExtraStyle={styles?.bubbleListItemExtraStyle}
      bubbleRef={props.bubbleRef}
      content={originData?.content}
      key={originData?.id}
      data-id={originData?.id}
      avatar={originData?.meta as BubbleMetaData}
      readonly={props.readonly ?? false}
      onReply={props.onReply}
      id={props.id}
      originData={originData}
      placement={placement}
      time={originData?.updateAt || originData?.createAt}
      customConfig={bubbleRenderConfig?.customConfig}
      pure={props.pure}
      shouldShowCopy={props.shouldShowCopy}
      fileViewEvents={props.fileViewEvents}
      fileViewConfig={props.fileViewConfig}
      renderFileMoreAction={props.renderFileMoreAction}
      bubbleRenderConfig={bubbleRenderConfig}
    />
  );

  const childrenDom = runRender(
    bubbleRenderConfig?.contentRender,
    props,
    messageContent,
  );

  const contentBeforeDom = runRender(
    bubbleRenderConfig?.contentBeforeRender,
    props,
    null,
  );

  const contentAfterDom = runRender(
    bubbleRenderConfig?.contentAfterRender,
    props,
    null,
  );

  const contentContainerStyle = getContentContainerStyle();
  const fileViewStyle = getFileViewStyle(
    standalone,
    styles?.bubbleListItemExtraStyle,
  );
  const contentStyle = getContentStyle(
    standalone,
    styles?.bubbleListItemContentStyle,
  );

  const itemDom = wrapSSR(
    <BubbleConfigContext.Provider
      value={{
        compact,
        standalone: !!standalone,
        locale: locale as any,
        bubble: props as any,
      }}
    >
      <Flex
        className={cx(
          hashId,
          className,
          `${prefixClass}-bubble`,
          `${prefixClass}-bubble-${placement}`,
          `${prefixClass}-bubble-user`,
          { [`${prefixClass}-bubble-compact`]: compact },
          classNames?.bubbleClassName,
        )}
        style={style}
        vertical
        id={props.id}
        data-id={props.id}
        gap={BUBBLE_GAP}
      >
        <div
          style={style}
          className={cx(`${prefixClass}-bubble-container`, hashId)}
        >
          <div
            style={contentContainerStyle}
            className={cx(
              `${prefixClass}-bubble-container`,
              `${prefixClass}-bubble-container-${placement}`,
              `${prefixClass}-bubble-container-user`,
              { [`${prefixClass}-bubble-container-pure`]: props.pure },
              classNames?.bubbleContainerClassName,
              hashId,
            )}
            data-testid="chat-message"
          >
            <div
              className={cx(
                `${prefixClass}-bubble-avatar-title`,
                `${prefixClass}-bubble-avatar-title-${placement}`,
                `${prefixClass}-bubble-avatar-title-ai`,
                classNames?.bubbleAvatarTitleClassName,
                hashId,
                {
                  [`${prefixClass}-bubble-avatar-title-pure`]: props.pure,
                  [`${prefixClass}-bubble-avatar-title-quote`]:
                    quote?.quoteDescription,
                },
              )}
            >
              {titleDom}
            </div>
            {contentBeforeDom && (
              <div
                style={styles?.bubbleListItemExtraStyle}
                className={cx(
                  `${prefixClass}-bubble-before`,
                  `${prefixClass}-bubble-before-${placement}`,
                  `${prefixClass}-bubble-before-user`,
                  hashId,
                )}
                data-testid="message-before"
              >
                {contentBeforeDom}
              </div>
            )}
            {hasFileMap && (
              <div
                style={fileViewStyle}
                className={cx(
                  `${prefixClass}-bubble-after`,
                  `${prefixClass}-bubble-after-${placement}`,
                  `${prefixClass}-bubble-after-ai`,
                  hashId,
                )}
                data-testid="message-after"
              >
                <BubbleFileView
                  bubbleListRef={props.bubbleListRef}
                  bubble={props as any}
                  placement={placement}
                />
              </div>
            )}
            <div
              style={contentStyle}
              className={cx(
                `${prefixClass}-bubble-content`,
                `${prefixClass}-bubble-content-${placement}`,
                `${prefixClass}-bubble-content-user`,
                { [`${prefixClass}-bubble-content-pure`]: props.pure },
                classNames?.bubbleListItemContentClassName,
                hashId,
              )}
              onDoubleClick={props.onDoubleClick}
              data-testid="message-content"
            >
              {childrenDom}
            </div>
            {contentAfterDom}
          </div>
        </div>
      </Flex>
    </BubbleConfigContext.Provider>,
  );

  if (bubbleRenderConfig?.render === false) return null;
  return (
    <MessagesContext.Provider
      value={{
        message: props.originData,
        hidePadding,
        setHidePadding,
        setMessage: (message) => {
          props?.bubbleRef?.current?.setMessageItem?.(
            props.id!,
            message as any,
          );
        },
      }}
    >
      <>
        {bubbleRenderConfig?.render?.(
          props,
          {
            avatar: null,
            title: null,
            header: null,
            extra:
              props?.bubbleRenderConfig?.extraRender === false ? null : (
                <BubbleExtra
                  pure
                  style={props.styles?.bubbleListItemExtraStyle}
                  readonly={props.readonly}
                  rightRender={props?.bubbleRenderConfig?.extraRightRender}
                  shouldShowCopy={props.shouldShowCopy}
                  useSpeech={props.useSpeech}
                  shouldShowVoice={props.shouldShowVoice}
                  bubble={props as any}
                />
              ),
            messageContent: messageContent,
            itemDom,
          },
          itemDom,
        ) || itemDom}
      </>
    </MessagesContext.Provider>
  );
});
