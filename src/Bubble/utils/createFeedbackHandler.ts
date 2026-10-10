import type { BubbleProps, MessageBubbleData } from '../type';

export const createFeedbackHandler = (
  props: BubbleProps,
  callback: BubbleProps['onLike'],
  feedback: 'thumbsUp' | 'thumbsDown',
): (() => Promise<void>) | undefined => {
  if (!callback) return undefined;
  return async () => {
    try {
      await callback(props.originData as MessageBubbleData);
      if (props.id) {
        props.bubbleRef?.current?.setMessageItem?.(props.id, { feedback });
      }
    } catch {
      // 业务回调失败时保留当前反馈，避免与后端状态不一致。
    }
  };
};
