/**
 * 查找匹配的闭合标记
 *
 * 用于流式解析代码块（特别是 Mermaid 代码块）时，判断代码块是否完整。
 * 通过查找匹配的闭合标记来确定代码块是否已经完成输入。
 *
 * @param src - 源字符串
 * @param startIdx - 开始搜索的索引位置
 * @param open - 开始标记（如 "```", "$$", "(" 等）
 * @param close - 结束标记（如 "```", "$$", ")" 等）
 * @returns 匹配的闭合标记的索引位置，如果未找到则返回 -1
 *
 * @example
 * ```typescript
 * // 查找代码块的闭合标记
 * const code = "```javascript\nconsole.log('hello');\n```";
 * const closeIdx = findMatchingClose(code, 0, "```", "```");
 * // 返回: 42 (第二个 ``` 的位置)
 *
 * // 查找数学公式的闭合标记
 * const math = "$$\\sum_{i=1}^{n} x_i$$";
 * const closeIdx = findMatchingClose(math, 0, "$$", "$$");
 * // 返回: 最后一个 $ 的位置
 * ```
 */
export function findMatchingClose(
  src: string,
  startIdx: number,
  open: string,
  close: string,
): number {
  const len = src.length;

  // 特殊处理 $$ 因为它是两个字符的分隔符，不应该被解释为嵌套的括号
  if (open === '$$' && close === '$$') {
    let i = startIdx;
    while (i < len - 1) {
      if (src[i] === '$' && src[i + 1] === '$') {
        // 确保没有被转义
        let k = i - 1;
        let backslashes = 0;
        while (k >= 0 && src[k] === '\\') {
          backslashes++;
          k--;
        }
        // 如果反斜杠数量是偶数，说明没有被转义
        if (backslashes % 2 === 0) return i;
      }
      i++;
    }
    return -1;
  }

  const openChar = open[open.length - 1];
  const closeSeq = close;
  let depth = 0;
  let i = startIdx;

  while (i < len) {
    // 如果这里有一个未转义的闭合序列
    if (src.slice(i, i + closeSeq.length) === closeSeq) {
      let k = i - 1;
      let backslashes = 0;
      while (k >= 0 && src[k] === '\\') {
        backslashes++;
        k--;
      }
      // 如果反斜杠数量是偶数，说明没有被转义
      if (backslashes % 2 === 0) {
        if (depth === 0) return i;
        depth--;
        i += closeSeq.length;
        continue;
      }
    }

    const ch = src[i];

    // 跳过转义字符
    if (ch === '\\') {
      i += 2;
      continue;
    }

    // 如果遇到开始字符，增加深度
    if (ch === openChar) {
      depth++;
    }
    // 如果遇到闭合字符的最后一个字符，减少深度
    else if (ch === closeSeq[closeSeq.length - 1]) {
      if (depth > 0) depth--;
    }

    i++;
  }

  return -1;
}

/**
 * 检查字符串中是否有未闭合的括号
 */
function checkUnclosedBrackets(code: string): boolean {
  // 检查圆括号
  const openParen = findMatchingClose(code, 0, '(', ')');
  if (openParen === -1 && code.includes('(')) {
    // 有开括号但没有匹配的闭括号
    return true;
  }

  // 检查方括号
  const openBracket = findMatchingClose(code, 0, '[', ']');
  if (openBracket === -1 && code.includes('[')) {
    return true;
  }

  // 检查花括号
  const openBrace = findMatchingClose(code, 0, '{', '}');
  if (openBrace === -1 && code.includes('{')) {
    return true;
  }

  return false;
}

/**
 * 检查 Mermaid 代码是否完整
 */
function isMermaidCodeComplete(code: string): boolean {
  // 检查是否包含基本的 Mermaid 图表类型关键字
  const hasChartType =
    code.includes('graph') ||
    code.includes('sequenceDiagram') ||
    code.includes('gantt') ||
    code.includes('pie') ||
    code.includes('classDiagram') ||
    code.includes('stateDiagram') ||
    code.includes('erDiagram') ||
    code.includes('journey') ||
    code.includes('gitgraph') ||
    code.includes('flowchart');

  if (!hasChartType) return false;

  // 检查基本结构完整性
  if (code.length < 10) return false;

  // 检查括号匹配
  const hasUnclosedBrackets = checkUnclosedBrackets(code);
  if (hasUnclosedBrackets) return false;

  // 检查是否以常见的不完整模式结尾
  const incompletePatterns = [
    /graph\s*$/i, // 只有 graph 关键字
    /-->?\s*$/, // 箭头后面没有内容
  ];

  const endsWithIncomplete = incompletePatterns.some((pattern) =>
    pattern.test(code),
  );

  return !endsWithIncomplete;
}

/**
 * 检查代码块是否完整（基于代码内容）
 * 用于流式输入时判断代码块是否已经完成
 *
 * @param code - 代码内容
 * @param language - 代码语言（如 'mermaid', 'javascript' 等）
 * @returns 是否可能完整
 */
export function isCodeBlockLikelyComplete(
  code: string,
  language?: string,
): boolean {
  const trimmed = code.trim();
  if (!trimmed) return false;

  // 对于 Mermaid，使用更严格的检查
  if (language === 'mermaid') {
    return isMermaidCodeComplete(trimmed);
  }

  // 对于其他语言，检查基本的完整性
  // 如果代码很短，可能是正在输入中
  if (trimmed.length < 5) return false;

  // 检查是否以常见的不完整模式结尾
  const incompletePatterns = [
    /\\$/, // 以反斜杠结尾（可能是转义字符）
    /\/\*[\s\S]*$/, // 未闭合的多行注释
    /\/\/.*$/, // 单行注释（可能是完整的）
    /['"`][^'"`]*$/, // 未闭合的字符串
  ];

  // 检查括号匹配
  const hasUnclosedBrackets = checkUnclosedBrackets(trimmed);
  if (hasUnclosedBrackets) return false;

  // 如果匹配不完整模式，可能还在输入中
  const endsWithIncomplete = incompletePatterns.some((pattern) =>
    pattern.test(trimmed),
  );

  return !endsWithIncomplete;
}

export default findMatchingClose;
