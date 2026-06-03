import type { Editor } from 'slate';
import type { Location } from 'slate';
import { Element } from 'slate';

import type { ListsSchema, ListType } from '../types';

/**
 * All nodes matching `isConvertibleToListTextNode()` in the current selection
 * will be converted to list items and then wrapped in lists.
 *
 * @see ListsSchema.isConvertibleToListTextNode()
 */
export function wrapInList(
    editor: Editor,
    schema: ListsSchema,
    listType: ListType,
    at: Location | null = editor.selection,
): boolean {
    if (!at) {
        return false;
    }

    const nonListEntries = Array.from(
        editor.nodes({
            at,
            match: (node) => {
                return (
                    Element.isElement(node) &&
                    !schema.isListNode(node) &&
                    !schema.isListItemNode(node) &&
                    !schema.isListItemTextNode(node) &&
                    schema.isConvertibleToListTextNode(node)
                );
            },
        }),
    );

    if (nonListEntries.length === 0) {
        return false;
    }

    const refs = nonListEntries.map(([_, path]) => editor.pathRef(path));

    refs.forEach((ref) => {
        const path = ref.current;
        if (path) {
            editor.withoutNormalizing(() => {
                editor.setNodes(schema.createListItemTextNode(), { at: path });
                editor.wrapNodes(schema.createListItemNode(), { at: path });
                editor.wrapNodes(schema.createListNode(listType), { at: path });
            });
        }
        ref.unref();
    });

    return true;
}
