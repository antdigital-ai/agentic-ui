import { Node, Element as SlateElement } from 'slate';
import type { CodeNode } from '../../el';

/**
 * 代码块在 Slate 中的正文：以子节点文本为准（与 parser 初始写入的 `value` 可能不同步，
 * 尤其在 Realtime / 流式 updateNodeList 只更新 text leaf 时）。
 */
export function getCodeBlockPlainText(
  element: CodeNode | undefined | null,
): string {
  if (!element) return '';
  if (SlateElement.isElement(element) && element.type === 'code') {
    const fromSlate = Node.string(element);
    if (fromSlate !== '') {
      return fromSlate;
    }
  }
  return typeof element.value === 'string' ? element.value : '';
}
