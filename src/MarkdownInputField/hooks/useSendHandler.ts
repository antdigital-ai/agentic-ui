import React from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import type { AttachmentFile } from '../AttachmentButton/types';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseSendHandlerParams {
  props: Pick<
    MarkdownInputFieldProps,
    'disabled' | 'typing' | 'onChange' | 'onSend' | 'allowEmptySubmit'
  >;
  /** 来自 SendButton 的可选额外禁用，独立于 props.disabled */
  sendDisabled?: boolean;
  markdownEditorRef: React.MutableRefObject<MarkdownEditorInstance | undefined>;
  /** 防止快速连续触发 onSend；keyboard / 按钮共用 */
  isSendingRef: React.MutableRefObject<boolean>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  setFileMap?: (fileMap?: Map<string, AttachmentFile>) => void;
  /** 录音中触发发送时需要先停止录音 */
  recording: boolean;
  stopRecording: () => Promise<void>;
}

/**
 * 发送消息处理 Hook。
 *
 * 由原 useMarkdownInputFieldHandlers 拆分而来，专门负责：
 *  - 多重发送守卫（disabled / typing / isLoading / isSendingRef / sendDisabled）
 *  - 录音状态下先停止再发送
 *  - 调用 onSend、清空内容、清空 fileMap、维护 isLoading
 *  - 处理 onSend 抛错时的 console + rethrow
 */
export const useSendHandler = ({
  props,
  sendDisabled,
  markdownEditorRef,
  isSendingRef,
  isLoading,
  setIsLoading,
  value,
  setValue,
  setFileMap,
  recording,
  stopRecording,
}: UseSendHandlerParams) => {
  const sendMessage = useRefFunction(async () => {
    // 整体输入禁用
    if (props.disabled) return;
    if (props.typing) return;
    // 防止重复触发：发送中
    if (isLoading) return;
    // ref 守卫：防止 React 异步 setState 期间被再次触发
    if (isSendingRef.current) return;
    // 发送按钮独立禁用（如未上传完成）
    if (sendDisabled) return;

    // 优先停止录音再发送
    if (recording) await stopRecording();
    const mdValue = markdownEditorRef?.current?.store?.getMDContent();

    // mdValue 与 value 不一致且非空时同步外部状态
    if (mdValue !== value && mdValue) {
      props.onChange?.(mdValue);
    }

    // 纯空白视为空内容：trim 后为空时统一以空串处理，
    // 这样 allowEmptySubmit 场景下「只有空格」与「完全为空」语义一致。
    const trimmedMdValue = (mdValue ?? '').trim();
    const effectiveValue = trimmedMdValue ? mdValue || '' : '';

    // allowEmptySubmit 开启时即使内容为空也允许触发
    if (props.onSend && (props.allowEmptySubmit || trimmedMdValue)) {
      isSendingRef.current = true;
      setIsLoading(true);
      try {
        await props.onSend(effectiveValue);
        markdownEditorRef?.current?.store?.clearContent();
        props.onChange?.('');
        setValue('');
        setFileMap?.(new Map());
      } catch (error) {
        console.error('Send message failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
        isSendingRef.current = false;
      }
    }
  });

  return { sendMessage };
};
