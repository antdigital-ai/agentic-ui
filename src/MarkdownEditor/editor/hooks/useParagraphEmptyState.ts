import { Node } from 'slate';
import { useSlate } from 'slate-react';
import type { ParagraphNode } from '../../el';

/**
 * 段落空态判定（用于块级 placeholder）：
 * - 段落 trim 后无文本
 * - 未处于 IME 组合输入
 * - 文档仅有一个顶层 block
 * - 段落 children 均为纯文本（无 tag / code / 嵌套块）
 */
export function useParagraphEmptyState(
  element: ParagraphNode,
  isComposing: boolean,
): boolean {
  const editor = useSlate();
  const str = Node.string(element).trim();

  if (str || isComposing) {
    return false;
  }

  if (editor.children.length !== 1) {
    return false;
  }

  const hasOnlyTextNodes = element.children?.every?.(
    (child: ParagraphNode['children'][number]) => {
      const node = child as { type?: string; code?: boolean; tag?: boolean };
      return !node.type && !node.code && !node.tag;
    },
  );

  return Boolean(hasOnlyTextNodes);
}
