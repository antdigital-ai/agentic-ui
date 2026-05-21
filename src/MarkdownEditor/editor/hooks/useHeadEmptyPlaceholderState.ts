import { Node } from 'slate';
import { useSelStatus } from '../../hooks/editor';
import type { HeadNode } from '../../el';

/**
 * 标题空态占位判定：
 * - 标题 trim 后无文本
 * - 未处于 IME 组合输入
 * - 为文档第一个顶层 block（path[0] === 0）
 */
export function useHeadEmptyPlaceholderState(
  element: HeadNode,
  isComposing: boolean,
): boolean {
  const [, path] = useSelStatus(element);
  const str = Node.string(element).trim();

  if (str || isComposing) {
    return false;
  }

  return path?.[0] === 0;
}
