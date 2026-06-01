import { Editor, Transforms } from 'slate';
import { MarkdownEditorPlugin } from '../../plugin';
import { parserMdToSchema } from '../parser/parserMdToSchema';

/**
 * 解析Markdown并插入节点
 *
 * @param editor - 编辑器实例
 * @param markdown - 要解析的Markdown字符串
 * @param plugins - 可选的Markdown编辑器插件数组，用于扩展解析功能
 * @returns 如果插入成功则返回true
 */
export const parseMarkdownToNodesAndInsert = (
  editor: Editor,
  markdown: string,
  plugins?: MarkdownEditorPlugin[],
) => {
  const nodes = JSON.parse(
    JSON.stringify(parserMdToSchema(markdown, plugins).schema),
  );
  if (nodes.length === 0) {
    nodes.push({ type: 'paragraph', children: [{ text: '' }] });
  }
  const fragment = nodes;
  const sel = editor.selection;
  if (sel && Editor.hasPath(editor, sel.anchor.path)) {
    if (editor.children.length < 1) {
      Transforms.insertNodes(editor, fragment);
      return;
    }
    const selectString = Editor.string(editor, sel);
    if (selectString) {
      Transforms.removeNodes(editor, { at: sel });
    }
    Transforms.insertNodes(editor, fragment, { at: sel });
    return true;
  }
  Transforms.insertNodes(editor, fragment);
  return true;
};
