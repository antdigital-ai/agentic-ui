import { Editor, Element, Transforms, type NodeEntry } from 'slate';

import { agenticListsSchema, getListType } from './schema';
import { normalizeNode as listsNormalizeNode } from './normalizeNode';
import { withAgenticListsReact } from './withAgenticListsReact';
import { withListsSchema } from './withListsSchema';

/**
 * Registers Agentic list schema, Prezly list normalizations, and legacy `list` → typed list migration.
 */
export function withAgenticLists<T extends Editor>(editor: T): T {
  const enhanced = withAgenticListsReact(
    withListsSchema(agenticListsSchema)(editor),
  );
  const parentNormalize = enhanced.normalizeNode;

  enhanced.normalizeNode = (entry: NodeEntry, options?) => {
    const [node, path] = entry;

    if (Element.isElement(node) && (node as { type?: string }).type === 'list') {
      const listType = getListType((node as { order?: boolean }).order);
      Transforms.setNodes(enhanced, { type: listType }, { at: path });
      if ((node as { order?: boolean }).order !== undefined) {
        Transforms.unsetNodes(enhanced, 'order', { at: path });
      }
      return;
    }

    if (listsNormalizeNode(enhanced, entry)) {
      return;
    }

    parentNormalize(entry, options);
  };

  return enhanced;
}
