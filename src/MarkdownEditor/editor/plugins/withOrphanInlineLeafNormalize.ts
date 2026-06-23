import { Editor, NodeEntry, Text, Transforms } from 'slate';

import {
  hasOrphanMarkDecoration,
  hasOrphanTagDecoration,
  MARK_DECORATION_KEYS,
} from './inlineLeafNormalizeUtils';

const TAG_DECORATION_KEYS = ['tag', 'code', 'triggerText'] as const;

/**
 * 导入 / setMDContent 等不经过 `remove_text` 的路径上，剔除无正文的 mark、tag 装饰属性。
 */
export const withOrphanInlineLeafNormalize = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry: NodeEntry) => {
    const [node, path] = entry;

    if (Text.isText(node)) {
      if (hasOrphanMarkDecoration(node)) {
        Transforms.unsetNodes(editor, [...MARK_DECORATION_KEYS], {
          at: path,
          match: Text.isText,
        });
        return;
      }

      if (hasOrphanTagDecoration(node)) {
        Editor.withoutNormalizing(editor, () => {
          Transforms.unsetNodes(editor, [...TAG_DECORATION_KEYS], {
            at: path,
            match: Text.isText,
          });
          if (node.text.length === 0) {
            Transforms.insertText(editor, ' ', { at: { path, offset: 0 } });
          }
        });
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
