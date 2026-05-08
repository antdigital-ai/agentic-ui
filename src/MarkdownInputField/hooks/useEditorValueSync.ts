import { useEffect, useRef } from 'react';
import { ReactEditor } from 'slate-react';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import { useRefFunction } from '../../Hooks/useRefFunction';

interface UseEditorValueSyncParams {
  /** 受控的外部 value */
  value: string | undefined;
  /** 由 useInputFieldRefContainer 提供的编辑器实例 ref */
  markdownEditorRef: React.MutableRefObject<MarkdownEditorInstance | undefined>;
}

interface UseEditorValueSyncResult {
  /**
   * 由 MarkdownInputField 的 onChange handler 调用，
   * 用于记录「编辑器最近一次发出的 value」，避免回写造成光标抖动 / 白屏。
   */
  onEditorChange: (value: string) => void;
}

/**
 * 把外部受控的 `value` 同步到底层 MarkdownEditor。
 *
 * 单一职责：仅处理「外部 value → 编辑器内容」的单向同步及其防御逻辑。
 *
 * 防御策略：
 * 1. **来源守卫**：若 `props.value` 与 `lastEditorValueRef` 相等，说明该 value
 *    本就是编辑器自己刚刚 emit 出去再回流的，无需写回。
 * 2. **聚焦守卫**：若编辑器正处于聚焦状态（用户正在敲键），父级因 debounce/批
 *    更新而迟到的 stale `props.value` 一旦写入，会触发 `ReactEditor.deselect()`
 *    抛 `InvalidStateError`（"Failed to execute 'collapseToEnd' on 'Selection'"）
 *    导致整棵树白屏。此时直接跳过写回。
 *
 * `store.ts` 中 `_safeDeselect` 是兜底防御；不调用 `setMDContent` 才是干净修复。
 */
export const useEditorValueSync = ({
  value,
  markdownEditorRef,
}: UseEditorValueSyncParams): UseEditorValueSyncResult => {
  /**
   * 记录编辑器自身最近一次 emit 的 value。
   * 当 `props.value === lastEditorValueRef.current` 时，
   * 说明该次 props 变更只是受控回流，编辑器内部已经是最新状态。
   */
  const lastEditorValueRef = useRef<string | undefined>(undefined);

  const onEditorChange = useRefFunction((next: string) => {
    lastEditorValueRef.current = next;
  });

  useEffect(() => {
    if (!markdownEditorRef.current) return;

    // Guard 1：来自编辑器自身的回流，跳过。
    if (value === lastEditorValueRef.current) return;

    // Guard 2：编辑器聚焦中（用户正在打字），跳过 stale 写回。
    const slateEditor = markdownEditorRef.current?.markdownEditorRef?.current;
    if (slateEditor) {
      try {
        if (ReactEditor.isFocused(slateEditor)) return;
      } catch {
        // 编辑器正在被销毁时 ReactEditor.isFocused 可能抛错，忽略。
      }
    }

    markdownEditorRef.current?.store?.setMDContent(value ?? '');
    // markdownEditorRef 本身是稳定的容器引用，无需作为依赖。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return { onEditorChange };
};
