import type { Editor } from 'slate';
import type { Node } from 'slate';
import { Element } from 'slate';

import type { ListsSchema } from '../types';

/**
 * Returns true if given "list-item" node contains a non-empty "list-item-text" node.
 */
export function isListItemContainingText(
    editor: Editor,
    schema: ListsSchema,
    node: Node,
): boolean {
    if (Element.isElement(node) && schema.isListItemNode(node)) {
        return node.children.some((child: Node) => {
            return (
                Element.isElement(child) &&
                schema.isListItemTextNode(child) &&
                !editor.isEmpty(child)
            );
        });
    }
    return false;
}
