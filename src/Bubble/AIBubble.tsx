import { memo, useCallback, useContext, useMemo, useRef } from 'react';

import { ConfigProvider, Flex } from 'antd';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import React from 'react';
import { WhiteBoxProcessInterface } from '../ThoughtChainList/types';
import { BubbleAvatar } from './Avatar';
import { BubbleBeforeNode } from './BubbleBeforeNode';
import { BubbleConfigContext } from './BubbleConfigProvide';
import { bubblePropsAreEqual } from './bubblePropsAreEqual';
import { ContentFilemapView } from './ContentFilemapView';
import { BubbleFileView } from './FileView';
import { BubbleMessageDisplay, LOADING_FLAT } from './MessagesContent';
import { MessagesContext } from './MessagesContent/BubbleContext';
import { BubbleExtra } from './MessagesContent/BubbleExtra';
import { useStyle } from './style';
import { BubbleTitle } from './Title';
import type { BubbleProps } from './type';
import { useFilemapBlocks } from './useFilemapBlocks';
import { createFeedbackHandler } from './utils/createFeedbackHandler';
import { hasRenderableContent } from './utils/hasRenderableContent';
import {
  normalizeBubbleClassNames,
  normalizeBubbleStyles,
} from './utils/normalizeBubbleStyles';
import { normalizeMessageContent } from './utils/normalizeMessageContent';
import { runRender } from './utils/runRender';

export { runRender } from './utils/runRender';

const AI_PLACEMENT = 'left' as const;

const isSameRoleAsPrevious = (preMessage: any, originData: any) => {
  if (!preMessage?.role || !originData?.role) return false;
  return preMessage.role === originData.role;
};

const getTaskList = (whiteBoxProcess: unknown): WhiteBoxProcessInterface[] => {
  return ([whiteBoxProcess].flat(2) as WhiteBoxProcessInterface[]).filter(
    (item) => item?.info,
  );
};

/** @internal 供单测覆盖 placement !== 'left' 等分支 */
export const shouldRenderBeforeContent = (
  placement: string,
  role: string | undefined,
  thoughtChainConfig: any,
  taskListLength: number,
) => {
  if (placement !== 'left') return false;
  if (role === 'bot') return false;
  if (thoughtChainConfig?.enable === false) return false;
  if (taskListLength < 1 && !thoughtChainConfig?.alwaysRender) return false;
  return true;
};

/**
 * AIBubble 组件
 *
 * 显示AI助手发送的消息，采用左侧布局，支持完整交互功能
 *
 * @example
 * ```tsx
 * <AIBubble
 *   avatar={{ avatar: "url", title: "AI助手" }}
 *   time={new Date()}
 * >
 *   AI回复内容
 * </AIBubble>
 * ```
 */
export const AIBubble: React.FC<
  BubbleProps & {
    deps?: any[];
  }
> = memo((props) => {
  const {
    onAvatarClick,
    className,
    style,
    bubbleRenderConfig,
    originData,
    preMessage,
  } = props;
  const styles = useMemo(
    () => normalizeBubbleStyles(props.styles),
    [props.styles],
  );
  const classNames = useMemo(
    () => normalizeBubbleClassNames(props.classNames),
    [props.classNames],
  );

  const [hidePadding, setHidePadding] = React.useState(false);
  const messageDisplayKeyRef = useRef<string | null>(null);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const context = useContext(BubbleConfigContext);
  const { compact, standalone, extraShowOnHover } = context || {};
  const bubbleContext = useMemo(
    () => ({
      ...context,
      compact,
      standalone: !!standalone,
      extraShowOnHover,
      bubble: props as NonNullable<typeof context>['bubble'],
    }),
    [context, compact, standalone, extraShowOnHover, props],
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
  const { hashId } = useStyle(prefixClass);
  const rawContent = normalizeMessageContent(originData?.content);
  const avatar = useMemo(
    () => ({ ...props.avatar, ...originData?.meta }),
    [props.avatar, originData?.meta],
  );
  const { blocks: filemapBlocks, stripped: strippedContent } = useFilemapBlocks(
    typeof rawContent === 'string' ? rawContent : '',
  );
  const whiteBoxProcess = originData?.extra?.white_box_process;
  const taskList = useMemo(
    () => getTaskList(whiteBoxProcess),
    [whiteBoxProcess],
  );
  if (bubbleRenderConfig?.render === false) return null;

  const preMessageSameRole = isSameRoleAsPrevious(preMessage, originData);
  const time = originData?.createAt ?? props.time;
  const placement = AI_PLACEMENT;
  const title = avatar.title ?? avatar.name;
  const hasDefaultTitle = hasRenderableContent(title) || time != null;

  const titleDom = runRender(
    bubbleRenderConfig?.titleRender,
    props,
    hasDefaultTitle ? (
      <BubbleTitle
        bubbleNameClassName={classNames?.bubbleNameClassName}
        bubbleNameStyle={styles?.bubbleNameStyle}
        className={classNames?.bubbleListItemTitleClassName}
        style={styles?.bubbleListItemTitleStyle}
        prefixClass={clsx(`${prefixClass}-bubble-title`)}
        title={title}
        placement={placement}
        time={time}
      />
    ) : null,
  );

  const avatarDom = runRender(
    bubbleRenderConfig?.avatarRender,
    props,
    <BubbleAvatar
      className={classNames?.bubbleListItemAvatarClassName}
      avatar={avatar?.avatar}
      background={avatar?.backgroundColor}
      title={title}
      onClick={onAvatarClick}
      prefixCls={`${prefixClass}-bubble-avatar`}
      style={styles?.bubbleListItemAvatarStyle}
    />,
  );

  const id = props.originData?.id;
  if (id === undefined || id === LOADING_FLAT) {
    if (!messageDisplayKeyRef.current) {
      messageDisplayKeyRef.current = nanoid();
    }
  }
  if (!messageDisplayKeyRef.current && !id) {
    messageDisplayKeyRef.current = nanoid();
  }
  const messageDisplayKey = messageDisplayKeyRef.current ?? id!;

  const contentForDisplay =
    filemapBlocks.length > 0 ? strippedContent : rawContent;

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
      content={contentForDisplay}
      key={messageDisplayKey}
      data-id={props.originData?.id}
      avatar={avatar}
      readonly={props.readonly}
      onReply={props.onReply}
      id={props.id}
      originData={props.originData}
      placement={placement}
      time={
        props.originData?.updateAt ?? props.originData?.createAt ?? props.time
      }
      onDisLike={props.onDisLike}
      onDislike={props.onDislike}
      onLike={props.onLike}
      customConfig={
        props.bubbleRenderConfig?.customConfig ?? props.customConfig
      }
      pure={props.pure}
      onCancelLike={props.onCancelLike}
      onLikeCancel={props.onLikeCancel}
      shouldShowCopy={props.shouldShowCopy}
      fileViewEvents={props.fileViewEvents}
      fileViewConfig={props.fileViewConfig}
      renderFileMoreAction={props.renderFileMoreAction}
      shouldShowVoice={props.shouldShowVoice}
      useSpeech={props.useSpeech}
      bubbleRenderConfig={props.bubbleRenderConfig}
    />
  );

  const hasFileMap = (props.originData?.fileMap?.size || 0) > 0;

  const fileViewDom = hasFileMap ? (
    <div
      style={{
        minWidth: standalone ? 'min(296px,100%)' : '0px',
        paddingLeft: 12,
        maxWidth: '100%',
        ...(styles?.bubbleListItemAfterStyle ??
          styles?.bubbleListItemExtraStyle),
      }}
      className={clsx(
        `${prefixClass}-bubble-after`,
        `${prefixClass}-bubble-after-${placement}`,
        `${prefixClass}-bubble-after-ai`,
        classNames?.bubbleListItemAfterClassName,
        hashId,
      )}
      data-testid="message-after"
    >
      <BubbleFileView
        placement={placement}
        bubbleListRef={props.bubbleListRef}
        bubble={props as any}
      />
    </div>
  ) : null;

  const childrenDom = runRender(
    bubbleRenderConfig?.contentRender,
    props,
    messageContent,
  );

  const shouldShowBeforeContent = shouldRenderBeforeContent(
    placement,
    originData?.role,
    context?.thoughtChain,
    taskList.length,
  );

  const beforeContent = shouldShowBeforeContent ? (
    <BubbleBeforeNode bubble={{ ...props, placement }} taskList={taskList} />
  ) : null;

  const contentBeforeDom = runRender(
    bubbleRenderConfig?.contentBeforeRender,
    props,
    beforeContent,
  );

  const contentAfterDom = runRender(
    bubbleRenderConfig?.contentAfterRender,
    props,
    null,
  );
  const hasHeader =
    hasRenderableContent(avatarDom) || hasRenderableContent(titleDom);
  const hasBody = [
    contentBeforeDom,
    childrenDom,
    fileViewDom,
    contentAfterDom,
  ].some(hasRenderableContent);
  const afterDom =
    hasRenderableContent(contentAfterDom) &&
    (styles?.bubbleListItemAfterStyle ||
      classNames?.bubbleListItemAfterClassName) ? (
      <div
        className={clsx(
          `${prefixClass}-bubble-after`,
          `${prefixClass}-bubble-after-${placement}`,
          `${prefixClass}-bubble-after-ai`,
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

  const itemDom = (
    <BubbleConfigContext.Provider value={bubbleContext}>
      <Flex
        className={clsx(
          hashId,
          className,
          `${prefixClass}-bubble`,
          `${prefixClass}-bubble-${placement}`,
          `${prefixClass}-bubble-ai`, // 添加AI消息特定的类名
          {
            [`${prefixClass}-bubble-compact`]: compact,
          },
          classNames?.bubbleClassName,
        )}
        style={{ ...style, ...styles?.bubbleStyle }}
        vertical
        id={props.id}
        data-id={props.id}
        gap={12}
      >
        <div
          style={{
            ...style,
            display: 'flex',
            gap: 4,
            flexDirection: 'column',
            alignItems: 'flex-start',
            ...styles?.bubbleContainerStyle,
          }}
          className={clsx(
            `${prefixClass}-bubble-container`,
            `${prefixClass}-bubble-container-${placement}`,
            `${prefixClass}-bubble-container-ai`,
            {
              [`${prefixClass}-bubble-container-pure`]: props.pure,
            },
            classNames?.bubbleContainerClassName,
            hashId,
          )}
          data-testid="chat-message"
        >
          {!preMessageSameRole && hasHeader ? (
            <div
              style={{
                ...(hasBody ? { marginBlockEnd: 4 } : {}),
                ...styles?.bubbleAvatarTitleStyle,
              }}
              data-testid="bubble-avatar-title"
              className={clsx(
                `${prefixClass}-bubble-avatar-title`,
                `${prefixClass}-bubble-avatar-title-${placement}`,
                `${prefixClass}-bubble-avatar-title-ai`, // AI消息头像标题特定样式
                classNames?.bubbleAvatarTitleClassName,
                hashId,
                {
                  [`${prefixClass}-bubble-avatar-title-pure`]: props.pure,
                },
              )}
            >
              {avatarDom}
              {titleDom}
            </div>
          ) : null}
          {hasRenderableContent(contentBeforeDom) ? (
            <div
              style={
                styles?.bubbleListItemBeforeStyle ??
                styles?.bubbleListItemExtraStyle
              }
              className={clsx(
                `${prefixClass}-bubble-before`,
                `${prefixClass}-bubble-before-${placement}`,
                `${prefixClass}-bubble-before-ai`, // AI消息 before 特定样式
                classNames?.bubbleListItemBeforeClassName,
                hashId,
              )}
              data-testid="message-before"
            >
              {contentBeforeDom}
            </div>
          ) : null}
          {hasRenderableContent(childrenDom) ? (
            <div
              style={{
                minWidth: standalone ? 'min(16px,100%)' : '0px',
                ...styles?.bubbleListItemContentStyle,
              }}
              className={clsx(
                `${prefixClass}-bubble-content`,
                `${prefixClass}-bubble-content-${placement}`,
                `${prefixClass}-bubble-content-ai`, // AI消息内容特定样式
                {
                  [`${prefixClass}-bubble-content-pure`]: props.pure,
                },
                classNames?.bubbleListItemContentClassName,
                hashId,
              )}
              onDoubleClick={props.onDoubleClick}
              data-testid="message-content"
            >
              {childrenDom}
            </div>
          ) : null}
          {fileViewDom}
          {afterDom}
        </div>
        {filemapBlocks.length > 0 && (
          <ContentFilemapView
            blocks={filemapBlocks}
            fileViewConfig={props.fileViewConfig}
            fileViewEvents={props.fileViewEvents}
            fileMapConfig={props.markdownRenderConfig?.fileMapConfig}
            placement={placement}
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
            avatar: <BubbleAvatar avatar={avatar?.avatar} title={title} />,
            title: titleDom,
            header: hasHeader ? (
              <div
                style={styles?.bubbleAvatarTitleStyle}
                className={clsx(
                  `${prefixClass}-bubble-avatar-title`,
                  `${prefixClass}-bubble-avatar-title-${placement}`,
                  `${prefixClass}-bubble-avatar-title-ai`,
                  classNames?.bubbleAvatarTitleClassName,
                  hashId,
                )}
              >
                {avatarDom}
                {titleDom}
              </div>
            ) : null,
            extra:
              props.bubbleRenderConfig?.extraRender === false ? null : (
                <BubbleExtra
                  pure
                  style={styles?.bubbleListItemExtraStyle}
                  className={classNames?.bubbleListItemExtraClassName}
                  readonly={props.readonly}
                  rightRender={props.bubbleRenderConfig?.extraRightRender}
                  onReply={props.onReply}
                  onCancelLike={props.onCancelLike}
                  onLikeCancel={props.onLikeCancel}
                  shouldShowCopy={props.shouldShowCopy}
                  useSpeech={props.useSpeech}
                  shouldShowVoice={props.shouldShowVoice}
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
                  onLike={createFeedbackHandler(
                    props,
                    props.onLike,
                    'thumbsUp',
                  )}
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
