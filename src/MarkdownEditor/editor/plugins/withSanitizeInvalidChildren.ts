import { Editor, Node, NodeEntry, Transforms } from 'slate';

const isValidChild = (child: unknown): child is Node =>
  child !== undefined && child !== null && Node.isNode(child);

const createDefaultBlock = () => ({
  type: 'paragraph' as const,
  children: [{ text: '' }],
});

const rebuildElement = (node: Node & { children: unknown[] }): Node => {
  let children = node.children.filter(isValidChild) as Node[];
  if (children.length === 0 && 'type' in node && (node as { type?: string }).type) {
    children = [{ text: '' }];
  }
  const { children: _drop, ...rest } = node as Node & { children: unknown[] };
  return { ...rest, children } as Node;
};

/**
 * 外部或合并后的 value 可能在 `children` 中混入 `undefined` / `null`；
 * Slate 的 `Node.string` 会对每个子节点调用 `Text.isText`，遇 `undefined` 即抛错。
 * 在 normalize 最外层剔除非法子节点，避免编辑器与 toMarkdown 崩溃。
 */
export const withSanitizeInvalidChildren = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry: NodeEntry) => {
    const [node, path] = entry;

    if (Editor.isEditor(node) && path.length === 0) {
      const hasInvalid = node.children.some((c) => !isValidChild(c));
      if (hasInvalid) {
        const clean = node.children.filter(isValidChild);
        editor.children =
          clean.length === 0 ? [createDefaultBlock()] : clean;
        normalizeNode(entry);
        return;
      }
      if (node.children.length === 0) {
        editor.children = [createDefaultBlock()];
        normalizeNode(entry);
        return;
      }
      normalizeNode(entry);
      return;
    }

    if (Node.isElement(node)) {
      const hasInvalid = node.children.some((c) => !isValidChild(c));
      if (hasInvalid) {
        Editor.withoutNormalizing(editor, () => {
          const rebuilt = rebuildElement(node);
          Transforms.removeNodes(editor, { at: path, voids: true });
          Transforms.insertNodes(editor, rebuilt, { at: path, voids: true });
        });
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
