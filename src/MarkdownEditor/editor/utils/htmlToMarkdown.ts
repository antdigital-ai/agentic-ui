/* eslint-disable */
/**
 * HTML to Markdown conversion utilities
 * 无依赖的 HTML 到 Markdown 转换工具
 */

export interface HtmlToMarkdownOptions {
  /** 是否保留换行符 */
  preserveLineBreaks?: boolean;
  /** 是否保留 HTML 注释 */
  preserveComments?: boolean;
  /** 图片处理函数 */
  imageHandler?: (src: string, alt: string) => string;
  /** 链接处理函数 */
  linkHandler?: (href: string, text: string) => string;
}

/**
 * 转换 DOM 节点为 Markdown
 */
function convertNodeToMarkdown(
  node: Node,
  options: HtmlToMarkdownOptions,
): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    return convertElementToMarkdown(element, tagName, options);
  }

  // 处理其他节点类型
  if (node.nodeType === Node.COMMENT_NODE) {
    return options.preserveComments ? `<!--${node.textContent}-->` : '';
  }

  return '';
}

/**
 * 转换链接为 Markdown
 */
function convertLinkToMarkdown(
  element: HTMLElement,
  text: string,
  options: HtmlToMarkdownOptions,
): string {
  const href = element.getAttribute('href') || '';
  const linkText = text.trim();

  if (options.linkHandler) {
    return options.linkHandler(href, linkText);
  }

  return `[${linkText}](${href})`;
}

/**
 * 转换图片为 Markdown
 */
function convertImageToMarkdown(
  element: HTMLElement,
  options: HtmlToMarkdownOptions,
): string {
  const src = element.getAttribute('src') || '';
  const alt = element.getAttribute('alt') || '';
  const title = element.getAttribute('title') || '';

  if (options.imageHandler) {
    return options.imageHandler(src, alt);
  }

  const titleAttr = title ? ` "${title}"` : '';
  return `![${alt}](${src}${titleAttr})`;
}

/**
 * 转换列表为 Markdown
 */
function convertListToMarkdown(
  element: HTMLElement,
  isOrdered: boolean,
  options: HtmlToMarkdownOptions,
): string {
  const items = Array.from(element.querySelectorAll('li'));
  let result = '';

  items.forEach((item, index) => {
    const itemText = convertNodeToMarkdown(item, options).trim();
    if (isOrdered) {
      result += `${index + 1}. ${itemText}\n`;
    } else {
      result += `- ${itemText}\n`;
    }
  });

  return result + '\n';
}

/**
 * 转换表格为 Markdown
 */
function convertTableToMarkdown(
  element: HTMLElement,
  options: HtmlToMarkdownOptions,
): string {
  const rows = Array.from(element.querySelectorAll('tr'));
  if (rows.length === 0) return '';

  let result = '';

  // 处理表头
  const headerRow = rows[0];
  const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
  result +=
    '| ' +
    headerCells
      .map((cell) => convertNodeToMarkdown(cell, options).trim())
      .join(' | ') +
    ' |\n';

  // 添加分隔行
  result += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n';

  // 处理数据行
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = Array.from(row.querySelectorAll('td'));
    result +=
      '| ' +
      cells
        .map((cell) => convertNodeToMarkdown(cell, options).trim())
        .join(' | ') +
      ' |\n';
  }

  return result.trim() + '\n';
}

/**
 * 转换表格行为 Markdown
 */
function convertTableRowToMarkdown(
  element: HTMLElement,
  options: HtmlToMarkdownOptions,
): string {
  const cells = Array.from(element.querySelectorAll('th, td'));
  return (
    '| ' +
    cells
      .map((cell) => convertNodeToMarkdown(cell, options).trim())
      .join(' | ') +
    ' |\n'
  );
}

/**
 * 转换 HTML 元素为 Markdown
 */
function convertElementToMarkdown(
  element: HTMLElement,
  tagName: string,
  options: HtmlToMarkdownOptions,
): string {
  const children = Array.from(element.childNodes)
    .map((child) => convertNodeToMarkdown(child, options))
    .join('');

  switch (tagName) {
    case 'h1':
      return `# ${children}\n\n`;
    case 'h2':
      return `## ${children}\n\n`;
    case 'h3':
      return `### ${children}\n\n`;
    case 'h4':
      return `#### ${children}\n\n`;
    case 'h5':
      return `##### ${children}\n\n`;
    case 'h6':
      return `###### ${children}\n\n`;

    case 'p':
      return `${children}\n\n`;

    case 'br':
      return '\n';

    case 'strong':
    case 'b':
      return `**${children}**`;

    case 'em':
    case 'i':
      return `*${children}*`;

    case 'del':
    case 's':
      return `~~${children}~~`;

    case 'code':
      return `\`${children}\``;

    case 'pre': {
      const codeElement = element.querySelector('code');
      if (codeElement) {
        const language = codeElement.className.replace('language-', '') || '';
        return `\`\`\`${language}\n${codeElement.textContent || ''}\n\`\`\`\n\n`;
      }
      return `\`\`\`\n${element.textContent || ''}\n\`\`\`\n\n`;
    }

    case 'blockquote':
      return `> ${children.replace(/\n/g, '\n> ')}\n\n`;

    case 'ul':
      return convertListToMarkdown(element, false, options);

    case 'ol':
      return convertListToMarkdown(element, true, options);

    case 'li':
      return `${children}\n`;

    case 'a':
      return convertLinkToMarkdown(element, children, options);

    case 'img':
      return convertImageToMarkdown(element, options);

    case 'table':
      return convertTableToMarkdown(element, options);

    case 'tr':
      return convertTableRowToMarkdown(element, options);

    case 'th':
    case 'td':
      return children.trim();

    case 'hr':
      return '---\n\n';

    case 'div':
      return `${children}\n\n`;

    case 'span':
      return children;

    default:
      return children;
  }
}

/**
 * 将 HTML 字符串转换为 Markdown
 * @param html HTML 字符串
 * @param options 转换选项
 * @returns Markdown 字符串
 */
export function htmlToMarkdown(
  html: string,
  options: HtmlToMarkdownOptions = {},
): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // 创建临时 DOM 元素来解析 HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  return convertNodeToMarkdown(doc.body, options);
}

/**
 * 清理 HTML 字符串，移除不必要的空白和换行
 */
export function cleanHtml(html: string): string {
  return html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+</g, '<')
    .replace(/>\s+/g, '>')
    .trim();
}

/**
 * 检测 HTML 是否来自 Microsoft Word / Office 系。命中任意一个特征即视为 Word HTML：
 * - `<meta name="Generator" content="Microsoft Word|Office...">`
 * - Office XML 命名空间 `xmlns:o="urn:schemas-microsoft-com:office..."`
 * - `<o:p>` / `<w:...>` / `<m:...>` 自定义标签
 * - `class="MsoNormal"` 之类的 MSO 类
 */
export function isWordHtml(html: string): boolean {
  if (!html) return false;
  return (
    /<meta\s+name="Generator"[^>]*content="[^"]*(?:Microsoft\s+Word|Microsoft\s+Office)/i.test(
      html,
    ) ||
    /xmlns:[a-z]+="urn:schemas-microsoft-com:office/i.test(html) ||
    /<o:p[\s>/]/i.test(html) ||
    /class="Mso[A-Za-z]+/i.test(html)
  );
}

/**
 * 清理 Word/Office HTML 里 markdown 转换链不关心的噪声：
 * - Office 命名空间标签（o:p / w:* / m:* / v:*）
 * - IE/Word 条件注释（`<!--[if !supportLists]>...<![endif]-->`）
 * - 内联 mso-* 样式片段
 * - Mso* 类名
 * - 把 `&nbsp;` 还原为普通空格，便于 markdown 解析
 */
export function cleanWordHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<\/?(?:o|w|m|v):[^>]*>/gi, '')
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
    .replace(/(\s)?mso-[^:;"]+:[^;"]+;?/gi, '$1')
    .replace(/\sclass="Mso[^"]*"/gi, '')
    .replace(/&nbsp;/gi, ' ');
}

/**
 * 检测字符串是否为 HTML
 */
export function isHtml(text: string): boolean {
  if (!text || text.trim() === '') {
    return false;
  }

  // 检查基本的 HTML 标签
  const htmlTags = /<\/?[a-z][\s\S]*>/i;
  return htmlTags.test(text);
}

/**
 * 从 HTML 中提取纯文本
 */
export function extractTextFromHtml(html: string): string {
  if (!html) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * 批量转换 HTML 片段为 Markdown
 */
export function batchHtmlToMarkdown(
  htmlFragments: string[],
  options: HtmlToMarkdownOptions = {},
): string[] {
  return htmlFragments.map((fragment) => htmlToMarkdown(fragment, options));
}
