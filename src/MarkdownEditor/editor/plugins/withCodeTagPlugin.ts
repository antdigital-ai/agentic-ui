import { Editor, Operation } from 'slate';
import {
  handleTagDeleteBackward,
  handleTagRemoveTextOperation,
  moveSelectionOutOfCodeTagLeaf,
  tryInsertTextOutsideTagOnDoubleSpace,
} from './codeTagLeafBehavior';

/**
 * 行内 code / tag 叶子节点：用 Slate 推荐的 editor 方法覆写，而非拦截 split_node。
 *
 * - insertText：tag 末尾连续空格时跳到节点外
 * - insertBreak：在 tag/code 内先移出光标再换行（避免依赖吞 apply）
 * - deleteBackward：tag 邻接删除与空 tag 清理
 * - apply：仅保留 remove_text（选区删除/剪切等一次性删字仍走 Operation）
 */
export const withCodeTagPlugin = (editor: Editor) => {
  const { apply, deleteBackward, insertBreak, insertText } = editor;

  editor.apply = (operation: Operation) => {
    if (
      operation.type === 'remove_text' &&
      handleTagRemoveTextOperation(editor, operation, apply)
    ) {
      return;
    }
    apply(operation);
  };

  editor.insertText = (text: string) => {
    if (tryInsertTextOutsideTagOnDoubleSpace(editor, text)) {
      return;
    }
    insertText(text);
  };

  editor.insertBreak = () => {
    moveSelectionOutOfCodeTagLeaf(editor);
    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (handleTagDeleteBackward(editor, unit, deleteBackward)) {
      return;
    }
    deleteBackward(unit);
  };

  return editor;
};
