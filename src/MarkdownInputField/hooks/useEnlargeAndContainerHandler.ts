import React from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import { EditorUtils } from '../../MarkdownEditor/editor/utils/editorUtils';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseEnlargeAndContainerHandlerParams {
  props: Pick<MarkdownInputFieldProps, 'disabled' | 'typing'>;
  markdownEditorRef: React.MutableRefObject<MarkdownEditorInstance | undefined>;
  inputRef: React.RefObject<HTMLDivElement>;
  isEnlarged: boolean;
  setIsEnlarged: (enlarged: boolean) => void;
}

/**
 * 放大切换 + 容器点击 + 输入区激活态切换 Hook。
 *
 * 由原 useMarkdownInputFieldHandlers 拆分而来。这三个回调共享主组件
 * 的容器/编辑器引用、共享 disabled/typing 守卫，因此合并到同一个 hook，
 * 避免再多拆出一个仅含三行的 hook。
 */
export const useEnlargeAndContainerHandler = ({
  props,
  markdownEditorRef,
  inputRef,
  isEnlarged,
  setIsEnlarged,
}: UseEnlargeAndContainerHandlerParams) => {
  /** 切换编辑器放大 / 缩小状态 */
  const handleEnlargeClick = useRefFunction(() => {
    setIsEnlarged(!isEnlarged);
  });

  /**
   * 点击容器空白处时把光标聚焦到编辑器末尾，
   * 避免点到 padding 区域时输入区"看似可输入但实际未聚焦"。
   */
  const handleContainerClick = useRefFunction(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (props.disabled) return;
      if (props.typing) return;

      const editor = markdownEditorRef?.current?.markdownEditorRef?.current;
      if (!editor) return;

      try {
        if (ReactEditor.isFocused(editor)) return;
      } catch {
        // ignore
      }

      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('[contenteditable="true"]');
      if (isInteractive) return;

      EditorUtils.focus(editor);
      try {
        const end = Editor.end(editor, []);
        Transforms.select(editor, end);
      } catch {
        // editor 此时可能没有有效的内容点；focus 仍然已经生效
      }
    },
  );

  /** 在输入区获焦 / 失焦时切换 tabIndex 与 active 类，方便键盘 / 视觉上看出激活态 */
  const activeInput = useRefFunction((active: boolean) => {
    if (!inputRef.current) return;
    if (active) {
      inputRef.current.tabIndex = 1;
      inputRef.current.classList.add('active');
    } else {
      inputRef.current.tabIndex = -1;
      inputRef.current.classList.remove('active');
    }
  });

  return {
    handleEnlargeClick,
    handleContainerClick,
    activeInput,
  };
};
