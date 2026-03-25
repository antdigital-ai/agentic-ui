/**
 * 仅启用 remark-directive 的 **容器** 语法（`:::name` … `:::`），不解析行内 `:foo` 与块级 `::foo`。
 * 避免普通文本中的 `:15`（时间）或 `:icon[...]` 被误解析为指令。
 *
 * 依赖与 `remark-directive` 相同：`micromark-extension-directive` + `mdast-util-directive`。
 */
import type { Root } from 'mdast';
import {
  directiveFromMarkdown,
  directiveToMarkdown,
} from 'mdast-util-directive';
import { directiveContainer } from 'micromark-extension-directive/lib/directive-container.js';
import type { Plugin } from 'unified';

/**
 * @returns {undefined}
 *   Nothing.
 */
const remarkDirectiveContainersOnly: Plugin<[], Root> = function () {
  const data = this.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push({
    flow: {
      58: [directiveContainer],
    },
  });
  fromMarkdownExtensions.push(directiveFromMarkdown());
  toMarkdownExtensions.push(directiveToMarkdown());
};

export default remarkDirectiveContainersOnly;
