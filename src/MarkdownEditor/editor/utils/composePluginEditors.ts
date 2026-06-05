import type { Editor } from 'slate';
import type { MarkdownEditorPlugin } from '../../plugin';

/** 按顺序将插件的 `withEditor` 叠到 Slate 编辑器实例上 */
export function composePluginEditors(
  editor: Editor,
  plugins: MarkdownEditorPlugin[],
): Editor {
  return plugins.reduce((acc, plugin) => {
    return plugin.withEditor ? plugin.withEditor(acc) : acc;
  }, editor);
}
