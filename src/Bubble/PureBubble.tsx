import { memo, MutableRefObject, useContext } from 'react';

import { ConfigProvider, Flex } from 'antd';
import cx from 'classnames';
import React from 'react';
import { BaseMarkdownEditor } from '../MarkdownEditor/BaseMarkdownEditor';
import { runRender } from './AIBubble';
import { BubbleAvatar } from './Avatar';
import { BubbleConfigContext } from './BubbleConfigProvide';
import { MessagesContext } from './MessagesContent/BubbleContext';
import { BubbleExtra } from './MessagesContent/BubbleExtra';
import { useStyle } from './style';
import { BubbleTitle } from './Title';
import type { BubbleProps } from './type';

export const PureBubble: React.FC<
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
  } = props;

  const [hidePadding, setHidePadding] = React.useState(false);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const context = useContext(BubbleConfigContext);
  const { compact, standalone, locale } = context || {};

  const prefixClass = getPrefixCls('agentic');
  const { wrapSSR, hashId } = useStyle(prefixClass);

  const placement = (props.placement ?? 'left') as 'left' | 'right';
  const isRightPlacement = placement === 'right';
  const time = originData?.createAt || props.time;
  const avatar = originData?.meta || props.avatar;

  const defaultMarkdown =
    typeof originData?.content === 'string' ? originData.content : '';
  const {
    initValue: configInitValue,
    readonly: configReadonly,
    ...markdownConfig
  } = props.markdownRenderConfig || {};

  const editorInitValue = configInitValue ?? defaultMarkdown;
  const editorReadonly = props.readonly ?? configReadonly ?? false;

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

  const markdownEditorDom = (
    <BaseMarkdownEditor
      {...markdownConfig}
      initValue={editorInitValue}
      readonly={editorReadonly}
    />
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

  const messageContent = runRender(
    bubbleRenderConfig?.contentRender,
    props,
    markdownEditorDom,
  );

  const extraDom =
    bubbleRenderConfig?.extraRender === false ? null : (
      <BubbleExtra
        pure
        style={styles?.bubbleListItemExtraStyle}
        readonly={props.readonly}
        rightRender={props?.bubbleRenderConfig?.extraRightRender}
        onReply={props.onReply}
        onCancelLike={props.onCancelLike}
        onLikeCancel={props.onLikeCancel}
        shouldShowCopy={props.shouldShowCopy}
        useSpeech={props.useSpeech}
        shouldShowVoice={props.shouldShowVoice}
        onDisLike={
          props.onDisLike
            ? async () => {
                try {
                  await props.onDisLike?.(props.originData as any);
                  props.bubbleRef?.current?.setMessageItem?.(props.id!, {
                    feedback: 'thumbsDown',
                  } as any);
                } catch (error) {}
              }
            : undefined
        }
        onDislike={
          props.onDislike
            ? async () => {
                try {
                  await props.onDislike?.(props.originData as any);
                  props.bubbleRef?.current?.setMessageItem?.(props.id!, {
                    feedback: 'thumbsDown',
                  } as any);
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
                  props.bubbleRef?.current?.setMessageItem?.(props.id!, {
                    feedback: 'thumbsUp',
                  } as any);
                } catch (error) {}
              }
            : undefined
        }
      />
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
          `${prefixClass}-bubble-pure`,
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
          <div
            className={cx(
              `${prefixClass}-bubble-avatar-title`,
              `${prefixClass}-bubble-avatar-title-${placement}`,
              `${prefixClass}-bubble-avatar-title-pure`,
              classNames?.bubbleAvatarTitleClassName,
              hashId,
              {
                [`${prefixClass}-bubble-avatar-title-compact`]: compact,
              },
            )}
          >
            {isRightPlacement ? titleDom : avatarDom}
            {isRightPlacement ? avatarDom : titleDom}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 4,
              flexDirection: 'column',
              alignItems: isRightPlacement ? 'flex-end' : 'flex-start',
              ...styles?.bubbleListItemContentStyle,
            }}
            className={cx(
              `${prefixClass}-bubble-content-wrapper`,
              hashId,
              classNames?.bubbleContainerClassName,
            )}
            data-testid="chat-message"
          >
            {contentBeforeDom ? (
              <div
                style={styles?.bubbleListItemExtraStyle}
                className={cx(
                  `${prefixClass}-bubble-before`,
                  `${prefixClass}-bubble-before-${placement}`,
                  hashId,
                )}
                data-testid="message-before"
              >
                {contentBeforeDom}
              </div>
            ) : null}
            <div
              className={cx(
                `${prefixClass}-bubble-content`,
                `${prefixClass}-bubble-content-${placement}`,
                `${prefixClass}-bubble-content-pure`,
                classNames?.bubbleListItemContentClassName,
                hashId,
              )}
              onDoubleClick={props.onDoubleClick}
              data-testid="message-content"
            >
              {messageContent}
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
            avatar: avatarDom,
            title: titleDom,
            header: (
              <div
                className={cx(
                  `${prefixClass}-bubble-avatar-title`,
                  `${prefixClass}-bubble-avatar-title-${placement}`,
                  `${prefixClass}-bubble-avatar-title-pure`,
                  classNames?.bubbleAvatarTitleClassName,
                  hashId,
                )}
              >
                {isRightPlacement ? titleDom : avatarDom}
                {isRightPlacement ? avatarDom : titleDom}
              </div>
            ),
            extra: extraDom,
            messageContent,
            itemDom,
          },
          itemDom,
        ) || itemDom}
      </>
    </MessagesContext.Provider>
  );
});

export const PureAIBubble: React.FC<
  BubbleProps & {
    deps?: any[];
    bubbleRef?: MutableRefObject<any | undefined>;
  }
> = memo((props) => <PureBubble {...props} placement="left" />);

export const PureUserBubble: React.FC<
  BubbleProps & {
    deps?: any[];
    bubbleRef?: MutableRefObject<any | undefined>;
  }
> = memo((props) => <PureBubble {...props} placement="right" />);
