import { Editor } from 'slate';
import { withCardPlugin } from './withCardPlugin';
import { withCodeTagPlugin } from './withCodeTagPlugin';
import { withInlineNodes } from './withInlineNodes';
import { withLinkAndMediaPlugin } from './withLinkAndMediaPlugin';
import { withListsPlugin } from './withListsPlugin';
import { withSchemaPlugin } from './withSchemaPlugin';
import { withVoidNodes } from './withVoidNodes';

/**
 * 为Slate编辑器添加Markdown支持的插件函数
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，具有Markdown处理能力
 *
 * @description
 * 该插件通过组合多个子插件，为编辑器提供完整的Markdown支持：
 * - 行内节点识别（withInlineNodes）
 * - 空节点识别（withVoidNodes）
 * - 卡片功能（withCardPlugin）
 * - 链接和媒体功能（withLinkAndMediaPlugin）
 * - Schema功能（withSchemaPlugin）
 * - 代码标签功能（withCodeTagPlugin）
 *
 * 插件按顺序应用，每个插件都会增强编辑器的特定功能。
 */
export const withMarkdown = (editor: Editor) => {
  return withCodeTagPlugin(
    withSchemaPlugin(
      withLinkAndMediaPlugin(
        withCardPlugin(withListsPlugin(withVoidNodes(withInlineNodes(editor)))),
      ),
    ),
  );
};
