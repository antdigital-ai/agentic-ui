import React from 'react';
import { Editor, Transforms } from 'slate';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import { upLoadFileToServer } from '../AttachmentButton';
import type { AttachmentFile } from '../AttachmentButton/types';
import { isMobileDevice } from '../AttachmentButton/utils';
import { getFileListFromDataTransferItems } from '../FilePaste';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseMarkdownInputFieldHandlersParams {
  props: Pick<
    MarkdownInputFieldProps,
    | 'disabled'
    | 'typing'
    | 'onChange'
    | 'onSend'
    | 'allowEmptySubmit'
    | 'markdownProps'
    | 'attachment'
    | 'triggerSendKey'
  >;
  markdownEditorRef: React.MutableRefObject<MarkdownEditorInstance | undefined>;
  inputRef: React.RefObject<HTMLDivElement>;
  isSendingRef: React.MutableRefObject<boolean>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  fileMap?: Map<string, AttachmentFile>;
  setFileMap?: (fileMap: Map<string, AttachmentFile>) => void;
  recording: boolean;
  stopRecording: () => Promise<void>;
  isEnlarged: boolean;
  setIsEnlarged: (enlarged: boolean) => void;
}

/**
 * 事件处理 Hook
 * 管理组件中的所有事件处理函数
 */
export const useMarkdownInputFieldHandlers = ({
  props,
  markdownEditorRef,
  inputRef,
  isSendingRef,
  isLoading,
  setIsLoading,
  value,
  setValue,
  fileMap,
  setFileMap,
  recording,
  stopRecording,
  isEnlarged,
  setIsEnlarged,
}: UseMarkdownInputFieldHandlersParams) => {
  /**
   * 处理放大缩小按钮点击
   * @description 切换编辑器的放大/缩小状态
   */
  const handleEnlargeClick = useRefFunction(() => {
    setIsEnlarged(!isEnlarged);
  });

  /**
   * 发送消息的函数
   * @description 该函数用于处理发送消息的逻辑，包括调用回调函数和清空输入框。
   * @returns {Promise<void>} 发送操作的Promise
   */
  const sendMessage = useRefFunction(async () => {
    if (props.disabled) return;
    if (props.typing) return;
    // 防止重复触发：如果正在加载中，直接返回
    if (isLoading) return;
    // 使用 ref 防止快速连续触发
    if (isSendingRef.current) return;

    // 如果处于录音中：优先停止录音或输入
    if (recording) await stopRecording();
    const mdValue = markdownEditorRef?.current?.store?.getMDContent();

    // 如果mdValue和value不一致，并且mdValue不为空，则调用onChange
    if (mdValue !== value && mdValue) {
      props.onChange?.(mdValue);
    }

    // allowEmptySubmit 开启时，即使内容为空也允许触发发送
    if (props.onSend && (props.allowEmptySubmit || mdValue)) {
      // 设置发送标记
      isSendingRef.current = true;
      setIsLoading(true);
      try {
        await props.onSend(mdValue || '');
        markdownEditorRef?.current?.store?.clearContent();
        props.onChange?.('');
        setValue('');
        setFileMap?.(new Map());
      } catch (error) {
        console.error('Send message failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
        // 重置发送标记
        isSendingRef.current = false;
      }
    }
  });

  // 图片粘贴上传
  const handlePaste = useRefFunction(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      // 优先使用 props.attachment，如果没有则使用 markdownProps?.attachment
      const attachmentConfig =
        props.attachment || props.markdownProps?.attachment;
      // 如果没有配置 upload 或 uploadWithResponse，不支持粘贴图片
      if (!attachmentConfig?.upload && !attachmentConfig?.uploadWithResponse) {
        return;
      }
      const imageFiles = (await getFileListFromDataTransferItems(e)).filter(
        (file) => file.type.startsWith('image/'),
      );
      // 如果没有图片文件，直接返回
      if (imageFiles.length === 0) {
        return;
      }
      upLoadFileToServer(imageFiles, {
        ...attachmentConfig,
        fileMap,
        onFileMapChange: setFileMap,
      });
    },
  );

  // 键盘事件：早返回减少嵌套
  const handleKeyDown = useRefFunction(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        markdownEditorRef?.current?.store.inputComposition ||
        e.nativeEvent.isComposing
      )
        return;

      const editor = markdownEditorRef?.current?.markdownEditorRef?.current;
      const isEnter = e.key === 'Enter';
      const isMod = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      // 处理 Home 键：移动到文档开头
      if (e.key === 'Home' && !isMod && editor) {
        e.preventDefault();
        e.stopPropagation();
        const start = Editor.start(editor, []);
        Transforms.select(editor, start);
        return;
      }

      // 处理 End 键：移动到文档末尾
      if (e.key === 'End' && !isMod && editor) {
        e.preventDefault();
        e.stopPropagation();
        const end = Editor.end(editor, []);
        Transforms.select(editor, end);
        return;
      }

      // 处理 Ctrl+A / Cmd+A：全选
      if ((e.key === 'a' || e.key === 'A') && isMod && !isShift && editor) {
        e.preventDefault();
        e.stopPropagation();
        Transforms.select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        });
        return;
      }

      // 移动端强制使用 Mod+Enter 模式，避免 Enter 误触
      const effectiveTriggerKey = isMobileDevice()
        ? 'Mod+Enter'
        : props.triggerSendKey || 'Enter';

      if (effectiveTriggerKey === 'Enter') {
        // 模式1: Enter 发送，Shift+Enter 换行
        // 只有纯 Enter 键才触发发送
        if (isEnter && !isMod && !isShift) {
          e.stopPropagation();
          e.preventDefault();
          if (props.onSend) sendMessage();
          return;
        }
      } else if (effectiveTriggerKey === 'Mod+Enter') {
        // 模式2: Mod+Enter (Cmd/Ctrl+Enter) 发送，Enter 换行
        if (isEnter && isMod && !isShift) {
          e.stopPropagation();
          e.preventDefault();
          if (props.onSend) sendMessage();
          return;
        }
      }

      // 其他情况（如 Shift+Enter，或非触发键的 Enter 组合）让编辑器正常处理换行
      // 这里不需要显式 return，函数结束自然会继续执行（但这里是 void，所以 return 也无妨）
      // 注意：上面的 return 是阻止了默认行为并发送，这里的 implicit return 是允许默认行为（换行）
    },
  );

  const activeInput = useRefFunction((active: boolean) => {
    if (inputRef.current) {
      if (active) {
        inputRef.current.tabIndex = 1;
        inputRef.current?.classList.add('active');
      } else {
        inputRef.current.tabIndex = -1;
        inputRef.current?.classList.remove('active');
      }
    }
  });

  return {
    handleEnlargeClick,
    sendMessage,
    handlePaste,
    handleKeyDown,
    activeInput,
  };
};
