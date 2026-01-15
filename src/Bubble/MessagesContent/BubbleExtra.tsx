import {
  CopyLottie,
  DislikeLottie,
  LikeLottie,
  RefreshLottie,
} from '@ant-design/agentic-ui';
import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import { ConfigProvider, Divider } from 'antd';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import { motion } from 'framer-motion';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { Loading } from '../../Components/Loading';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { BubbleExtraProps } from '../types/BubbleExtra';
import { CopyButton } from './CopyButton';
import { VoiceButton } from './VoiceButton';

/**
 * BubbleExtra 组件用于显示聊天项的额外操作按钮，如点赞、踩、复制等。
 *
 * @param {BubbleExtraProps} props - 组件的属性。
 * @param {Function} props.onReply - 回复操作的回调函数。
 * @param {Object} props.bubble - 聊天项的数据对象。
 * @param {boolean} props.readonly - 是否为只读模式。
 * @param {Function} [props.onLike] - 点赞操作的回调函数。
 * @param {Function} [props.onDislike] - 踩操作的回调函数（符合命名规范）
 * @param {Function} [props.onDisLike] - 踩操作的回调函数（已废弃，请使用 onDislike）
 *
 * @returns {JSX.Element} 返回一个包含操作按钮的 JSX 元素。
 *
 * @example
 * ```tsx
 * <BubbleExtra
 *   onReply={handleReply}
 *   bubble={bubbleData}
 *   readonly={false}
 *   onLike={handleLike}
 *   onDisLike={handleDisLike}
 * />
 * ```
 */
export const BubbleExtra = ({
  onReply,
  bubble,
  readonly,
  pure,
  placement,
  ...props
}: BubbleExtraProps) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const context = useContext(BubbleConfigContext);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // 获取聊天项的原始数据
  const originalData = bubble?.originData;

  const prefixCls = getPrefixCls('chat-item-extra');

  // 判断是否已经点过赞或踩
  const alreadyFeedback = ['thumbsDown', 'thumbsUp'].includes(
    originalData?.feedback || '',
  );

  // 判断是否应该显示点赞
  const shouldShowLike =
    !originalData?.extra?.answerStatus &&
    !readonly &&
    (props.onLike || originalData?.feedback) &&
    originalData?.feedback !== 'thumbsDown';

  // 判断是否应该显示踩
  const shouldShowDisLike =
    !originalData?.extra?.answerStatus &&
    !readonly &&
    (props.onDislike || props.onDisLike || originalData?.feedback) &&
    originalData?.feedback !== 'thumbsUp';

  // 获取点赞按钮的标题文本
  const likeButtonTitle = useMemo(() => {
    if (alreadyFeedback && originalData?.feedback === 'thumbsUp') {
      // 已经点赞的情况
      if (props.onLikeCancel || props.onCancelLike) {
        return context?.locale?.['chat.message.cancel-like'] || '取消点赞';
      } else {
        return (
          context?.locale?.['chat.message.feedback-success'] || '已经反馈过了哦'
        );
      }
    } else {
      // 未点赞的情况
      return context?.locale?.['chat.message.like'] || '喜欢';
    }
  }, [
    alreadyFeedback,
    originalData?.feedback,
    !!(props.onLikeCancel || props.onCancelLike),
    context?.locale,
  ]);

  // 获取点踩按钮的标题文本
  const getDislikeButtonTitle = useMemo(() => {
    if (alreadyFeedback) {
      return (
        context?.locale?.['chat.message.feedback-success'] || '已经反馈过了哦'
      );
    } else {
      return context?.locale?.['chat.message.dislike'] || '不喜欢';
    }
  }, [alreadyFeedback, context?.locale]);

  const typing =
    originalData?.isAborted !== true &&
    originalData?.isFinished === false &&
    originalData?.extra?.isHistory === undefined &&
    originalData?.isFinished !== undefined;

  const like = useMemo(
    () =>
      shouldShowLike && !typing ? (
        <ActionIconBox
          data-testid="like-button"
          active={originalData?.feedback === 'thumbsUp'}
          title={likeButtonTitle}
          onClick={async (e: any) => {
            e?.preventDefault?.();
            e?.stopPropagation?.();
            try {
              // 处理取消点赞
              if (alreadyFeedback) {
                // 如果已经点赞且支持取消点赞
                if (originalData?.feedback === 'thumbsUp') {
                  // 优先使用新的事件名，保持向后兼容
                  if (props.onLikeCancel) {
                    await props.onLikeCancel(bubble.originData as any);
                  } else if (props.onCancelLike) {
                    await props.onCancelLike(bubble.originData as any);
                  }
                }
                return;
              }
              await props.onLike?.();
            } catch (error) {
              // message.error('点赞失败，请重试');
            }
          }}
        >
          {(isHovered) =>
            originalData?.feedback === 'thumbsUp' ? (
              <LikeFilled />
            ) : (
              <LikeLottie active={isHovered} />
            )
          }
        </ActionIconBox>
      ) : null,
    [
      shouldShowLike,
      alreadyFeedback,
      originalData?.isFinished,
      typing,
      feedbackLoading,
      props.onLikeCancel || props.onCancelLike,
    ],
  );

  const disLike = useMemo(
    () =>
      shouldShowDisLike && !typing ? (
        <ActionIconBox
          data-testid="dislike-button"
          loading={feedbackLoading}
          onLoadingChange={setFeedbackLoading}
          title={getDislikeButtonTitle}
          onClick={async () => {
            try {
              if (alreadyFeedback) {
                // message.error('您已经点过赞或踩了');
                return;
              }
              // 优先使用新的事件名，保持向后兼容
              if (props.onDislike) {
                await props.onDislike();
              } else if (props.onDisLike) {
                await props.onDisLike();
              }
            } catch (error) {}
          }}
        >
          {(isHovered) =>
            originalData?.feedback === 'thumbsDown' ? (
              <DislikeFilled />
            ) : (
              <DislikeLottie active={isHovered} />
            )
          }
        </ActionIconBox>
      ) : null,
    [
      shouldShowDisLike,
      feedbackLoading,
      alreadyFeedback,
      originalData?.isFinished,
      typing,
    ],
  );

  /**
   * 判断是否应该显示复制选项。
   *
   * 复制选项显示需要满足以下条件：
   * 1. 基础条件（必须全部满足）：
   *    - `navigator.clipboard` API 可用。
   *    - 聊天项的原始数据包含内容
   *    - 聊天项的原始数据在额外字段中没有回答状态
   *    - 聊天项的内容不等于本地化的 'chat.message.aborted' 消息或其默认值 '回答已停止生成'
   * 2. 第4个条件：shouldShowCopy 控制
   *    - 如果用户传递了 shouldShowCopy 函数，则调用函数判断
   *    - 如果用户传递了 shouldShowCopy 布尔值，则直接使用该值
   *    - 如果用户未传递 shouldShowCopy（undefined），则默认为 true
   *
   * @constant
   * @type {boolean}
   */
  const shouldShowCopy = useMemo(() => {
    const defaultConditions =
      originalData?.content &&
      !originalData?.extra?.answerStatus &&
      originalData?.content !==
        (context?.locale?.['chat.message.aborted'] || '回答已停止生成');

    if (!defaultConditions) {
      return false;
    }

    if (typeof props.shouldShowCopy === 'function') {
      return props.shouldShowCopy(bubble);
    } else if (typeof props.shouldShowCopy === 'boolean') {
      return props.shouldShowCopy;
    }

    return true;
  }, [
    props.shouldShowCopy,
    bubble,
    originalData?.content,
    originalData?.extra?.answerStatus,
    context?.locale,
  ]);

  const copyDom = useMemo(
    () =>
      shouldShowCopy ? (
        <CopyButton
          data-testid="chat-item-copy-button"
          title={context?.locale?.['chat.message.copy'] || '复制'}
          onClick={() => {
            try {
              copy(bubble.originData?.content || '');
            } catch (error) {
              // 复制失败时静默处理
              console.error('复制失败:', error);
            }
          }}
          showTitle={false}
        >
          {(isHovered) => <CopyLottie active={isHovered} />}
        </CopyButton>
      ) : null,
    [shouldShowCopy, context?.locale, bubble.originData?.content],
  );

  const voiceDom = useMemo(() => {
    /**
     * 判断是否应该显示语音选项。
     *
     * 语音选项显示需要满足以下条件：
     * 基础条件（必须全部满足）：
     *    - 聊天项的原始数据包含内容
     *    - 聊天项的原始数据在额外字段中没有回答状态
     *    - 聊天项的内容不等于本地化的 'chat.message.aborted' 消息或其默认值 '回答已停止生成'
     * */
    const defaultShow =
      !!originalData?.content &&
      !originalData?.extra?.answerStatus &&
      !typing &&
      originalData?.content !==
        (context?.locale?.['chat.message.aborted'] || '回答已停止生成');
    if (!props.shouldShowVoice || !defaultShow) return null;
    return (
      <VoiceButton
        text={bubble.originData?.content || ''}
        defaultRate={1}
        rateOptions={[1.5, 1.25, 1, 0.75]}
        useSpeech={props.useSpeech}
      />
    );
  }, [props.shouldShowVoice, props.useSpeech, bubble.originData?.content]);

  const dom = useMemo(
    () =>
      voiceDom || copyDom || like || disLike ? (
        <motion.div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
          variants={{
            visible: {
              opacity: 1,
              transition: {
                when: 'beforeChildren',
                staggerChildren: 0.1,
                delayChildren: 0.5,
              },
            },
            hidden: {
              opacity: 0,
              transition: {
                when: 'afterChildren',
              },
            },
          }}
          whileInView="visible"
          initial="hidden"
          animate="visible"
          className={classNames(`${prefixCls}-action-box`)}
        >
          {voiceDom ? voiceDom : null}
          {copyDom ? copyDom : null}
          {(voiceDom || copyDom) && (like || disLike) && (
            <Divider
              type="vertical"
              style={{
                margin: '0px 2px',
              }}
            />
          )}
          {like ? like : null}
          {disLike ? disLike : null}
        </motion.div>
      ) : null,
    [voiceDom, copyDom, like, disLike, prefixCls],
  );

  const reSend = useMemo(() => {
    if (originalData?.isAborted && !originalData.isFinished) {
      return (
        <span>
          {context?.locale?.['chat.message.aborted'] || '回答已停止生成'}
        </span>
      );
    }
    if (!originalData?.extra?.preMessage?.content) return null;
    if (typing) return null;

    return (
      <ActionIconBox
        data-testid="reply-button"
        borderLess
        onClick={async () => {
          onReply?.(
            bubble.originData?.extra?.preMessage?.content ||
              context?.locale?.['chat.message.retrySend'] ||
              '重新生成',
          );
        }}
        title={context?.locale?.['chat.message.retrySend'] || '重新生成'}
      >
        {(isHovered) => (
          <div
            style={{
              gap: 4,
              display: 'flex',
              cursor: 'pointer',
              alignItems: 'center',
            }}
          >
            <RefreshLottie active={isHovered} />
            <span>
              {context?.locale?.['chat.message.retrySend'] || '重新生成'}
            </span>
          </div>
        )}
      </ActionIconBox>
    );
  }, [originalData?.isAborted, typing, originalData?.isFinished]);

  useEffect(() => {
    props.onRenderExtraNull?.(!dom && !reSend);
  }, [dom]);

  // 检查是否有任何内容需要渲染
  const hasLeftContent = (typing && originalData.content !== '...') || reSend;

  const rightDom =
    props.rightRender === false
      ? null
      : props.rightRender
        ? props.rightRender?.(
            {
              ...props,
              bubble,
              onReply,
              onRenderExtraNull: props.onRenderExtraNull,
            },
            {
              like,
              disLike,
              copy: copyDom,
              reply: reSend,
            },
          )
        : dom;

  const hasRightContent = originalData?.isAborted
    ? copyDom
    : props.rightRender === false
      ? false
      : !!rightDom;

  // 如果没有任何内容，直接返回 null
  if (!hasLeftContent && !hasRightContent) return null;

  if (!copyDom && originalData?.isAborted && !reSend) {
    return null;
  }
  if (pure) {
    return [reSend, like, disLike, copyDom, voiceDom];
  }
  return (
    <div
      className={prefixCls}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingLeft: placement === 'right' ? 0 : 'var(--padding-5x)',
        paddingRight: placement === 'right' ? 0 : 'var(--padding-5x)',
        paddingTop: placement === 'right' ? 0 : 'var(--padding-1x)',
        paddingBottom: placement === 'right' ? 0 : 'var(--padding-2x)',
        color: 'var(--color-gray-text-secondary)',
        fontSize: context?.compact ? '11px' : '13px',
        gap: 4,
        ...props.style,
      }}
    >
      {typing && originalData.content !== '...' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Loading style={{ fontSize: context?.compact ? 20 : 16 }} />
          <span>{context?.locale?.['chat.message.generating'] || ''}</span>
        </div>
      ) : null}
      {reSend || null}
      {originalData?.isAborted ? copyDom : rightDom}
    </div>
  );
};
