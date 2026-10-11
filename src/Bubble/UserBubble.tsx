import { memo, useCallback, useContext, useMemo } from 'react';

import { ConfigProvider, Flex } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { Quote, QuoteProps } from '../Quote';
import { BubbleAvatar } from './Avatar';
import { BubbleConfigContext } from './BubbleConfigProvide';
import { bubblePropsAreEqual } from './bubblePropsAreEqual';
import { ContentFilemapView } from './ContentFilemapView';
import { BubbleMessageDisplay } from './MessagesContent';
import { MessagesContext } from './MessagesContent/BubbleContext';
import { BubbleExtra } from './MessagesContent/BubbleExtra';
import { useStyle } from './style';
import type { BubbleProps } from './type';
import { useFilemapBlocks } from './useFilemapBlocks';

import { BubbleFileView } from './FileView';
import { BubbleTitle } from './Title';
import { createFeedbackHandler } from './utils/createFeedbackHandler';
import { hasRenderableContent } from './utils/hasRenderableContent';
import {
  normalizeBubbleClassNames,
  normalizeBubbleStyles,
} from './utils/normalizeBubbleStyles';
import { normalizeMessageContent } from './utils/normalizeMessageContent';
import { runRender } from './utils/runRender';

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
    quote?: QuoteProps;
  }
> = memo((props) => {
  const { className, style, bubbleRenderConfig, originData, quote } = props;
  const styles = useMemo(
    () => normalizeBubbleStyles(props.styles),
    [props.styles],
  );
  const classNames = useMemo(
    () => normalizeBubbleClassNames(props.classNames),
    [props.classNames],
  );

  const [hidePadding, setHidePadding] = React.useState(false);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const context = useContext(BubbleConfigContext);
  const { compact, standalone, extraShowOnHover } = context || {};
  const effectiveExtraShowOnHover = extraShowOnHover ?? true;
  const bubbleContext = useMemo(
    () => ({
      ...context,
      compact,
      standalone: !!standalone,
      extraShowOnHover: effectiveExtraShowOnHover,
      bubble: props as NonNullable<typeof context>['bubble'],
    }),
    [context, compact, standalone, effectiveExtraShowOnHover, props],
  );
  const setMessage = useCallback<
    NonNullable<React.ContextType<typeof MessagesContext>['setMessage']>
  >(
    (message) => {
      props.bubbleRef?.current?.setMessageItem?.(props.id!, message);
    },
    [props.bubbleRef, props.id],
  );
  const messageContext = useMemo(
    () => ({ message: originData, hidePadding, setHidePadding, setMessage }),
    [originData, hidePadding, setMessage],
  );

  const prefixClass = getPrefixCls('agentic');
  const { hashId } = useStyle(prefixClass, classNames);

  const time = originData?.createAt ?? props.time;
  const avatar = useMemo(
    () => ({ ...props.avatar, ...originData?.meta }),
    [props.avatar, originData?.meta],
  );
  const placement = USER_PLACEMENT;
  const hasFileMap = (originData?.fileMap?.size || 0) > 0;

  const rawContent = normalizeMessageContent(originData?.content);
  const { blocks: filemapBlocks, stripped: strippedContent } = useFilemapBlocks(
    typeof rawContent === 'string' ? rawContent : '',
  );
  if (bubbleRenderConfig?.render === false) return null;

  const quoteElement =
    quote && hasRenderableContent(quote.quoteDescription) ? (
      <Quote {...quote} />
    ) : null;
  const hasDefaultTitle = time != null || hasRenderableContent(quoteElement);

  const titleDom = runRender(
    bubbleRenderConfig?.titleRender,
    props,
    hasDefaultTitle ? (
      <BubbleTitle
        quote={quoteElement}
        bubbleNameClassName={classNames?.bubbleNameClassName}
        bubbleNameStyle={styles?.bubbleNameStyle}
        className={classNames?.bubbleListItemTitleClassName}
        style={styles?.bubbleListItemTitleStyle}
        prefixClass={clsx(`${prefixClass}-bubble-title`)}
        title={''}
        placement={placement}
        time={time}
      />
    ) : null,
  );
  const avatarDom =
    typeof bubbleRenderConfig?.avatarRender === 'function'
      ? runRender(
          bubbleRenderConfig.avatarRender,
          props,
          <BubbleAvatar
            className={classNames?.bubbleListItemAvatarClassName}
            avatar={avatar?.avatar}
            background={avatar?.backgroundColor}
            title={avatar.title ?? avatar.name}
            onClick={props.onAvatarClick}
            prefixCls={`${prefixClass}-bubble-avatar`}
            style={styles?.bubbleListItemAvatarStyle}
          />,
        )
      : null;

  const messageContent = (
    <BubbleMessageDisplay
      styles={styles}
      classNames={classNames}
      markdownRenderConfig={props.markdownRenderConfig}
      renderMode={props.renderMode}
      renderType={props.renderType}
      docListProps={props.docListProps}
      bubbleListRef={props.bubbleListRef}
      bubbleListItemExtraStyle={styles?.bubbleListItemExtraStyle}
      bubbleRef={props.bubbleRef}
      content={filemapBlocks.length > 0 ? strippedContent : rawContent}
      key={originData?.id}
      data-id={originData?.id}
      avatar={avatar}
      readonly={props.readonly}
      onReply={props.onReply}
      onLike={props.onLike}
      onDisLike={props.onDisLike}
      onDislike={props.onDislike}
      onCancelLike={props.onCancelLike}
      onLikeCancel={props.onLikeCancel}
      id={props.id}
      originData={originData}
      placement={placement}
      time={originData?.updateAt ?? originData?.createAt ?? props.time}
      customConfig={bubbleRenderConfig?.customConfig ?? props.customConfig}
      pure={props.pure}
      shouldShowCopy={props.shouldShowCopy}
      useSpeech={props.useSpeech}
      shouldShowVoice={props.shouldShowVoice}
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
  const afterDom =
    hasRenderableContent(contentAfterDom) &&
    (styles?.bubbleListItemAfterStyle ||
      classNames?.bubbleListItemAfterClassName) ? (
      <div
        className={clsx(
          `${prefixClass}-bubble-after`,
          `${prefixClass}-bubble-after-${placement}`,
          `${prefixClass}-bubble-after-user`,
          classNames?.bubbleListItemAfterClassName,
          hashId,
        )}
        style={styles?.bubbleListItemAfterStyle}
        data-testid="message-custom-after"
      >
        {contentAfterDom}
      </div>
    ) : (
      contentAfterDom
    );

  const contentContainerStyle = getContentContainerStyle();
  const fileViewStyle = getFileViewStyle(
    standalone,
    styles?.bubbleListItemAfterStyle ?? styles?.bubbleListItemExtraStyle,
  );
  const contentStyle = getContentStyle(
    standalone,
    styles?.bubbleListItemContentStyle,
  );

  const itemDom = (
    <BubbleConfigContext.Provider value={bubbleContext}>
      <Flex
        className={clsx(
          hashId,
          className,
          `${prefixClass}-bubble`,
          `${prefixClass}-bubble-${placement}`,
          `${prefixClass}-bubble-user`,
          { [`${prefixClass}-bubble-compact`]: compact },
          classNames?.bubbleClassName,
        )}
        style={{ ...style, ...styles?.bubbleStyle }}
        vertical
        id={props.id}
        data-id={props.id}
        gap={BUBBLE_GAP}
      >
        <div
          style={{
            ...style,
            ...contentContainerStyle,
            ...styles?.bubbleContainerStyle,
          }}
          className={clsx(
            `${prefixClass}-bubble-container`,
            `${prefixClass}-bubble-container-${placement}`,
            `${prefixClass}-bubble-container-user`,
            { [`${prefixClass}-bubble-container-pure`]: props.pure },
            classNames?.bubbleContainerClassName,
            hashId,
          )}
          data-testid="chat-message"
        >
          {hasRenderableContent(titleDom) || hasRenderableContent(avatarDom) ? (
            <div
              style={styles?.bubbleAvatarTitleStyle}
              data-testid="bubble-avatar-title"
              className={clsx(
                `${prefixClass}-bubble-avatar-title`,
                `${prefixClass}-bubble-avatar-title-${placement}`,
                `${prefixClass}-bubble-avatar-title-user`,
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
              {avatarDom}
            </div>
          ) : null}
          {hasRenderableContent(contentBeforeDom) && (
            <div
              style={
                styles?.bubbleListItemBeforeStyle ??
                styles?.bubbleListItemExtraStyle
              }
              className={clsx(
                `${prefixClass}-bubble-before`,
                `${prefixClass}-bubble-before-${placement}`,
                `${prefixClass}-bubble-before-user`,
                classNames?.bubbleListItemBeforeClassName,
                hashId,
              )}
              data-testid="message-before"
            >
              {contentBeforeDom}
            </div>
          )}
          {hasRenderableContent(childrenDom) ? (
            <div
              style={contentStyle}
              className={clsx(
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
          ) : null}
          {afterDom}
        </div>
        {hasFileMap && (
          <div
            style={{ ...fileViewStyle, alignSelf: 'flex-end' }}
            className={clsx(
              `${prefixClass}-bubble-after`,
              `${prefixClass}-bubble-after-${placement}`,
              `${prefixClass}-bubble-after-user`,
              classNames?.bubbleListItemAfterClassName,
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
        {filemapBlocks.length > 0 && (
          <ContentFilemapView
            blocks={filemapBlocks}
            fileViewConfig={props.fileViewConfig}
            fileViewEvents={props.fileViewEvents}
            fileMapConfig={props.markdownRenderConfig?.fileMapConfig}
            placement={placement}
            style={{ alignSelf: 'flex-end' }}
          />
        )}
      </Flex>
    </BubbleConfigContext.Provider>
  );

  return (
    <MessagesContext.Provider value={messageContext}>
      <>
        {bubbleRenderConfig?.render?.(
          props,
          {
            avatar: avatarDom,
            title: titleDom,
            header:
              hasRenderableContent(titleDom) ||
              hasRenderableContent(avatarDom) ? (
                <>
                  {titleDom}
                  {avatarDom}
                </>
              ) : null,
            extra:
              props.bubbleRenderConfig?.extraRender === false ? null : (
                <BubbleExtra
                  pure
                  style={styles?.bubbleListItemExtraStyle}
                  className={classNames?.bubbleListItemExtraClassName}
                  readonly={props.readonly}
                  rightRender={props.bubbleRenderConfig?.extraRightRender}
                  shouldShowCopy={props.shouldShowCopy}
                  useSpeech={props.useSpeech}
                  shouldShowVoice={props.shouldShowVoice}
                  onReply={props.onReply}
                  onCancelLike={props.onCancelLike}
                  onLikeCancel={props.onLikeCancel}
                  onLike={createFeedbackHandler(
                    props,
                    props.onLike,
                    'thumbsUp',
                  )}
                  onDisLike={createFeedbackHandler(
                    props,
                    props.onDisLike,
                    'thumbsDown',
                  )}
                  onDislike={createFeedbackHandler(
                    props,
                    props.onDislike,
                    'thumbsDown',
                  )}
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
}, bubblePropsAreEqual);
