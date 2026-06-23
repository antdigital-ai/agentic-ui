import type { Editor } from 'slate';
import type { Location } from 'slate';
import { Element, Node, Path } from 'slate';

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
            match: (node, path) => {
                if (
                    !Element.isElement(node) ||
                    schema.isListNode(node) ||
                    schema.isListItemNode(node) ||
                    !schema.isConvertibleToListTextNode(node)
                ) {
                    return false;
                }
                // schema 中 paragraph 同时是「可转换节点」与「list-item 文本节点」，
                // 仅凭类型无法区分顶层段落与列表项内段落。这里改用路径判断：
                // 仅跳过父级为 list-item 的文本节点，确保顶层段落仍可被包裹成列表。
                const parentPath = Path.parent(path);
                if (parentPath.length > 0) {
                    const parent = Node.get(editor, parentPath);
                    if (schema.isListItemNode(parent)) {
                        return false;
                    }
                }
                return true;
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
