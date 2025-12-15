import { Elements } from '../../el';

/**
 * Markdown 解析缓存类
 *
 * 使用 Map 存储 markdown 块到 schema 的映射，避免重复解析相同的 markdown 内容
 */
export class ParseCache {
  private cache = new Map<string, Elements[]>();

  /**
   * 从缓存中获取解析结果
   *
   * @param md - markdown 字符串
   * @returns 如果缓存中存在则返回解析结果，否则返回 null
   */
  get(md: string): Elements[] | null {
    return this.cache.get(md) || null;
  }

  /**
   * 将解析结果存入缓存
   *
   * @param md - markdown 字符串
   * @param schema - 解析后的 schema 数组
   */
  set(md: string, schema: Elements[]): void {
    this.cache.set(md, schema);
  }

  /**
   * 检查缓存中是否存在指定的 markdown
   *
   * @param md - markdown 字符串
   * @returns 是否存在
   */
  has(md: string): boolean {
    return this.cache.has(md);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   *
   * @returns 缓存中存储的条目数
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * 获取代码块围栏的长度
 */
export function getFenceLength(
  md: string,
  start: number,
  fenceChar: string,
): number {
  let length = 0;
  while (start + length < md.length && md[start + length] === fenceChar) {
    length++;
  }
  return length;
}

/**
 * 查找 HTML 注释的结束位置
 * 返回结束位置（包含 -->），如果未找到则返回 -1
 */
export function findHtmlCommentEnd(md: string, start: number): number {
  if (md.slice(start, start + 4) !== '<!--') {
    return -1;
  }

  for (let i = start + 4; i < md.length - 2; i++) {
    if (md.slice(i, i + 3) === '-->') {
      return i + 3;
    }
  }

  return -1;
}

/**
 * 查找 HTML 标签信息
 * 返回标签信息对象，如果未找到则返回 null
 */
export function findHtmlTagInfo(
  md: string,
  start: number,
): { name: string; end: number; isSelfClosing: boolean } | null {
  if (md[start] !== '<') {
    return null;
  }

  let i = start + 1;

  // 跳过可能的 /（结束标签）
  if (i < md.length && md[i] === '/') {
    return null;
  }

  // 提取标签名
  let tagName = '';
  while (i < md.length && /[a-zA-Z0-9-]/.test(md[i])) {
    tagName += md[i];
    i++;
  }

  if (!tagName) {
    return null;
  }

  // 跳过空白和属性，查找 > 或 />
  // 需要处理属性值中的引号
  let inQuotes = false;
  let quoteChar = '';
  while (i < md.length) {
    const char = md[i];

    // 处理引号（检查前一个字符是否是转义字符）
    if (char === '"' || char === "'") {
      const prevChar = i > 0 ? md[i - 1] : '';
      if (prevChar !== '\\') {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        }
      }
    }

    // 只有在引号外部才检查标签结束
    if (!inQuotes) {
      if (char === '>') {
        return {
          name: tagName.toLowerCase(),
          end: i + 1,
          isSelfClosing: false,
        };
      }
      if (i < md.length - 1 && md.slice(i, i + 2) === '/>') {
        return {
          name: tagName.toLowerCase(),
          end: i + 2,
          isSelfClosing: true,
        };
      }
    }

    i++;
  }

  return null;
}

/**
 * 查找 HTML 结束标签的位置
 * 返回结束位置（包含 >），如果未找到则返回 -1
 */
export function findHtmlClosingTagEnd(
  md: string,
  start: number,
  tagName: string,
): number {
  if (md.slice(start, start + 2) !== '</') {
    return -1;
  }

  // 检查标签名是否匹配
  const expectedTag = `</${tagName}`;
  if (
    md.slice(start, start + expectedTag.length).toLowerCase() !==
    expectedTag.toLowerCase()
  ) {
    return -1;
  }

  // 查找 >
  let i = start + expectedTag.length;
  while (i < md.length && /\s/.test(md[i])) {
    i++;
  }

  if (i < md.length && md[i] === '>') {
    return i + 1;
  }

  return -1;
}

/**
 * 检查是否应该保护此分隔符（不切分）
 * 返回 true 如果：
 * 1. HTML 注释后紧跟着表格行
 * 2. 当前块包含表格行，且后面也是表格行
 */
export function shouldProtectSeparator(
  md: string,
  separatorIndex: number,
  currentBlock: string,
): boolean {
  // 跳过 \n\n 和后续的换行符，查找下一行的开始
  let nextLineStart = separatorIndex + 2;
  while (nextLineStart < md.length && md[nextLineStart] === '\n') {
    nextLineStart++;
  }

  // 检查下一行是否以 | 开头（表格行）
  if (nextLineStart >= md.length || md[nextLineStart] !== '|') {
    return false;
  }

  // 情况1：当前块以 HTML 注释结尾，后面是表格行
  const trimmedBlock = currentBlock.trim();
  if (trimmedBlock.endsWith('-->')) {
    const commentStart = trimmedBlock.lastIndexOf('<!--');
    if (commentStart !== -1) {
      return true;
    }
  }

  // 情况2：当前块包含表格行（检查最后几行是否包含表格行）
  const lines = currentBlock.split('\n');
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5); i--) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      return true;
    }
  }

  return false;
}

/**
 * 按 \n\n 切分 markdown，但保护不应被切分的结构
 *
 * 切分规则：
 * 1. 按 \n\n（双换行）切分 markdown
 * 2. 保护代码块（```code```）：代码块内部的 \n\n 不作为分隔符
 * 3. 保护 HTML 注释（<!-- -->）：注释内部的 \n\n 不作为分隔符
 * 4. 保护 HTML 标签（<tag>...</tag>）：标签内部的 \n\n 不作为分隔符
 *
 * @param md - 要切分的 markdown 字符串
 * @returns 切分后的 markdown 块数组
 */
export function splitMarkdownIntoBlocks(md: string): string[] {
  if (!md) {
    return [];
  }

  const blocks: string[] = [];
  let currentBlock = '';
  let i = 0;
  let inCodeBlock = false;
  let codeBlockFence = '';
  let inHtmlTag = false;
  let htmlTagName = '';

  while (i < md.length) {
    const char = md[i];
    const nextChar = i + 1 < md.length ? md[i + 1] : null;

    // 检测代码块开始：``` 或 ~~~
    if (!inCodeBlock && !inHtmlTag && (char === '`' || char === '~')) {
      const fenceLength = getFenceLength(md, i, char);
      if (fenceLength >= 3) {
        inCodeBlock = true;
        codeBlockFence = char.repeat(fenceLength);
        currentBlock += codeBlockFence;
        i += fenceLength;
        continue;
      }
    }

    // 检测代码块结束
    if (
      inCodeBlock &&
      md.slice(i, i + codeBlockFence.length) === codeBlockFence
    ) {
      currentBlock += codeBlockFence;
      i += codeBlockFence.length;
      inCodeBlock = false;
      codeBlockFence = '';
      continue;
    }

    // 检测 HTML 注释开始：<!--
    if (!inCodeBlock && !inHtmlTag && md.slice(i, i + 4) === '<!--') {
      const commentEnd = findHtmlCommentEnd(md, i);
      if (commentEnd > i) {
        currentBlock += md.slice(i, commentEnd);
        i = commentEnd;
        continue;
      }
    }

    // 检测 HTML 标签开始：<tag
    if (!inCodeBlock && !inHtmlTag && char === '<') {
      const tagInfo = findHtmlTagInfo(md, i);
      if (tagInfo) {
        if (tagInfo.isSelfClosing) {
          // 自闭合标签，直接添加并跳过
          currentBlock += md.slice(i, tagInfo.end);
          i = tagInfo.end;
          continue;
        } else {
          // 开始标签，查找对应的结束标签
          inHtmlTag = true;
          htmlTagName = tagInfo.name;
          currentBlock += md.slice(i, tagInfo.end);
          i = tagInfo.end;
          continue;
        }
      }
    }

    // 检测 HTML 标签结束：</tag>
    if (inHtmlTag && md.slice(i, i + 2) === '</') {
      const closingTagEnd = findHtmlClosingTagEnd(md, i, htmlTagName);
      if (closingTagEnd > i) {
        currentBlock += md.slice(i, closingTagEnd);
        i = closingTagEnd;
        inHtmlTag = false;
        htmlTagName = '';
        continue;
      }
    }

    // 检测块分隔符 \n\n（仅在代码块、HTML 注释和 HTML 标签外部）
    if (!inCodeBlock && !inHtmlTag && char === '\n' && nextChar === '\n') {
      // 检查是否应该保护此分隔符（HTML 注释后跟着表格，或表格行之间）
      if (shouldProtectSeparator(md, i, currentBlock)) {
        // 不切分，继续添加到当前块
        currentBlock += '\n\n';
        i += 2;
        while (i < md.length && md[i] === '\n') {
          currentBlock += '\n';
          i++;
        }
        continue;
      }

      if (currentBlock.trim().length > 0) {
        blocks.push(currentBlock.trim());
      }
      currentBlock = '';

      // 跳过连续的换行符
      i += 2;
      while (i < md.length && md[i] === '\n') {
        i++;
      }
      continue;
    }

    // 普通字符，添加到当前块
    currentBlock += char;
    i++;
  }

  // 处理最后一个块
  if (currentBlock.trim().length > 0) {
    blocks.push(currentBlock.trim());
  }

  return blocks.filter((block) => block.trim().length > 0);
}
