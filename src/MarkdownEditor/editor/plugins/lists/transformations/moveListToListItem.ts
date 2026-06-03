import type { Editor } from 'slate';
import type { Node, NodeEntry } from 'slate';

import { NESTED_LIST_PATH_INDEX } from '../constants';
import type { ListsSchema } from '../types';

/**
 * Nests (moves) given "list" in a given "list-item".
 */
export function moveListToListItem(
    editor: Editor,
    schema: ListsSchema,
    parameters: {
        at: NodeEntry<Node>;
        to: NodeEntry<Node>;
    },
): void {
    const [sourceListNode, sourceListPath] = parameters.at;
    const [targetListNode, targetListPath] = parameters.to;

    if (!schema.isListNode(sourceListNode) || !schema.isListItemNode(targetListNode)) {
        // Sanity check.
        return;
    }

    editor.moveNodes({
        at: sourceListPath,
        to: [...targetListPath, NESTED_LIST_PATH_INDEX],
    });
}
