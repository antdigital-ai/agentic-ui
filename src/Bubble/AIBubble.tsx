import { memo, MutableRefObject, useContext } from 'react';

import { ConfigProvider, Flex } from 'antd';
import cx from 'classnames';
import React from 'react';
import { WhiteBoxProcessInterface } from '../ThoughtChainList/types';
import { BubbleAvatar } from './Avatar';
import { BubbleBeforeNode } from './BubbleBeforeNode';
import { BubbleConfigContext } from './BubbleConfigProvide';
import { BubbleFileView } from './FileView';
import { BubbleMessageDisplay } from './MessagesContent';
import { MessagesContext } from './MessagesContent/BubbleContext';
import { BubbleExtra } from './MessagesContent/BubbleExtra';
import { useStyle } from './style';
import { BubbleTitle } from './Title';
import type { BubbleMetaData, BubbleProps } from './type';

const AI_PLACEMENT = 'left' as const;

export const runRender = (
  render: any,
  props: BubbleProps,
  defaultDom: React.ReactNode,
  ...rest: undefined[]
) => {
  return render ? render(props, defaultDom, ...rest) : defaultDom;
};

const isSameRoleAsPrevious = (preMessage: any, originData: any) => {
  if (!preMessage?.role || !originData?.role) return false;
  return preMessage.role === originData.role;
};

const getTaskList = (originData: any): WhiteBoxProcessInterface[] => {
  return (
    [originData?.extra?.white_box_process].flat(2) as WhiteBoxProcessInterface[]
  ).filter((item) => item?.info);
};

const shouldRenderBeforeContent = (
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
    bubbleRef?: MutableRefObject<any | undefined>;
  }
> = memo((props) => {
  const {
    onAvatarClick,
    className,
    style,
    bubbleRenderConfig,
    classNames,
    styles,
    originData,
    preMessage,
  } = props;

  const [hidePadding, setHidePadding] = React.useState(false);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const context = useContext(BubbleConfigContext);
  const { compact, standalone, locale } = context || {};

  const prefixClass = getPrefixCls('agentic');
  const { wrapSSR, hashId } = useStyle(prefixClass);

  const preMessageSameRole = isSameRoleAsPrevious(preMessage, originData);
  const time = originData?.createAt || props.time;
  const avatar = originData?.meta || props.avatar;
  const placement = AI_PLACEMENT;

  const titleDom = runRender(
    bubbleRenderConfig?.titleRender,
    props,
    <BubbleTitle
      bubbleNameClassName={classNames?.bubbleNameClassName}
      className={classNames?.bubbleListItemTitleClassName}
      style={styles?.bubbleListItemTitleStyle}
      prefixClass={cx(`${prefixClass}-bubble-title`)}
      title={avatar?.title || avatar?.name}
      placement={placement}
      time={time}
    />,
  );

  const avatarDom = runRender(
    bubbleRenderConfig?.avatarRender,
    props,
    <BubbleAvatar
      className={classNames?.bubbleListItemAvatarClassName}
      avatar={avatar?.avatar}
      background={avatar?.backgroundColor}
      title={avatar?.title || avatar?.name}
      onClick={onAvatarClick}
      prefixCls={`${prefixClass}-bubble-avatar`}
      style={styles?.bubbleListItemAvatarStyle}
    />,
  );

  const messageContent = (
    <BubbleMessageDisplay
      markdownRenderConfig={props.markdownRenderConfig}
      docListProps={props.docListProps}
      bubbleListRef={props.bubbleListRef}
      bubbleListItemExtraStyle={styles?.bubbleListItemExtraStyle}
      bubbleRef={props.bubbleRef}
      content={props?.originData?.content}
      key={props?.originData?.id}
      data-id={props?.originData?.id}
      avatar={props?.originData?.meta as BubbleMetaData}
      readonly={props.readonly ?? false}
      onReply={props.onReply}
      id={props.id}
      originData={props.originData}
      placement={placement}
      time={props.originData?.updateAt || props.originData?.createAt}
      onDisLike={props.onDisLike}
      onLike={props.onLike}
      customConfig={props?.bubbleRenderConfig?.customConfig}
      pure={props.pure}
      onCancelLike={props.onCancelLike}
      shouldShowCopy={props.shouldShowCopy}
      fileViewEvents={props.fileViewEvents}
      fileViewConfig={props.fileViewConfig}
      renderFileMoreAction={props.renderFileMoreAction}
      shouldShowVoice={props.shouldShowVoice}
      bubbleRenderConfig={props.bubbleRenderConfig}
      contentAfterDom={
        (props?.originData?.fileMap?.size || 0) > 0 ? (
          <div
            style={{
              minWidth: standalone ? 'min(296px,100%)' : '0px',
              paddingLeft: 12,
              maxWidth: '100%',
              width: '100%',
              ...styles?.bubbleListItemExtraStyle,
            }}
            className={cx(
              `${prefixClass}-bubble-after`,
              `${prefixClass}-bubble-after-${placement}`,
              `${prefixClass}-bubble-after-ai`, // AI消息 after 特定样式
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
        ) : null
      }
    />
  );

  const childrenDom = runRender(
    bubbleRenderConfig?.contentRender,
    props,
    messageContent,
  );

  const taskList = getTaskList(originData);
  const shouldShowBeforeContent = shouldRenderBeforeContent(
    placement,
    originData?.role,
    context?.thoughtChain,
    taskList.length,
  );

  const beforeContent = shouldShowBeforeContent ? (
    <BubbleBeforeNode bubble={props as any} />
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
          `${prefixClass}-bubble-ai`, // 添加AI消息特定的类名
          {
            [`${prefixClass}-bubble-compact`]: compact,
          },
          classNames?.bubbleClassName,
        )}
        style={style}
        vertical
        id={props.id}
        data-id={props.id}
        gap={12}
      >
        <div
          style={style}
          className={cx(
            `${prefixClass}-bubble-container`,
            `${prefixClass}-bubble-container-${placement}`,
            {
              [`${prefixClass}-bubble-container-pure`]: props.pure,
            },
            hashId,
          )}
        >
          {preMessageSameRole ? null : (
            <div
              className={cx(
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
          )}
          <div
            style={{
              display: 'flex',
              gap: 4,
              flexDirection: 'column',
              alignItems: 'flex-start', // AI消息内容左对齐
            }}
            className={cx(
              `${prefixClass}-bubble-container`,
              `${prefixClass}-bubble-container-${placement}`,
              `${prefixClass}-bubble-container-ai`, // AI消息容器特定样式
              {
                [`${prefixClass}-bubble-container-pure`]: props.pure,
              },
              classNames?.bubbleContainerClassName,
              hashId,
            )}
            data-testid="chat-message"
          >
            {contentBeforeDom ? (
              <div
                style={styles?.bubbleListItemExtraStyle}
                className={cx(
                  `${prefixClass}-bubble-before`,
                  `${prefixClass}-bubble-before-${placement}`,
                  `${prefixClass}-bubble-before-ai`, // AI消息 before 特定样式
                  hashId,
                )}
                data-testid="message-before"
              >
                {contentBeforeDom}
              </div>
            ) : null}
            <div
              style={{
                minWidth: standalone ? 'min(16px,100%)' : '0px',
                ...styles?.bubbleListItemContentStyle,
              }}
              className={cx(
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
            avatar: (
              <BubbleAvatar
                avatar={avatar?.avatar}
                title={avatar?.title || avatar?.name}
              />
            ),
            title: titleDom,
            header: (
              <div
                className={cx(
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
            ),
            extra:
              props?.bubbleRenderConfig?.extraRender === false ? null : (
                <BubbleExtra
                  pure
                  style={props.styles?.bubbleListItemExtraStyle}
                  readonly={props.readonly}
                  rightRender={props?.bubbleRenderConfig?.extraRightRender}
                  onReply={props.onReply}
                  onCancelLike={props.onCancelLike}
                  shouldShowCopy={props.shouldShowCopy}
                  useSpeech={props.useSpeech}
                  shouldShowVoice={props.shouldShowVoice}
                  onDisLike={
                    props.onDisLike
                      ? async () => {
                          try {
                            await props.onDisLike?.(props.originData as any);
                            props.bubbleRef?.current?.setMessageItem?.(
                              props.id!,
                              {
                                feedback: 'thumbsDown',
                              } as any,
                            );
                          } catch (error) {}
                        }
                      : undefined
                  }
                  bubble={props as any}
                  onLike={
                    props.onLike
                      ? async () => {
                          try {
                            await props.onLike?.(props.originData as any);
                            props.bubbleRef?.current?.setMessageItem?.(
                              props.id!,
                              {
                                feedback: 'thumbsUp',
                              } as any,
                            );
                          } catch (error) {}
                        }
                      : undefined
                  }
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
