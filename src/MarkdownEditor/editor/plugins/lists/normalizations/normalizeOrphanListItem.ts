import type { Editor } from 'slate';
import type { Node, NodeEntry } from 'slate';
import { Element } from 'slate';

import { isContainingTextNodes, isElementOrEditor } from '../lib';
import type { ListsSchema } from '../types';

/**
 * If "list-item" somehow (e.g. by deleting everything around it) ends up
 * at the root of the editor, we have to convert it into a "default-block".
 * ----
 * Alternatively we could wrap it in a "list", but it's unlikely that it's
 * the expected behavior. The only case where it would be expected is during
 * pasting, so we have a separate rule for that in `deserializeHtml`.
 */
export function normalizeOrphanListItem(
    editor: Editor,
    schema: ListsSchema,
    [node, path]: NodeEntry<Node>,
): boolean {
    if (isElementOrEditor(node) && !schema.isListNode(node)) {
        // We look for "list-item" nodes that are NOT under a "list" node
        for (const [index, child] of node.children.entries()) {
            if (Element.isElement(child) && schema.isListItemNode(child)) {
                if (isContainingTextNodes(child)) {
                    editor.setNodes(schema.createDefaultTextNode(), {
                        at: [...path, index],
                    });
                } else {
                    editor.unwrapNodes({
                        at: [...path, index],
                        mode: 'highest',
                    });
                }
                return true;
            }
        }
    }

    return false;
}
