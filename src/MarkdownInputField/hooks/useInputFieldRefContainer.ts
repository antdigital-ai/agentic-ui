import { useRef } from 'react';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';

/**
 * MarkdownInputField 内部使用的基础 ref 容器集合。
 *
 * 仅承担「持有引用」的单一职责：
 * - `markdownEditorRef`：底层 MarkdownEditor 实例
 * - `quickActionsRef`：快捷操作区 DOM 容器
 * - `actionsRef`：发送区 DOM 容器
 * - `isSendingRef`：发送动作的并发护栏（防止重复触发）
 *
 * 与「外部 value 同步」「ref 透出」等其它职责通过组合方式协作，
 * 见 `useEditorValueSync` / `useExposeInputRef`。
 */
export interface InputFieldRefContainer {
  markdownEditorRef: React.MutableRefObject<MarkdownEditorInstance | undefined>;
  quickActionsRef: React.RefObject<HTMLDivElement>;
  actionsRef: React.RefObject<HTMLDivElement>;
  isSendingRef: React.MutableRefObject<boolean>;
}

export const useInputFieldRefContainer = (): InputFieldRefContainer => {
  const markdownEditorRef = useRef<MarkdownEditorInstance>();
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  return {
    markdownEditorRef,
    quickActionsRef,
    actionsRef,
    isSendingRef,
  };
};
