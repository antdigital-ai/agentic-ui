import { Editor, Element, Node, Path, Transforms } from 'slate';

import { ListsEditor } from './ListsEditor';
import {
  listMatchesToolbarMode,
  modeToListType,
  syncListMetadataForMode,
  type ListToolbarMode,
} from './taskList';

const WRAPPABLE_BLOCK_TYPES = ['paragraph', 'head'] as const;

function findWrappableBlocksInSelection(editor: Editor, at: Editor['selection']) {
  if (!at) {
    return [] as Array<[Element, Path]>;
  }
  return Array.from(
    Editor.nodes(editor, {
      at,
      match: (n) =>
        Element.isElement(n) &&
        !Editor.isInline(editor, n) &&
        (WRAPPABLE_BLOCK_TYPES as readonly string[]).includes(n.type),
    }),
  ) as Array<[Element, Path]>;
}

function demoteHeadingToParagraph(editor: Editor, path: Path) {
  Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
  Transforms.unsetNodes(editor, 'level', { at: path });
}

/**
 * 工具栏：创建/切换/取消列表（Prezly ListsEditor + Agentic 任务列表元数据）
 */
export function createListFromToolbar(
  editor: Editor,
  mode: ListToolbarMode,
) {
  const selection = editor.selection;
  if (!selection || !ListsEditor.isListsEnabled(editor)) {
    return;
  }

  const listType = modeToListType(mode);

  Editor.withoutNormalizing(editor, () => {
    const listsInSelection = ListsEditor.getLists(editor, selection);

    if (listsInSelection.length > 0) {
      const listPaths = listsInSelection.map(([, path]) => path);
      if (listMatchesToolbarMode(listsInSelection[0][0], mode)) {
        ListsEditor.unwrapList(editor, selection);
        return;
      }
      ListsEditor.setListType(editor, listType, selection);
      syncListMetadataForMode(editor, mode, listPaths);
      editor.normalize({ force: true });
      return;
    }

    const blocks = findWrappableBlocksInSelection(editor, selection);
    if (blocks.length === 0) {
      return;
    }

    for (const [, path] of blocks) {
      const node = Node.get(editor, path);
      if (Element.isElement(node) && node.type === 'head') {
        demoteHeadingToParagraph(editor, path);
      }
    }

    ListsEditor.wrapInList(editor, listType, selection);
    syncListMetadataForMode(
      editor,
      mode,
      ListsEditor.getLists(editor, selection).map(([, path]) => path),
    );
    editor.normalize({ force: true });
  });
}
