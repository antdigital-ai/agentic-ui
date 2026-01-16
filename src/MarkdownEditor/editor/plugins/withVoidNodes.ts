import { Editor } from 'slate';
import { voidNode } from './utils';

/**
 * 扩展编辑器以识别空节点类型
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，能够识别空节点
 *
 * @description
 * 该插件扩展编辑器的 `isVoid` 方法，使其能够识别特定的空元素类型。
 * 空节点包括：'hr'、'break'
 */
export const withVoidNodes = (editor: Editor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return voidNode.has(element.type) || isVoid(element);
  };

  return editor;
};
