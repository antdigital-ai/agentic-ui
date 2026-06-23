import type { Editor } from 'slate';
import type { KeyboardEvent } from 'react';

import { ListsEditor } from './ListsEditor';
import * as handlers from './on-key-down/handlers';

export function onKeyDown(editor: Editor, event: KeyboardEvent): boolean | void {
  if (!ListsEditor.isListsEnabled(editor)) {
    return;
  }

  try {
    return (
      handlers.onTabIncreaseListDepth(editor, event) ||
      handlers.onShiftTabDecreaseListDepth(editor, event) ||
      handlers.onBackspaceDecreaseListDepth(editor, event) ||
      handlers.onEnterEscapeFromEmptyList(editor, event) ||
      handlers.onEnterSplitNonEmptyList(editor, event)
    );
  } finally {
    editor.normalize({ force: true });
  }
}
