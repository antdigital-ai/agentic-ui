import { Node } from 'slate';
import type { CodeNode } from '../../el';

/** void 代码块占位 leaf 常见零宽/空白，不能当作正文 */
const VOID_CODE_PLACEHOLDER_TEXT = /^[\s\uFEFF\u200B]*$/;

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
 * 从 `CodeNode` 取正文。
 * void 块级 code 以 `value` 为权威来源；流式场景可能仅更新 children 且比 value 更长，此时优先 children。
 */
export function getCodeBlockPlainText(
  element: CodeNode | undefined | null,
): string {
  if (!element) return '';
  const valueStr = typeof element.value === 'string' ? element.value : '';
  let fromSlate = '';
  if (hasElementChildren(element)) {
    try {
      fromSlate = Node.string(
        element as Parameters<typeof Node.string>[0],
      );
    } catch {
      // 测试中可能对 slate / 节点结构部分 mock，退回到 value
    }
  }

  const slateIsPlaceholder =
    fromSlate === '' || VOID_CODE_PLACEHOLDER_TEXT.test(fromSlate);
  if (slateIsPlaceholder) {
    return valueStr;
  }

  if (fromSlate !== valueStr) {
    return fromSlate.length > valueStr.length ? fromSlate : valueStr;
  }

  return fromSlate;
}
