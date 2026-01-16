import { Editor } from 'slate';
import { inlineNode } from './utils';

/**
 * 扩展编辑器以识别行内节点类型
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，能够识别行内节点
 *
 * @description
 * 该插件扩展编辑器的 `isInline` 方法，使其能够识别特定的行内元素类型。
 * 行内节点包括：'break'、'inline-katex'
 */
export const withInlineNodes = (editor: Editor) => {
  const { isInline } = editor;

  editor.isInline = (element) => {
    return inlineNode.has(element.type) || isInline(element);
  };

  return editor;
};
