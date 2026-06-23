import type { Editor, Node, NodeEntry } from 'slate';
import { Node as SlateNode, Text } from 'slate';

import type { ListsSchema } from '../types';

/**
 * A "list-item" can have a single "list-item-text" and optionally an extra "list" as a child.
 */
export function normalizeListItemChildren(
    editor: Editor,
    schema: ListsSchema,
    [node, path]: NodeEntry<Node>,
): boolean {
    if (!schema.isListItemNode(node)) {
        // This function does not know how to normalize other nodes.
        return false;
    }

    const children = Array.from(SlateNode.children(editor, path));

    for (const [childIndex, [childNode, childPath]] of children.entries()) {
        if (Text.isText(childNode) || editor.isInline(childNode)) {
            const listItemText = schema.createListItemTextNode({
                children: [childNode],
            });
            editor.wrapNodes(listItemText, { at: childPath });

            if (childIndex > 0) {
                const [previousChildNode] = children[childIndex - 1];

                if (schema.isListItemTextNode(previousChildNode)) {
                    editor.mergeNodes({ at: childPath });
                }
            }

            return true;
        }

        if (schema.isListItemNode(childNode)) {
            editor.liftNodes({ at: childPath });
            return true;
        }

        if (schema.isListItemTextNode(childNode) && childIndex !== 0) {
            editor.wrapNodes(schema.createListItemNode(), { at: childPath });
            return true;
        }

        if (!schema.isListItemTextNode(childNode) && !schema.isListNode(childNode)) {
            editor.setNodes(schema.createListItemTextNode(), { at: childPath });
            return true;
        }
    }

    return false;
}
