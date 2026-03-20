/**
 * 占位符：保护 Jinja 块内 $ 不被 remark-math 解析为数学公式。
 * 在 markdown 解析前替换，渲染与序列化时还原为 $。
 */
export const JINJA_DOLLAR_PLACEHOLDER = '\uE01A';

/** URL 协议占位符，用于保护时间格式预处理时不影响 https:// 等 */
const URL_PROTOCOL_PLACEHOLDER = '\uE01B\uE01B';

/** CommonMark：最多 3 个前导空白后接至少 3 个 backtick 的围栏行 */
const FENCE_DELIMITER_LINE = /^[\t \uFEFF]{0,3}`{3,}/;

function protectLineFromDirectiveTime(markdownLine: string): string {
  const withProtocolProtected = markdownLine.replace(
    /:\/\//g,
    URL_PROTOCOL_PLACEHOLDER,
  );
  const withTimeProtected = withProtocolProtected.replace(
    /:(\d)/g,
    (_, d) => `\\:${d}`,
  );
  return withTimeProtected.replace(/\uE01B\uE01B/g, '://');
}

/**
 * 保护时间格式（如 02:20:31）不被 remark-directive 误解析为 textDirective。
 * remark-directive 会将 ":20"、":31" 等解析为指令，导致 "Cannot handle unknown node textDirective"。
 * 使用反斜杠转义冒号（remark-directive 推荐：\:port 可防止 :port 被解析为指令）。
 * 围栏代码块内不处理：正文才需要防 directive，代码块内为字面量且不应出现 `\:` 污染。
 * 须在 remark-directive 解析前执行。
 */
export function preprocessProtectTimeFromDirective(markdown: string): string {
  if (!markdown || markdown.length === 0) return markdown;
  const lines = markdown.split('\n');
  let inFence = false;
  const out: string[] = [];
  for (const line of lines) {
    if (FENCE_DELIMITER_LINE.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    out.push(inFence ? line : protectLineFromDirectiveTime(line));
  }
  return out.join('\n');
}
