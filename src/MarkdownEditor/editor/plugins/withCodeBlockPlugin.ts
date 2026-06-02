import { Editor, Element } from 'slate';
import { isCodeBlockElement } from '../utils/codeBlockBehavior';

/**
 * 块级 code 注册为 void：正文由 Ace 编辑，Slate 只存 `value` + 占位 children。
 */
export const withCodeBlockPlugin = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    if (Element.isElement(element) && isCodeBlockElement(element)) {
      return true;
    }
    return isVoid(element);
  };

  return editor;
};
