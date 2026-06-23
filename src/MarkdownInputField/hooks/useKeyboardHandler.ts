import React from 'react';
import { Editor, Transforms } from 'slate';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import { isImeComposing } from '../../MarkdownEditor/editor/utils/isImeComposing';
import { isCodeBlockAceInputTarget } from '../../MarkdownEditor/editor/utils/codeBlockBehavior';
import { isMobileDevice } from '../AttachmentButton/utils';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseKeyboardHandlerParams {
  props: Pick<MarkdownInputFieldProps, 'triggerSendKey' | 'onSend'>;
  markdownEditorRef: React.MutableRefObject<MarkdownEditorInstance | undefined>;
  /** 由 useSendHandler 提供的稳定函数引用 */
  sendMessage: () => Promise<void> | void;
}

/**
 * 键盘事件处理 Hook。
 *
 * 由原 useMarkdownInputFieldHandlers 拆分而来，处理：
 *  - 中文输入法 / Composition 期间不响应
 *  - Home / End / Ctrl+A 的光标移动与全选
 *  - 根据 triggerSendKey 决定 Enter 或 Mod+Enter 触发发送
 *  - 移动端强制 Mod+Enter，避免 Enter 误触
 */
export const useKeyboardHandler = ({
  props,
  markdownEditorRef,
  sendMessage,
}: UseKeyboardHandlerParams) => {
  const handleKeyDown = useRefFunction(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        isImeComposing(e, markdownEditorRef?.current?.store.inputComposition)
      ) {
        // 阻止冒泡到外层，避免 IME 确认 Enter 误触发发送；勿 preventDefault，留给输入法提交
        if (e.key === 'Enter') {
          e.stopPropagation();
        }
        return;
      }

      const editor = markdownEditorRef?.current?.markdownEditorRef?.current;
      const isEnter = e.key === 'Enter';
      const isMod = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const inCodeBlockTextInput =
        isCodeBlockAceInputTarget(e.target) ||
        isCodeBlockAceInputTarget(document.activeElement);

      // Home：移动到文档开头
      if (e.key === 'Home' && !isMod && editor && !inCodeBlockTextInput) {
        e.preventDefault();
        e.stopPropagation();
        const start = Editor.start(editor, []);
        Transforms.select(editor, start);
        return;
      }

      // End：移动到文档末尾
      if (e.key === 'End' && !isMod && editor && !inCodeBlockTextInput) {
        e.preventDefault();
        e.stopPropagation();
        const end = Editor.end(editor, []);
        Transforms.select(editor, end);
        return;
      }

      // Ctrl+A / Cmd+A：全选
      if (
        (e.key === 'a' || e.key === 'A') &&
        isMod &&
        !isShift &&
        editor &&
        !inCodeBlockTextInput
      ) {
        e.preventDefault();
        e.stopPropagation();
        Transforms.select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        });
        return;
      }

      // 移动端强制 Mod+Enter，避免 Enter 误触
      const effectiveTriggerKey = isMobileDevice()
        ? 'Mod+Enter'
        : props.triggerSendKey || 'Enter';

      if (effectiveTriggerKey === 'Enter') {
        // 模式 1：Enter 发送，Shift+Enter 换行
        if (isEnter && !isMod && !isShift) {
          e.stopPropagation();
          e.preventDefault();
          if (props.onSend) sendMessage();
          return;
        }
      } else if (effectiveTriggerKey === 'Mod+Enter') {
        // 模式 2：Mod+Enter 发送，Enter 换行
        if (isEnter && isMod && !isShift) {
          e.stopPropagation();
          e.preventDefault();
          if (props.onSend) sendMessage();
          return;
        }
      }

      // 其他情况让编辑器正常处理换行
    },
  );

  return { handleKeyDown };
};
