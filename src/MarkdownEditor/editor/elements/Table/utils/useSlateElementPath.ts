import { useMemo } from 'react';
import { ReactEditor } from 'slate-react';
import { useEditorStore } from '../../../store';

/**
 * 解析 Slate 元素在文档中的 path，不订阅选区变化。
 * 用于表格行号/列头等 chrome，避免 useSelStatus / useSlate 导致整表重渲染。
 */
export function useSlateElementPath(element: unknown): number[] | undefined {
  const { markdownEditorRef } = useEditorStore();

  return useMemo(() => {
    const editor = markdownEditorRef.current;
    if (!editor || element === null || element === undefined) {
      return undefined;
    }
    try {
      return ReactEditor.findPath(
        editor,
        element as Parameters<typeof ReactEditor.findPath>[1],
      );
    } catch {
      return undefined;
    }
  }, [markdownEditorRef, element]);
}
