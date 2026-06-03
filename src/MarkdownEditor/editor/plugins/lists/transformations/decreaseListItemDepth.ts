import type { Editor } from 'slate';
import { Node, Path } from 'slate';

import { NESTED_LIST_PATH_INDEX, TEXT_PATH_INDEX } from '../constants';
import { getListType, getParentList, getParentListItem } from '../lib';
import type { ListsSchema } from '../types';

import { increaseListItemDepth } from './increaseListItemDepth';

/**
 * Decreases nesting depth of "list-item" at a given Path.
 *
 * @returns {boolean} True, if the editor state has been changed.
 */
export function decreaseListItemDepth(
    editor: Editor,
    schema: ListsSchema,
    listItemPath: Path,
): boolean {
    const parentList = getParentList(editor, schema, listItemPath);

    if (!parentList) {
        // It should never happen.
        return false;
    }

    const [parentListNode, parentListPath] = parentList;
    const parentListItem = getParentListItem(editor, schema, listItemPath);
    const listItemIndex = listItemPath[listItemPath.length - 1];
    const previousSiblings = parentListNode.children.slice(0, listItemIndex);
    const nextSiblings = parentListNode.children.slice(listItemIndex + 1);

    editor.withoutNormalizing(() => {
        // We have to move all subsequent sibling "list-items" into a new "list" that will be
        // nested in the "list-item" we're trying to move.
        nextSiblings.forEach(() => {
            // The next sibling path is always the same, because once we move out the next sibling,
            // another one will take its place.
            const nextSiblingPath = [...parentListPath, listItemIndex + 1];
            increaseListItemDepth(editor, schema, nextSiblingPath);
        });

        if (parentListItem) {
            // Move the "list-item" to the grandparent "list".
            const [, parentListItemPath] = parentListItem;
            editor.moveNodes({
                at: listItemPath,
                to: Path.next(parentListItemPath),
            });

            // We've moved the "list-item" and all its subsequent sibling "list-items" out of this list.
            // So in case there are no more "list-items" left, we should remove the list.
            if (previousSiblings.length === 0) {
                editor.removeNodes({ at: parentListPath });
            }
        } else {
            // Move the "list-item" to the root of the editor.
            const listItemTextPath = [...listItemPath, TEXT_PATH_INDEX];
            const listItemNestedListPath = [...listItemPath, NESTED_LIST_PATH_INDEX];

            if (Node.has(editor, listItemNestedListPath)) {
                editor.setNodes(
                    schema.createListNode(getListType(schema, parentListNode), { children: [] }),
                    { at: listItemNestedListPath },
                );
                editor.liftNodes({ at: listItemNestedListPath });
                editor.liftNodes({ at: Path.next(listItemPath) });
            }

            if (Node.has(editor, listItemTextPath)) {
                editor.setNodes(schema.createDefaultTextNode(), {
                    at: listItemTextPath,
                });
                editor.liftNodes({ at: listItemTextPath });
                editor.liftNodes({ at: listItemPath });
            }
        }
    });

    return true;
}
