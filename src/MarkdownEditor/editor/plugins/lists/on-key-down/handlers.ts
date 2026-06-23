import type { Editor } from 'slate';
import { isHotkey } from 'is-hotkey';
import type { KeyboardEvent } from 'react';

import { getListItems, isAtEmptyListItem, isDeleteBackwardAllowed } from '../lib';
import { ListsEditor } from '../ListsEditor';
import {
  decreaseDepth,
  increaseDepth,
  splitListItem,
} from '../transformations';

export function onTabIncreaseListDepth(editor: Editor, event: KeyboardEvent) {
  const schema = ListsEditor.getListsSchema(editor);
  if (schema && isHotkey('tab', event.nativeEvent) && !event.shiftKey) {
    event.preventDefault();
    return increaseDepth(editor, schema);
  }
  return false;
}

export function onShiftTabDecreaseListDepth(editor: Editor, event: KeyboardEvent) {
  const schema = ListsEditor.getListsSchema(editor);
  if (schema && isHotkey('shift+tab', event.nativeEvent)) {
    event.preventDefault();
    return decreaseDepth(editor, schema);
  }
  return false;
}

export function onBackspaceDecreaseListDepth(editor: Editor, event: KeyboardEvent) {
  const schema = ListsEditor.getListsSchema(editor);
  if (
    schema &&
    isHotkey('backspace', event.nativeEvent) &&
    !isDeleteBackwardAllowed(editor, schema)
  ) {
    event.preventDefault();
    return decreaseDepth(editor, schema);
  }
  return false;
}

export function onEnterEscapeFromEmptyList(editor: Editor, event: KeyboardEvent) {
  const schema = ListsEditor.getListsSchema(editor);
  if (schema && isHotkey('enter', event.nativeEvent)) {
    if (isAtEmptyListItem(editor, schema)) {
      event.preventDefault();
      return decreaseDepth(editor, schema);
    }
  }
  return false;
}

export function onEnterSplitNonEmptyList(editor: Editor, event: KeyboardEvent) {
  const schema = ListsEditor.getListsSchema(editor);
  if (schema && isHotkey('enter', event.nativeEvent)) {
    const listItemsInSelection = getListItems(editor, schema, editor.selection);
    if (listItemsInSelection.length > 0) {
      event.preventDefault();
      return splitListItem(editor, schema);
    }
  }
  return false;
}
