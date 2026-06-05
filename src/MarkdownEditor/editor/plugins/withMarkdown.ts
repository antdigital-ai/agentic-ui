import { Editor } from 'slate';
import { withCardPlugin } from './withCardPlugin';
import { withCodeBlockPlugin } from './withCodeBlockPlugin';
import { withCodeTagPlugin } from './withCodeTagPlugin';
import { withFootnoteReferenceNormalize } from './withFootnoteReferenceNormalize';
import { withOrphanInlineLeafNormalize } from './withOrphanInlineLeafNormalize';
import { withInlineNodes } from './withInlineNodes';
import { withLinkAndMediaPlugin } from './withLinkAndMediaPlugin';
import { withListsPlugin } from './withListsPlugin';
import { withSanitizeInvalidChildren } from './withSanitizeInvalidChildren';
import { withSchemaPlugin } from './withSchemaPlugin';
import { withVoidNodes } from './withVoidNodes';

/**
 * 为 Slate 编辑器叠加 Markdown 内核插件栈（固定顺序，勿随意调整）。
 *
 * ### 从内到外的包装顺序
 * 1. `withInlineNodes` — `isInline`（break、inline-katex）
 * 2. `withCodeBlockPlugin` — 块级 code → `isVoid`
 * 3. `withVoidNodes` — hr、break 等 `isVoid`（card 系列 deliberately 非 void，见该文件注释）
 * 4. `withListsPlugin` — 列表 normalize / 键盘
 * 5. `withCardPlugin` — `apply`、`insertText`、`insertFragment`、`deleteBackward`
 * 6. `withLinkAndMediaPlugin` — `apply`（链接内双空格、link-card/media split）
 * 7. `withSchemaPlugin` — `apply`（schema `split_node`）
 * 8. `withCodeTagPlugin` — `apply`、`insertText`、`insertBreak`、`deleteBackward`
 * 9. `withFootnoteReferenceNormalize` — `normalizeNode`
 * 10. `withOrphanInlineLeafNormalize` — `normalizeNode`
 * 11. `withSanitizeInvalidChildren` — `normalize`、`normalizeNode`（非法 children）
 *
 * ### `apply` 调用链（由外到内，先执行外层）
 * `withCodeTagPlugin` → `withSchemaPlugin` → `withLinkAndMediaPlugin` → `withCardPlugin` → … → Slate 默认。
 *
 * 部分插件在「已处理」时会 **不调用内层 `apply`**（例如 schema/link 的 `split_node` 改为 `insertNodes`），
 * Undo 仅撤销实际进入 history 的操作；行为见 `withMarkdownHistory.integration.test.ts`。
 *
 * 业务侧 `MarkdownEditorPlugin.withEditor` 由 `composePluginEditors` 叠在本栈 **之外**；
 * 覆写 `apply` / `normalizeNode` 时必须委托内层函数，否则破坏上述链条。
 */
export const withMarkdown = (editor: Editor) => {
  return withSanitizeInvalidChildren(
    withOrphanInlineLeafNormalize(
      withFootnoteReferenceNormalize(
        withCodeTagPlugin(
          withSchemaPlugin(
            withLinkAndMediaPlugin(
              withCardPlugin(
                withListsPlugin(
                  withVoidNodes(withCodeBlockPlugin(withInlineNodes(editor))),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
};
