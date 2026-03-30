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
 * CommonMark 行内代码：起始与结束为等长反引号串，结束串后不得紧跟反引号（避免与更长串混淆）。
 */
function findInlineCodeClose(line: string, contentStart: number, openCount: number): number {
  for (let pos = contentStart; pos < line.length; pos++) {
    if (line[pos] !== '`') continue;
    let k = 0;
    while (k < openCount && pos + k < line.length && line[pos + k] === '`') {
      k++;
    }
    if (k !== openCount) continue;
    if (pos + openCount < line.length && line[pos + openCount] === '`') continue;
    return pos;
  }
  return -1;
}

/** 围栏外单行：跳过行内反引号包裹片段，仅对其余文本做 directive 时间保护 */
function protectLineOutsideInlineCode(markdownLine: string): string {
  let result = '';
  let i = 0;
  while (i < markdownLine.length) {
    if (markdownLine[i] !== '`') {
      const next = markdownLine.indexOf('`', i);
      if (next === -1) {
        result += protectLineFromDirectiveTime(markdownLine.slice(i));
        break;
      }
      result += protectLineFromDirectiveTime(markdownLine.slice(i, next));
      i = next;
      continue;
    }
    const blockStart = i;
    let openCount = 0;
    while (i < markdownLine.length && markdownLine[i] === '`') {
      openCount++;
      i++;
    }
    const contentStart = i;
    const closePos = findInlineCodeClose(markdownLine, contentStart, openCount);
    if (closePos === -1) {
      result += markdownLine.slice(blockStart);
      break;
    }
    const blockEnd = closePos + openCount;
    result += markdownLine.slice(blockStart, blockEnd);
    i = blockEnd;
  }
  return result;
}

/**
 * 将行首的 `::name` (leaf directive，两个冒号) 规范化为 `:::name` (container directive，三个冒号)，
 * 使 ::warning / ::info 等双冒号写法能被 remarkDirectiveContainersOnly 正确解析为容器指令。
 *
 * 匹配规则：行首仅有恰好两个冒号（不多于也不少于），后跟合法的指令名称标识符。
 * 代码围栏内的行不处理。
 */
export function preprocessNormalizeLeafToContainerDirective(
  markdown: string,
): string {
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
    if (!inFence && /^:{2}(?!:)[a-zA-Z]/.test(line)) {
      out.push(':' + line);
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}

/**
 * 保护时间格式（如 02:20:31）不被 remark-directive 误解析为 textDirective。
 * remark-directive 会将 ":20"、":31" 等解析为指令，导致 "Cannot handle unknown node textDirective"。
 * 使用反斜杠转义冒号（remark-directive 推荐：\:port 可防止 :port 被解析为指令）。
 * 围栏代码块与行内反引号内不处理：该处为字面量，不应出现 `\:` 污染。
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
    out.push(inFence ? line : protectLineOutsideInlineCode(line));
  }
  return out.join('\n');
}
