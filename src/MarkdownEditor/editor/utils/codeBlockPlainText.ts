import { Node } from 'slate';
import type { CodeNode } from '../../el';

/** 可从 Slate 子节点或 `value` 取正文的元素（code / mermaid / katex / think 等） */
export type SlatePlainTextSource =
  | {
      children?: unknown;
      value?: unknown;
    }
  | null
  | undefined;

function hasElementChildren(element: SlatePlainTextSource): boolean {
  return (
    !!element &&
    typeof element === 'object' &&
    Array.isArray((element as { children?: unknown }).children)
  );
}

/**
 * 从 Slate 元素读取正文：优先 `Node.string`（与子节点同步），再回退到 string `value`。
 * 用于流式 updateNodeList 只更新 text leaf、未同步 `value` 的场景。
 *
 * 不使用 `Element.isElement`：Vitest 中对 `slate` 的部分 mock 常缺少 `Element`，会导致用例报错。
 */
export function getSlateElementPlainText(
  element: SlatePlainTextSource,
): string {
  if (!element) return '';
  if (hasElementChildren(element)) {
    try {
      const fromSlate = Node.string(
        element as Parameters<typeof Node.string>[0],
      );
      if (fromSlate !== '') {
        return fromSlate;
      }
    } catch {
      // 测试中可能对 slate / 节点结构部分 mock，退回到 value
    }
  }
  const v = (element as { value?: unknown }).value;
  return typeof v === 'string' ? v : '';
}

/**
 * 从 `CodeNode` 取正文，与 {@link getSlateElementPlainText} 行为一致。
 */
export function getCodeBlockPlainText(
  element: CodeNode | undefined | null,
): string {
  return getSlateElementPlainText(element);
}
