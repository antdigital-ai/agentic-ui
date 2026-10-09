import React from 'react';
import { BaseEditor, Editor, Transforms } from 'slate';
import type { HistoryEditor } from 'slate-history';
import type { ReactEditor } from 'slate-react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import { isCodeBlockAceInputTarget } from '../../MarkdownEditor/editor/utils/codeBlockBehavior';
import { isImeComposing } from '../../MarkdownEditor/editor/utils/isImeComposing';
import { isMobileDevice } from '../AttachmentButton/utils';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';
import type { useInputHistory } from './useInputHistory';

interface UseKeyboardHandlerParams {
  props: Pick<MarkdownInputFieldProps, 'triggerSendKey' | 'onSend'>;
  markdownEditorRef: React.MutableRefObject<
    MarkdownEditorInstance | null | undefined
  >;
  /** 由 useSendHandler 提供的稳定函数引用 */
  sendMessage: () => Promise<void> | void;
  /** 输入历史导航（useInputHistory 返回值）；未启用时不拦截方向键 */
  inputHistory?: ReturnType<typeof useInputHistory>;
}

type SlateEditorLike = (BaseEditor & ReactEditor & HistoryEditor) | undefined;

/** 空段落节点的序列化形态，用于判定空文档 */
const EMPTY_PARAGRAPH_JSON = JSON.stringify({
  type: 'paragraph',
  children: [{ text: '' }],
});

/**
 * 判断 Slate 选区是否位于文档最前（含跨选区锚点 / 焦点两种形态）。
 * 对齐 dtcoder-ide：仅光标在第一行行首时 ↑ 才翻历史，否则保留多行编辑行为。
 * 空文档（selection 被清空）视为位于开头——与 IDE 发送清空后 ↑ 可回溯一致。
 */
const isCursorAtDocStart = (editor: SlateEditorLike): boolean => {
  if (!editor) return false;
  const isEmptyDoc =
    editor.children.length === 0 ||
    (editor.children.length === 1 &&
      JSON.stringify(editor.children[0]) === EMPTY_PARAGRAPH_JSON);
  if (isEmptyDoc) return true;
  if (!editor.selection) return false;
  const focus = editor.selection.focus;
  const start = Editor.start(editor, []);
  return (
    focus.path.length === start.path.length &&
    focus.path.every((n, i) => n === start.path[i]) &&
    focus.offset <= start.offset
  );
};

/**
 * 判断 Slate 选区是否位于文档最后（isCursorAtDocStart 的末尾镜像）。
 */
const isCursorAtDocEnd = (editor: SlateEditorLike): boolean => {
  if (!editor?.selection) return false;
  const focus = editor.selection.focus;
  const end = Editor.end(editor, []);
  return (
    focus.path.length === end.path.length &&
    focus.path.every((n, i) => n === end.path[i]) &&
    focus.offset >= end.offset
  );
};

/**
 * 键盘事件处理 Hook。
 *
 * 由原 useMarkdownInputFieldHandlers 拆分而来，处理：
 *  - 中文输入法 / Composition 期间不响应
 *  - Home / End / Ctrl+A 的光标移动与全选
 *  - ↑ / ↓ 在文档边界处切换输入历史（对齐 dtcoder-ide）
 *  - 根据 triggerSendKey 决定 Enter 或 Mod+Enter 触发发送
 *  - 移动端强制 Mod+Enter，避免 Enter 误触
 */
export const useKeyboardHandler = ({
  props,
  markdownEditorRef,
  sendMessage,
  inputHistory,
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

      // ↑ / ↓：光标位于首行行首（↑）或末行行尾（↓）时切换输入历史（对齐 IDE 行为）
      if (inputHistory && !isMod && !isShift && !inCodeBlockTextInput) {
        if (e.key === 'ArrowUp' && isCursorAtDocStart(editor ?? undefined)) {
          const prev = inputHistory.previous();
          if (prev !== undefined) {
            e.preventDefault();
            e.stopPropagation();
            inputHistory.restore(prev);
            return;
          }
        } else if (
          e.key === 'ArrowDown' &&
          isCursorAtDocEnd(editor ?? undefined)
        ) {
          const nextValue = inputHistory.next();
          if (nextValue !== undefined) {
            e.preventDefault();
            e.stopPropagation();
            inputHistory.restore(nextValue);
            return;
          }
        }
      }

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
