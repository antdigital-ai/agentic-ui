import { Editor, Transforms } from 'slate';
import { MarkdownEditorPlugin } from '../../plugin';
import { parserMdToSchema } from '../parser/parserMdToSchema';
import { prepareMediaPaste } from './prepareMediaPaste';

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
  prepareMediaPaste(editor);
  const sel = editor.selection;
  if (
    sel &&
    editor.children.length > 0 &&
    Editor.hasPath(editor, sel.anchor.path) &&
    Editor.hasPath(editor, sel.focus.path)
  ) {
    // insertFragment 会随删除操作更新选区，避免跨段替换后复用旧路径。
    Transforms.insertFragment(editor, fragment, { at: sel });
    return true;
  }
  Transforms.insertNodes(editor, fragment);
  return true;
};
