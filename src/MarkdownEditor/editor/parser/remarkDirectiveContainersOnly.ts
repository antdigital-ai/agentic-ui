/**
 * 仅启用 remark-directive 的 **容器** 语法（`:::name` … `:::`），不解析行内 `:foo` 与块级 `::foo`。
 * 避免普通文本中的 `:15`（时间）或 `:icon[...]` 被误解析为指令。
 *
 * 依赖与 `remark-directive` 相同：`micromark-extension-directive` + `mdast-util-directive`。
 *
 * 仅使用官方入口 `directive()` 中与 `lib/syntax.js` 一致的 flow[58][0]（容器指令），
 * 避免深层路径 `lib/directive-container.js`（未列入 package exports，Next/Turbopack 等会解析失败）。
 */
import type { Root } from 'mdast';
import {
  directiveFromMarkdown,
  directiveToMarkdown,
} from 'mdast-util-directive';
import { directive } from 'micromark-extension-directive';
import type { Plugin } from 'unified';

/** `:` — 与 micromark-extension-directive 内 `syntax.js` 中 flow/text 映射键一致 */
const MICROMARK_DIRECTIVE_MARK = 58;

const directiveContainerOnlyMicromarkExtension = (() => {
  const ext = directive();
  const atColon = ext.flow?.[MICROMARK_DIRECTIVE_MARK];
  const container = Array.isArray(atColon) ? atColon[0] : atColon;
  if (!container) {
    throw new Error(
      'micromark-extension-directive: expected container construct on flow[58]',
    );
  }
  return {
    flow: {
      [MICROMARK_DIRECTIVE_MARK]: [container],
    },
  };
})();

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

  micromarkExtensions.push(directiveContainerOnlyMicromarkExtension);
  fromMarkdownExtensions.push(directiveFromMarkdown());
  toMarkdownExtensions.push(directiveToMarkdown());
};

export default remarkDirectiveContainersOnly;
