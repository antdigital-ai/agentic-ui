import { createEditor, type Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import type { MarkdownEditorPlugin } from '../../plugin';
import { withMarkdown } from '../plugins';
import { withErrorReporting } from '../plugins/catchError';
import { composePluginEditors } from './composePluginEditors';

/** 解析单个插件在 composition key 中的 `withEditor` 槽位标识 */
export function getWithEditorSlotKey(plugin: MarkdownEditorPlugin): string {
  if (!plugin.withEditor) {
    return '_';
  }
  if (plugin.withEditorKey) {
    return plugin.withEditorKey;
  }
  const fnName = plugin.withEditor.name;
  if (fnName && fnName !== 'withEditor') {
    return fnName;
  }
  return 'w';
}

/**
 * 检测 `withEditor` 栈是否变化，用于 Slate 子树 remount。
 * 比较插件顺序、是否含 `withEditor`、以及 `withEditorKey` / 具名函数名（匿名函数均为 `w`）。
 * 仅替换匿名 `withEditor` 实现且未设 `withEditorKey` 时 **不会** remount。
 */
export function getPluginsEditorCompositionKey(
  plugins: MarkdownEditorPlugin[] = [],
): string {
  return plugins
    .map((plugin, index) => `${index}:${getWithEditorSlotKey(plugin)}`)
    .join('|');
}

/** 构建带 Markdown 插件栈的 Slate 编辑器实例（含 history、React、错误日志包装） */
export function createMarkdownSlateEditor(
  plugins: MarkdownEditorPlugin[] = [],
): Editor {
  const editor = composePluginEditors(
    withMarkdown(withReact(withHistory(createEditor()))),
    plugins,
  );
  withErrorReporting(editor);
  return editor;
}
