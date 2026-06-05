import type { Editor } from 'slate';
import type { MarkdownEditorPlugin } from '../../../plugin';
import { createMarkdownSlateEditor } from '../../utils/createMarkdownSlateEditor';

/**
 * 与生产 `BaseMarkdownEditor` Slate 路径一致的编辑器工厂（含 withMarkdown、history、React、错误包装）。
 * 单元 / 集成测试应优先使用，避免 `withMarkdown(withReact(createEditor()))` 与线上栈不一致。
 */
export function createTestMarkdownEditor(
  plugins: MarkdownEditorPlugin[] = [],
): Editor {
  return createMarkdownSlateEditor(plugins);
}
