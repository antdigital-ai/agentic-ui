import type { KeyboardEvent } from 'react';
import { Editor, Element, Range } from 'slate';

import { ListsEditor } from './ListsEditor';
import { onKeyDown as listsOnKeyDown } from './onKeyDown';

export function isCollapsedInBlock(
  editor: Editor,
  blockType: string,
): boolean {
  const sel = editor.selection;
  if (!sel || !Range.isCollapsed(sel)) {
    return false;
  }
  const nodes = Editor.nodes(editor, {
    at: sel,
    match: (n) => Element.isElement(n) && n.type === blockType,
    mode: 'lowest',
  });
  return !nodes.next().done;
}

/** Tab：Prezly 列表优先；仅表格单元格走 TabKey */
export function handleTabWithLists(editor: Editor, event: KeyboardEvent): boolean {
  if (
    isCollapsedInBlock(editor, 'table-cell') ||
    !ListsEditor.isListsEnabled(editor)
  ) {
    return false;
  }
  listsOnKeyDown(editor, event);
  event.preventDefault();
  return true;
}

/** Enter（无 Shift/Ctrl/Meta）时由列表插件处理 */
export function handleListsOnEnter(
  editor: Editor,
  event: KeyboardEvent,
): boolean {
  if (
    !ListsEditor.isListsEnabled(editor) ||
    event.key !== 'Enter' ||
    event.shiftKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return false;
  }
  return !!listsOnKeyDown(editor, event);
}

export function handleListsOnBackspace(
  editor: Editor,
  event: KeyboardEvent,
): boolean {
  const sel = editor.selection;
  if (
    !ListsEditor.isListsEnabled(editor) ||
    event.key !== 'Backspace' ||
    !sel ||
    !Range.isCollapsed(sel)
  ) {
    return false;
  }
  return !!listsOnKeyDown(editor, event);
}
