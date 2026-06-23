import { Element, Node, Text, type BaseEditor } from 'slate';

const PLAIN_TEXT_BLOCK_TYPES = new Set(['paragraph', 'head']);

/**
 * 是否适合使用 Slate 原生 placeholder（单 block、纯文本、内容为空）。
 * 含 tag / code 行内节点时不启用，避免与 Jinja 等内联占位冲突。
 */
export function canUseSlateNativePlaceholder(editor: BaseEditor): boolean {
  if (editor.children.length !== 1) {
    return false;
  }

  const block = editor.children[0];
  if (!Element.isElement(block) || !PLAIN_TEXT_BLOCK_TYPES.has(block.type)) {
    return false;
  }

  if (Node.string(block).trim() !== '') {
    return false;
  }

  return block.children.every((child: (typeof block.children)[number]) => {
    if (!Text.isText(child)) {
      return false;
    }
    const leaf = child as Text & { tag?: boolean; code?: boolean };
    return !leaf.tag && !leaf.code;
  });
}
