import json5 from 'json5';
import { htmlToFragmentList } from '../../plugins/insertParsedHtmlNodes';
import { EditorUtils } from '../../utils';
import partialJsonParse from '../json-parse';

/**
 * 解码 URI 组件，处理错误情况
 */
export const decodeURIComponentUrl = (url: string) => {
  try {
    return decodeURIComponent(url);
  } catch (e) {
    console.error('Failed to decode URI component:', e);
    return url;
  }
};

/**
 * 检测和解析 think 标签
 * @param str - 要检测的字符串
 * @returns think 标签的内容，如果不是 think 标签则返回 null
 */
const findThinkElement = (str: string) => {
  try {
    // 匹配 <think>内容</think> 格式
    const thinkMatch = str.match(/^\s*<think>([\s\S]*?)<\/think>\s*$/);
    if (thinkMatch) {
      return {
        content: thinkMatch[1].trim(),
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * 检测和解析 answer 标签
 * @param str - 要检测的字符串
 * @returns answer 标签的内容，如果不是 answer 标签则返回 null
 */
const findAnswerElement = (str: string) => {
  try {
    // 匹配 <answer>内容</answer> 格式
    const answerMatch = str.match(/^\s*<answer>([\s\S]*?)<\/answer>\s*$/);
    if (answerMatch) {
      return {
        content: answerMatch[1].trim(),
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * 从 HTML 字符串中提取媒体元素属性
 */
const extractMediaAttributes = (str: string) => {
  return {
    height: str.match(/height="(\d+)"/)?.[1],
    width: str.match(/width="(\d+)"/)?.[1],
    align: str.match(/data-align="(\w+)"/)?.[1],
    alt: str.match(/alt="([^"\n]+)"/)?.[1],
    controls: str.match(/controls/),
    autoplay: str.match(/autoplay/),
    loop: str.match(/loop/),
    muted: str.match(/muted/),
    poster: str.match(/poster="([^"\n]+)"/)?.[1],
  };
};

/**
 * 构建媒体元素对象
 */
const buildMediaElement = (
  url: string | undefined,
  tagName: string,
  attrs: ReturnType<typeof extractMediaAttributes>,
) => {
  const result: any = {
    url,
    align: attrs.align,
    alt: attrs.alt,
    tagName,
    controls: !!attrs.controls,
    autoplay: !!attrs.autoplay,
    loop: !!attrs.loop,
    muted: !!attrs.muted,
    poster: attrs.poster,
  };

  // 只有当值存在时才设置，避免类型错误
  if (attrs.height) {
    result.height = +attrs.height;
  }
  if (attrs.width) {
    result.width = +attrs.width;
  }

  return result;
};

/**
 * 从字符串中提取视频源 URL
 */
const extractVideoSource = (str: string, tagName: string | undefined) => {
  // 首先尝试从标签本身获取 src 属性
  let url = str.match(/src="([^"\n]+)"/);

  // 如果是 video 标签且没有找到 src，尝试从 source 标签中获取
  if (tagName === 'video' && !url) {
    const sourceMatch = str.match(/<source[^>]*src="([^"\n]+)"[^>]*>/);
    if (sourceMatch) {
      url = sourceMatch;
    }
  }

  return url?.[1];
};

/**
 * 查找并解析媒体元素（img/video/iframe）
 */
export const findImageElement = (str: string) => {
  try {
    // 首先尝试匹配包含 source 标签的 video 格式
    const videoWithSourceMatch = str.match(
      /^\s*<video[^>\n]*>[\s\S]*?<source[^>]*src="([^"\n]+)"[^>]*>[\s\S]*?<\/video>\s*$/,
    );

    if (videoWithSourceMatch) {
      const attrs = extractMediaAttributes(str);
      return buildMediaElement(videoWithSourceMatch[1], 'video', attrs);
    }

    // 尝试匹配各种媒体标签格式
    const patterns = [
      /^\s*<(img|video|iframe)[^>\n]*>.*?<\/(?:img|video|iframe)>\s*$/, // 完整标签对
      /^\s*<(img|video|iframe)[^>\n]*\/?>(.*<\/(?:img|video|iframe)>)?\s*$/, // 完整标签
      /^\s*<(img|video|iframe)[^>\n]*\/>\s*$/, // 自闭合标签
      /^\s*<(img|video|iframe)[^>\n]*>\s*$/, // 仅开始标签
    ];

    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match) {
        const tagName = match[0].match(/<(img|video|iframe)/)?.[1];
        const url = extractVideoSource(match[0], tagName);
        const attrs = extractMediaAttributes(match[0]);
        return buildMediaElement(url, tagName!, attrs);
      }
    }

    return null;
  } catch (e) {
    console.error('Failed to parse media element:', e);
    return null;
  }
};

/**
 * 根据媒体元素信息创建编辑器节点
 */
export const createMediaNodeFromElement = (
  mediaElement: ReturnType<typeof findImageElement>,
) => {
  if (!mediaElement) return null;

  // 根据标签类型确定媒体类型
  const mediaTypeMap: Record<string, string> = {
    video: 'video',
    iframe: 'iframe',
    img: 'image',
  };

  const mediaType = mediaTypeMap[mediaElement.tagName] || 'image';

  return EditorUtils.createMediaNode(
    decodeURIComponentUrl(mediaElement.url || ''),
    mediaType,
    {
      align: mediaElement.align,
      alt: mediaElement.alt,
      height: mediaElement.height,
      width: mediaElement.width,
      controls: mediaElement.controls,
      autoplay: mediaElement.autoplay,
      loop: mediaElement.loop,
      muted: mediaElement.muted,
      poster: mediaElement.poster,
    },
  );
};

/**
 * 标准 HTML 元素列表
 * 这些标签会被正常解析为 HTML，其他标签会被当作普通文本处理
 */
export const STANDARD_HTML_ELEMENTS = new Set([
  // 文档结构
  'html',
  'head',
  'body',
  'title',
  'meta',
  'link',
  'style',
  'script',
  // 内容分区
  'header',
  'nav',
  'main',
  'section',
  'article',
  'aside',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  // 文本内容
  'div',
  'p',
  'hr',
  'pre',
  'blockquote',
  // 列表
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  // 表格
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'caption',
  'colgroup',
  'col',
  // 表单
  'form',
  'input',
  'textarea',
  'button',
  'select',
  'option',
  'label',
  'fieldset',
  'legend',
  // 内联文本语义
  'a',
  'em',
  'strong',
  'small',
  'mark',
  'del',
  'ins',
  'sub',
  'sup',
  'i',
  'b',
  'u',
  's',
  'code',
  'kbd',
  'samp',
  'var',
  'span',
  'br',
  'wbr',
  // 图片和多媒体
  'img',
  'video',
  'audio',
  'source',
  'track',
  'iframe',
  'embed',
  'object',
  'param',
  'picture',
  // 其他
  'canvas',
  'svg',
  'math',
  'details',
  'summary',
  'dialog',
  'menu',
  'menuitem',
  // 字体
  'font',
]);

/**
 * 检查 HTML 标签是否为标准元素
 * @param htmlString - HTML 字符串
 * @returns 是否为标准 HTML 元素
 */
export function isStandardHtmlElement(htmlString: string): boolean {
  // 提取标签名（支持开始标签和结束标签）
  const tagMatch = htmlString.match(/<\/?(\w+)/);
  if (!tagMatch) return false;

  const tagName = tagMatch[1].toLowerCase();
  return STANDARD_HTML_ELEMENTS.has(tagName);
}

/**
 * 解析 HTML 注释中的上下文属性
 */
const parseCommentContextProps = (
  value: string,
  processedValue: string,
): any => {
  const isComment =
    value &&
    processedValue?.trim()?.endsWith('-->') &&
    processedValue.trim()?.startsWith('<!--');

  if (!isComment) {
    return {};
  }

  try {
    return json5.parse(value);
  } catch (e) {
    try {
      return partialJsonParse(value);
    } catch (parseError) {
      console.warn('Failed to parse HTML comment as JSON or partial JSON:', {
        value,
        error: parseError,
      });
    }
    console.warn('HTML comment parse fallback attempted:', e);
  }
  return {};
};

/**
 * 处理块级 HTML 元素
 */
const handleBlockHtml = (
  currentElement: any,
  processedValue: string,
  isUnclosedComment: boolean,
): any => {
  const thinkElement = findThinkElement(currentElement.value);
  if (thinkElement) {
    return {
      type: 'code',
      language: 'think',
      value: thinkElement.content,
      children: [{ text: thinkElement.content }],
    };
  }

  const answerElement = findAnswerElement(currentElement.value);
  if (answerElement) {
    return { text: answerElement.content };
  }

  const mediaElement = findImageElement(currentElement.value);
  if (mediaElement) {
    return createMediaNodeFromElement(mediaElement);
  }

  if (currentElement.value === '<br/>') {
    return { type: 'paragraph', children: [{ text: '' }] };
  }

  if (currentElement.value.match(/^<\/(img|video|iframe)>/)) {
    return null;
  }

  const commentValue = isUnclosedComment
    ? processedValue
    : currentElement.value;
  const isComment =
    commentValue.trim().startsWith('<!--') &&
    commentValue.trim().endsWith('-->');
  // 检查是否是 otherProps 序列化生成的 JSON 注释
  // 这些注释应该被跳过，不应该被解析为 HTML 代码块
  // 但是，如果注释包含图表配置（chartType），应该保留为 code 节点以便表格解析器使用
  if (isComment) {
    try {
      const commentContent = commentValue
        .replace('<!--', '')
        .replace('-->', '')
        .trim();
      const parsed = JSON.parse(commentContent);

      // 检查是否是图表配置
      const isChartConfig =
        // 对象格式：{"chartType": ...}
        (typeof parsed === 'object' &&
          parsed !== null &&
          !Array.isArray(parsed) &&
          parsed.chartType) ||
        // 数组格式：[{"chartType": ...}]
        (Array.isArray(parsed) &&
          parsed.length > 0 &&
          typeof parsed[0] === 'object' &&
          parsed[0]?.chartType);

      // 如果能够成功解析为 JSON 对象，且是对象类型（不是数组或基本类型）
      // 注意：对象格式的图表配置已经在 handleHtml 中转换为数组格式了
      // 这里只处理非图表配置的对象格式注释
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        // 如果包含 chartType 字段，说明是图表配置，应该已经在 handleHtml 中转换为数组格式
        // 这里不应该再匹配到对象格式的图表配置，继续正常处理
        if (isChartConfig && parsed.chartType) {
          // 继续正常处理，创建 code 节点（此时应该已经是数组格式了）
        } else {
          // 否则认为是 otherProps 序列化生成的注释，应该返回空文本
          // 这些注释应该在 parserMarkdownToSlateNode 中被跳过
          return { text: '' };
        }
      }
    } catch (e) {
      // 解析失败，不是 JSON 格式的注释，继续正常处理
    }
  }

  if (isComment || isStandardHtmlElement(commentValue)) {
    return commentValue.match(/<\/?(table|div|ul|li|ol|p|strong)[^\n>]*?>/)
      ? htmlToFragmentList(commentValue, '')
      : {
          type: 'code',
          language: 'html',
          render: true,
          value: commentValue,
          children: [{ text: commentValue }],
        };
  }

  return { text: currentElement.value };
};

/**
 * 应用元素配置属性（纯函数版本）
 */
const applyElementConfig = (
  el: any,
  contextProps: any,
  processedValue: string,
  isUnclosedComment: boolean,
  currentElement: any,
): any => {
  if (!el || Array.isArray(el)) {
    return el;
  }

  const isPlainText = 'text' in el && Object.keys(el).length === 1;
  if (isPlainText) {
    return el;
  }

  const valueToCheck = isUnclosedComment
    ? processedValue
    : currentElement?.value;

  const otherProps: any = { ...contextProps };
  // 只有当 finished === false 时才设置 finished 属性，否则删除
  if (isUnclosedComment) {
    otherProps.finished = false;
  }

  const result: any = {
    ...el,
    isConfig: valueToCheck?.trim()?.startsWith('<!--'),
  };

  // 只有当 otherProps 有内容时才设置，避免类型错误
  if (Object.keys(otherProps).length > 0) {
    result.otherProps = otherProps;
  }

  return result;
};

/**
 * 处理 span 标签的样式属性（纯函数版本）
 */
const processSpanTag = (str: string, tag: string, htmlTag: any[]): any[] => {
  try {
    const styles = str.match(/style="([^"\n]+)"/);
    if (!styles) {
      return htmlTag;
    }

    const stylesMap = new Map(
      styles[1]
        .split(';')
        .map((item: string) =>
          item.split(':').map((item: string) => item.trim()),
        ) as [string, string][],
    );

    const color = stylesMap.get('color');
    if (color) {
      return [...htmlTag, { tag, color }];
    }
  } catch (e) {
    console.warn('Failed to parse span style attribute:', { str, error: e });
  }
  return htmlTag;
};

/**
 * 处理 a 标签的链接属性（纯函数版本）
 */
const processATag = (str: string, tag: string, htmlTag: any[]): any[] => {
  const url = str.match(/href="([\w:./_\-#\\]+)"/);
  if (url) {
    return [...htmlTag, { tag, url: url[1] }];
  }
  return htmlTag;
};

/**
 * 处理 font 标签的颜色属性（纯函数版本）
 */
const processFontTag = (str: string, tag: string, htmlTag: any[]): any[] => {
  const colorMatch =
    str.match(/color="([^"\n]+)"/) || str.match(/color=([^"\n]+)/);
  if (colorMatch) {
    return [
      ...htmlTag,
      {
        tag,
        color: colorMatch[1].replaceAll('>', ''),
      },
    ];
  }
  return htmlTag;
};

/**
 * HTML 标签处理器映射表
 */
const htmlTagProcessors: Record<
  string,
  (str: string, tag: string, htmlTag: any[]) => any[]
> = {
  span: processSpanTag,
  a: processATag,
  font: processFontTag,
};

/**
 * 处理HTML标签并添加到标签栈中（纯函数版本）
 * @param str - HTML标签字符串
 * @param tag - 标签名称
 * @param htmlTag - HTML标签栈
 * @returns 返回新的标签栈数组
 */
const processHtmlTag = (str: string, tag: string, htmlTag: any[]): any[] => {
  const processor = htmlTagProcessors[tag];
  if (processor) {
    return processor(str, tag, htmlTag);
  }
  return [...htmlTag, { tag }];
};

/**
 * 处理内联HTML元素（纯函数版本）
 * @param currentElement - 当前处理的HTML元素
 * @param htmlTag - HTML标签栈
 * @returns 返回处理后的元素对象和新的标签栈，如果是标签则返回null
 */
const processInlineHtml = (
  currentElement: any,
  htmlTag: any[],
): { el: any; htmlTag: any[] } => {
  const value = currentElement.value;

  if (value.match(/<br\/?>/)) {
    return { el: { type: 'break', children: [{ text: '\n' }] }, htmlTag };
  }

  const answerElement = findAnswerElement(value);
  if (answerElement) {
    return { el: { text: answerElement.content }, htmlTag };
  }

  if (!isStandardHtmlElement(value)) {
    return { el: { text: value }, htmlTag };
  }

  const htmlMatch = value.match(
    /<\/?(b|i|del|font|code|span|sup|sub|strong|a)[^\n>]*?>/,
  );
  if (htmlMatch) {
    const [str, tag] = htmlMatch;
    const isClosingTag = str.startsWith('</');
    const isMatchingTag =
      isClosingTag && htmlTag.length && htmlTag[htmlTag.length - 1].tag === tag;

    let newHtmlTag = htmlTag;
    if (isMatchingTag) {
      newHtmlTag = htmlTag.slice(0, -1);
    }
    if (!isClosingTag) {
      newHtmlTag = processHtmlTag(str, tag, newHtmlTag);
    }
    return { el: null, htmlTag: newHtmlTag };
  }

  const mediaElement = findImageElement(value);
  return {
    el: mediaElement
      ? createMediaNodeFromElement(mediaElement)
      : { text: value },
    htmlTag,
  };
};

/**
 * 查找附件链接
 */
export const findAttachment = (str: string) => {
  try {
    const match = str.match(/^\s*<a[^>\n]*download[^>\n]*\/?>(.*<\/a>:?)?\s*$/);
    if (match) {
      const url = match[0].match(/href="([^"\n]+)"/);
      const size = match[0].match(/data-size="(\d+)"/);
      if (url) {
        return { url: url[1], size: Number(size?.[1] || 0) };
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * 处理HTML节点
 * @param currentElement - 当前处理的HTML元素
 * @param parent - 父级元素，用于判断上下文
 * @param htmlTag - HTML标签栈，用于跟踪嵌套的HTML标签
 * @returns 返回包含解析后元素和上下文属性的对象
 */
export const handleHtml = (
  currentElement: any,
  parent: any,
  htmlTag: any[],
) => {
  const trimmedValue = currentElement?.value?.trim() || '';
  const isUnclosedComment =
    trimmedValue.startsWith('<!--') && !trimmedValue.endsWith('-->');

  let processedValue = isUnclosedComment
    ? trimmedValue + '-->'
    : currentElement?.value || '';

  // 检查是否是对象格式的图表配置，如果是则转换为数组格式
  const isComment =
    processedValue.trim().startsWith('<!--') &&
    processedValue.trim().endsWith('-->');
  if (isComment) {
    try {
      const commentContent = processedValue
        .replace('<!--', '')
        .replace('-->', '')
        .trim();
      const parsed = JSON.parse(commentContent);
      // 如果是对象格式且包含 chartType，转换为数组格式
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed) &&
        parsed.chartType
      ) {
        const arrayFormat = [parsed];
        const convertedContent = JSON.stringify(arrayFormat);
        processedValue = `<!--${convertedContent}-->`;
        // 同时更新 currentElement.value，以便后续处理使用
        currentElement.value = processedValue;
      }
    } catch (e) {
      // 解析失败，不是 JSON 格式的注释，继续正常处理
    }
  }

  const value =
    processedValue?.replace('<!--', '').replace('-->', '').trim() || '{}';

  const contextProps = parseCommentContextProps(value, processedValue);

  const isBlockLevel =
    !parent || ['listItem', 'blockquote'].includes(parent.type);

  let el: any;
  let updatedHtmlTag = htmlTag;

  if (isBlockLevel) {
    el = handleBlockHtml(currentElement, processedValue, isUnclosedComment);
  } else {
    const inlineResult = processInlineHtml(currentElement, htmlTag);
    el = inlineResult.el;
    updatedHtmlTag = inlineResult.htmlTag;
  }

  const configuredEl = applyElementConfig(
    el,
    contextProps,
    processedValue,
    isUnclosedComment,
    currentElement,
  );

  return { el: configuredEl, contextProps, htmlTag: updatedHtmlTag };
};

/**
 * 预处理特殊标签（think/answer），将其转换为代码块格式
 * @param markdown - 原始 Markdown 字符串
 * @param tagName - 标签名称（think 或 answer）
 * @returns 处理后的 Markdown 字符串
 */
export function preprocessSpecialTags(
  markdown: string,
  tagName: 'think' | 'answer',
): string {
  const tagRegex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'g');

  return markdown?.replace(tagRegex, (match, content) => {
    const trimmedContent = content.trim();

    // 如果内容中包含代码块标记（三个反引号），需要进行转义
    // 策略：使用特殊标记替换代码块，保持原始格式
    const processedContent = trimmedContent?.replace(
      /```(\w*)\n?([\s\S]*?)```/g,
      (_: string, lang: string, code: string) => {
        // 使用特殊标记包裹，保留语言和代码内容
        // 格式：【CODE_BLOCK:lang】code【/CODE_BLOCK】
        const marker = '\u200B'; // 零宽空格，用于标记
        return `${marker}【CODE_BLOCK:${lang || ''}】\n${code}\n【/CODE_BLOCK】${marker}`;
      },
    );

    // 构建对应类型的代码块
    return `\`\`\`${tagName}\n${processedContent}\n\`\`\``;
  });
}

/**
 * 预处理 <think> 标签，将其转换为 ```think 代码块格式
 * @param markdown - 原始 Markdown 字符串
 * @returns 处理后的 Markdown 字符串
 */
export function preprocessThinkTags(markdown: string): string {
  return preprocessSpecialTags(markdown, 'think');
}

/**
 * 预处理所有非标准 HTML 标签，提取其内容（删除标签本身）
 * @param markdown - 原始 Markdown 字符串
 * @returns 处理后的 Markdown 字符串
 */
export function preprocessNonStandardHtmlTags(markdown: string): string {
  let result = markdown;
  let hasNonStandardTags = true;

  // 循环处理，直到没有非标准标签（处理嵌套情况）
  while (hasNonStandardTags) {
    const before = result;

    // 匹配所有 HTML 标签对：<tagname>content</tagname>
    result = result.replace(
      /<(\w+)>([\s\S]*?)<\/\1>/g,
      (match, tagName, content) => {
        // 检查是否为标准 HTML 元素
        if (STANDARD_HTML_ELEMENTS.has(tagName.toLowerCase())) {
          // 标准元素保持不变
          return match;
        }
        // 非标准元素只保留内容（不 trim，保持原始格式）
        return content;
      },
    );

    // 如果没有变化，说明处理完成
    hasNonStandardTags = before !== result;
  }

  return result;
}
