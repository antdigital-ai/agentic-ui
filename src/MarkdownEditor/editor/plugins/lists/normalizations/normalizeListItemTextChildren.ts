import type { Editor, Node, NodeEntry } from 'slate';
import { Element, Node as SlateNode } from 'slate';

import type { ListsSchema } from '../types';

/**
 * A "list-item-text" can have only inline nodes in it.
 */
export function normalizeListItemTextChildren(
    editor: Editor,
    schema: ListsSchema,
    [node, path]: NodeEntry<Node>,
): boolean {
    if (!schema.isListItemTextNode(node)) {
        // This function does not know how to normalize other nodes.
        return false;
    }

    const children = SlateNode.children(editor, path);
    for (const [childNode, childPath] of children) {
        if (Element.isElement(childNode) && !editor.isInline(childNode)) {
            editor.unwrapNodes({ at: childPath });
            return true;
        }
    }

    return false;
}
