/**
 * 占位符：保护 Jinja 块内 $ 不被 remark-math 解析为数学公式。
 * 在 markdown 解析前替换，渲染与序列化时还原为 $。
 */
export const JINJA_DOLLAR_PLACEHOLDER = '\uE01A';

/** URL 协议占位符，用于保护时间格式预处理时不影响 https:// 等 */
const URL_PROTOCOL_PLACEHOLDER = '\uE01B\uE01B';

/**
 * 保护时间格式（如 02:20:31）不被 remark-directive 误解析为 textDirective。
 * remark-directive 会将 ":20"、":31" 等解析为指令，导致 "Cannot handle unknown node textDirective"。
 * 在数字与冒号间插入零宽空格 \u200B 以阻断误解析。
 * 须在 remark-directive 解析前执行。
 */
export function preprocessProtectTimeFromDirective(markdown: string): string {
  if (!markdown || markdown.length === 0) return markdown;
  const withProtocolProtected = markdown.replace(
    /:\/\//g,
    URL_PROTOCOL_PLACEHOLDER,
  );
  // 在冒号与紧跟的数字之间插入零宽空格，阻止 ":20"、":31" 等被 remark-directive 解析为 textDirective
  const withTimeProtected = withProtocolProtected.replace(
    /:(\d)/g,
    (_, d) => `:\u200B${d}`,
  );
  return withTimeProtected.replace(/\uE01B\uE01B/g, '://');
}
