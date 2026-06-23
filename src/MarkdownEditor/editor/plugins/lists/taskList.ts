import { Editor, Element, Node, Transforms } from 'slate';
import type { BulletedListNode } from '../../../el';
import { ListType } from './types';

export type ListToolbarMode = 'ordered' | 'unordered' | 'task';

export function listMatchesToolbarMode(
  listNode: Element,
  mode: ListToolbarMode,
): boolean {
  const expectedType =
    mode === 'ordered' ? ListType.ORDERED : ListType.UNORDERED;
  if ((listNode as { type?: string }).type !== expectedType) {
    return false;
  }
  const isTask = !!(listNode as BulletedListNode).task;
  return mode === 'task' ? isTask : !isTask;
}

/**
 * Applies Agentic-specific list metadata (task flag, start, checked) after Prezly type changes.
 */
export function syncListMetadataForMode(
  editor: Editor,
  mode: ListToolbarMode,
  listPaths: Iterable<number[]>,
) {
  for (const listPath of listPaths) {
    if (!Editor.hasPath(editor, listPath)) {
      continue;
    }
    const listNode = Node.get(editor, listPath);
    if (!Element.isElement(listNode)) {
      continue;
    }

    if (mode === 'ordered') {
      const start = (listNode as { start?: number }).start;
      if (start === undefined) {
        Transforms.setNodes(editor, { start: 1 }, { at: listPath });
      }
    }

    if (mode === 'task') {
      Transforms.setNodes(editor, { task: true }, { at: listPath });
      const listItems = Array.from(
        Editor.nodes(editor, {
          at: listPath,
          match: (n) =>
            Element.isElement(n) && (n as { type?: string }).type === 'list-item',
        }),
      );
      for (const [item, itemPath] of listItems) {
        if (typeof (item as { checked?: boolean }).checked !== 'boolean') {
          Transforms.setNodes(
            editor,
            { checked: false },
            { at: itemPath },
          );
        }
      }
    } else {
      if ((listNode as BulletedListNode).task) {
        Transforms.unsetNodes(editor, 'task', { at: listPath });
      }
    }
  }
}

export function modeToListType(mode: ListToolbarMode): ListType {
  return mode === 'ordered' ? ListType.ORDERED : ListType.UNORDERED;
}
