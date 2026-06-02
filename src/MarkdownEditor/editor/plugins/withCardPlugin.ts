import { Editor, Operation } from 'slate';
import {
  collectCardPathsForTextOperation,
  handleCardDeleteBackward,
  handleCardInsertNodeOperation,
  handleCardRemoveNodeOperation,
  pruneEmptyCardsAtPaths,
  tryHandleCardInsertFragment,
  tryHandleCardInsertText,
} from './cardPluginBehavior';

/**
 * Card 块：用 Slate 推荐的 editor 方法覆写处理输入，apply 仅保留 Operation 级逻辑。
 *
 * - insertText / insertFragment / deleteBackward：card-before 禁写、card-after 重定向到卡后
 * - apply：remove_node、insert_node，以及文本变更后的空 card 清理
 */
export const withCardPlugin = (editor: Editor) => {
  const { apply, deleteBackward, insertFragment, insertText } = editor;

  editor.apply = (operation: Operation) => {
    if (
      operation.type === 'remove_node' &&
      handleCardRemoveNodeOperation(editor, operation, apply)
    ) {
      return;
    }

    if (
      operation.type === 'insert_node' &&
      handleCardInsertNodeOperation(editor, operation)
    ) {
      return;
    }

    const cardPathsToCheck =
      operation.type === 'remove_text' || operation.type === 'insert_text'
        ? collectCardPathsForTextOperation(editor, operation.path)
        : [];

    apply(operation);

    if (cardPathsToCheck.length > 0) {
      pruneEmptyCardsAtPaths(editor, cardPathsToCheck);
    }
  };

  editor.insertText = (text: string) => {
    if (!tryHandleCardInsertText(editor, text, insertText)) {
      insertText(text);
    }
  };

  editor.insertFragment = (fragment: Node[]) => {
    if (!tryHandleCardInsertFragment(editor, fragment, insertFragment)) {
      insertFragment(fragment);
    }
  };

  editor.deleteBackward = (unit) => {
    if (!handleCardDeleteBackward(editor, unit, deleteBackward)) {
      deleteBackward(unit);
    }
  };

  return editor;
};
