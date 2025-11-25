/**
 * 此文件包含大量相互依赖的函数，为了保持代码的可读性和逻辑分组，
 * 我们允许函数在定义前使用（函数提升）
 */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import json5 from 'json5';
import type { Root, RootContent, Table } from 'mdast';
//@ts-ignore
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { Element } from 'slate';
import { fixStrongWithSpecialChars } from './remarkParse';

import {
  CardNode,
  ChartNode,
  CustomLeaf,
  Elements,
  InlineKatexNode,
} from '../../el';
import { MarkdownEditorPlugin } from '../../plugin';
import { htmlToFragmentList } from '../plugins/insertParsedHtmlNodes';
import { TableNode, TrNode as TableRowNode } from '../types/Table';
import { EditorUtils } from '../utils';
import { isCodeBlockLikelyComplete } from '../utils/findMatchingClose';
import partialJsonParse from './json-parse';
import mdastParser from './remarkParse';

// 常量定义
const EMPTY_LINE_DISTANCE_THRESHOLD = 4; // 两个元素之间的行距阈值
const EMPTY_LINE_CALCULATION_OFFSET = 2; // 计算空行数量时的偏移量
const EMPTY_LINE_DIVISOR = 2; // 计算空行数量的除数
const MIN_TABLE_CELL_LENGTH = 5; // 表格单元格最小长度
const INLINE_MATH_SUFFIX_PATTERN = '(?:%|[kKmMbB]|千|万|亿|兆|万亿|百万|亿万)?';
const INLINE_MATH_CURRENCY_PATTERN = new RegExp(
  `^[+-]?\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?${INLINE_MATH_SUFFIX_PATTERN}$`,
);
const INLINE_MATH_SIMPLE_NUMBER_PATTERN = new RegExp(
  `^[+-]?\\d+(?:\\.\\d+)?${INLINE_MATH_SUFFIX_PATTERN}$`,
);

// HTML 转义和代码块检测相关的常量
const NOT_SPACE_START = /^\S*/;
const ENDING_NEWLINE = /\n$/;
const FENCED_CODE_REGEX = /^(`{3,}|~{3,})/;

const shouldTreatInlineMathAsText = (rawValue: string): boolean => {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return true;
  }
  if (/[=^_\\{}]/.test(trimmedValue)) {
    return false;
  }
  return (
    INLINE_MATH_CURRENCY_PATTERN.test(trimmedValue) ||
    INLINE_MATH_SIMPLE_NUMBER_PATTERN.test(trimmedValue)
  );
};

// 类型定义
type CodeElement = {
  type: string;
  language?: string | null;
  render?: boolean;
  value: any;
  isConfig?: boolean;
  children: Array<{ text: string }>;
  otherProps?: Record<string, any>;
};

type LanguageHandler = (element: CodeElement, value: string) => CodeElement;

// 处理schema类型语言的辅助函数
const processSchemaLanguage = (
  element: CodeElement,
  value: string,
): CodeElement => {
  let json = [];
  try {
    json = json5.parse(value || '[]');
  } catch (error) {
    try {
      json = partialJsonParse(value || '[]');
    } catch (error) {
      json = value as any;
      console.error('parse schema error', error);
    }
  }
  return {
    ...element,
    type: 'apaasify',
    value: json,
    children: [{ text: value }],
  };
};

// 语言类型处理策略配置
const LANGUAGE_HANDLERS: Record<string, LanguageHandler> = {
  mermaid: (element) => ({
    ...element,
    type: 'mermaid',
  }),
  schema: processSchemaLanguage,
  apaasify: processSchemaLanguage,
  apassify: processSchemaLanguage,
  katex: (element) => ({
    ...element,
    type: 'katex',
  }),
  'agentar-card': processSchemaLanguage,
};

const advancedNumericCheck = (value: string | number) => {
  const numericPattern = /^[-+]?[0-9,]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
  return (
    typeof value === 'number' ||
    (typeof value === 'string' && numericPattern.test(value))
  );
};
const isNumericValue = (value: string | number) => {
  return (
    typeof value === 'number' ||
    (!isNaN(parseFloat(value)) && isFinite(value as unknown as number)) ||
    advancedNumericCheck(value)
  );
};

/**
 * 判断是否包含不完整输入
 * 如果一行中包含可能尚未完成的数字输入，返回 true
 */
const hasIncompleteNumericInput = (values: any[]): boolean => {
  // 检查是否有可能是正在输入的不完整数字
  // 例如: '12.' 或 '0.' 或 '-' 或 仅有一个数字字符的情况
  return values.some((val) => {
    if (typeof val !== 'string') return false;
    return (
      (val.endsWith('.') && /\d/.test(val)) || // 以小数点结尾
      val === '-' || // 只有负号
      val === '+' || // 只有正号
      (val.length === 1 && /\d/.test(val)) // 只有一个数字
    );
  });
};

// 获取文件中定义的AlignType类型或声明一个等效类型
type AlignType = 'left' | 'center' | 'right' | null;

/**
 * 规范化字段名，统一处理转义字符
 * 将 `index\_value` 转换为 `index_value`，确保字段名一致
 * @param fieldName - 原始字段名
 * @returns 规范化后的字段名
 */
const normalizeFieldName = (fieldName: string): string => {
  if (!fieldName) return fieldName;
  // 移除转义字符：将 `\_` 转换为 `_`，`\\` 转换为 `\`
  return fieldName
    .replace(/\\_/g, '_')
    .replace(/\\\\/g, '\\')
    .replace(/\\(?=")/g, '') // 移除转义的双引号
    .trim();
};

const getColumnAlignment = (
  data: any[],
  columns: {
    dataIndex: string;
  }[],
): AlignType[] => {
  if (!data.length) return [];

  // 缓存上一次的对齐结果，避免频繁切换
  const prevAlignments: AlignType[] = [];

  return columns.map((col, index) => {
    const values = data
      .map((row: { [x: string]: any }) => row[col.dataIndex])
      .filter(Boolean);
    values?.pop();
    // 如果检测到可能正在输入的数字，保持当前对齐状态
    if (hasIncompleteNumericInput(values)) {
      return prevAlignments[index] || null;
    }

    const alignment: AlignType = values.every(isNumericValue) ? 'right' : null;
    prevAlignments[index] = alignment;
    return alignment;
  });
};

const stringifyObj = remark()
  .use(remarkParse)
  .use(fixStrongWithSpecialChars)
  .use(remarkMath as any, {
    singleDollarTextMath: false,
  })
  .use(remarkRehype as any, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeKatex as any)
  .use(remarkGfm)
  .use(remarkFrontmatter, ['yaml']);

const myRemark = {
  stringify: (obj: Root) => {
    const mdStr = stringifyObj.stringify(obj);
    return mdStr;
  },
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
  return {
    url,
    height: attrs.height ? +attrs.height : undefined,
    width: attrs.width ? +attrs.width : undefined,
    align: attrs.align,
    alt: attrs.alt,
    tagName,
    controls: !!attrs.controls,
    autoplay: !!attrs.autoplay,
    loop: !!attrs.loop,
    muted: !!attrs.muted,
    poster: attrs.poster,
  };
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
const findImageElement = (str: string) => {
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
const createMediaNodeFromElement = (
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

const findAttachment = (str: string) => {
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

const parseText = (
  els: RootContent[],
  leaf: CustomLeaf = {
    data: {},
  },
) => {
  let leafs: CustomLeaf[] = [];
  for (let n of els) {
    if (n.type === 'strong')
      leafs = leafs.concat(parseText(n.children, { ...leaf, bold: true }));
    if (n.type === 'emphasis')
      leafs = leafs.concat(parseText(n.children, { ...leaf, italic: true }));
    if (n.type === 'delete')
      leafs = leafs.concat(
        parseText(n.children, { ...leaf, strikethrough: true }),
      );
    if (n.type === 'link') {
      leafs = leafs.concat(parseText(n.children, { ...leaf, url: n?.url }));
    }
    if (n.type === 'inlineCode')
      leafs.push({ ...leaf, text: (n as any).value, code: true });
    if (n.type === 'inlineMath') {
      const inlineMathValue =
        typeof (n as any).value === 'string'
          ? ((n as any).value as string)
          : '';
      if (shouldTreatInlineMathAsText(inlineMathValue)) {
        leafs.push({ ...leaf, text: `$${inlineMathValue}$` });
        continue;
      }
      // 处理内联数学公式，返回一个特殊的节点而不是叶子节点
      leafs.push({
        ...leaf,
        type: 'inline-katex',
        children: [{ text: inlineMathValue }],
      } as any);
      continue; // 跳过后面的默认处理
    }
    // @ts-ignore
    leafs.push({ ...leaf, text: (n as any).value || '' });
  }
  return leafs;
};

const parseTableOrChart = (
  table: Table,
  preNode: RootContent,
  plugins: MarkdownEditorPlugin[],
  parserConfig?: ParserMarkdownToSlateNodeConfig,
): CardNode => {
  const keyMap = new Map<string, string>();

  // @ts-ignore
  const config =
    // @ts-ignore
    preNode?.type === 'code' && // @ts-ignore
    preNode?.language === 'html' && // @ts-ignore
    preNode?.otherProps
      ? // @ts-ignore
        preNode?.otherProps
      : {};

  const tableHeader = table?.children?.at(0);
  const columns =
    tableHeader?.children
      ?.map((node) => {
        return myRemark
          .stringify({
            type: 'root',
            children: [node],
          })
          ?.replace(/\n/g, '')
          .trim();
      })
      .map((title) => {
        // 先规范化字段名，统一处理转义字符
        const normalizedTitle = normalizeFieldName(title || ' ');
        return normalizedTitle;
      })
      .map((title, index) => {
        if (keyMap.has(title)) {
          keyMap.set(title, keyMap.get(title) + '_' + index);
          return {
            title: title,
            dataIndex: title + '_' + index,
            key: title + '_' + index,
          };
        }
        keyMap.set(title, title);
        return {
          title: title,
          dataIndex: title,
          key: title,
        };
      }) || [];

  const dataSource =
    table?.children?.slice(1)?.map((row) => {
      return row.children?.reduce((acc, cell, index) => {
        // 如果数据列数超出表头列数，舍弃多余的数据
        if (index >= columns.length) {
          return acc;
        }
        acc[columns[index].dataIndex] = myRemark
          .stringify({
            type: 'root',
            children: [cell],
          })
          ?.replace(/\n/g, '')
          ?.replace(/\\(?=")/g, '')
          ?.replace(/\\_/g, '')
          ?.trim();
        return acc;
      }, {} as any);
    }) || [];

  if (table.align?.every((item) => !item)) {
    const aligns = getColumnAlignment(dataSource, columns);
    table.align = aligns;
  }

  const aligns = table.align;

  const isChart = config?.chartType || config?.at?.(0)?.chartType;

  /**
   * 如果是分栏，将表格转换为分栏节点
   */

  // 计算合并单元格信息
  const mergeCells = config.mergeCells || [];

  // 创建合并单元格映射，用于快速查找
  const mergeMap = new Map<
    string,
    { rowSpan: number; colSpan: number; hidden?: boolean }
  >();
  mergeCells?.forEach(
    ({ row, col, rowSpan, rowspan, colSpan, colspan }: any) => {
      let rawRowSpan = rowSpan || rowspan;
      let rawColSpan = colSpan || colspan;
      // 主单元格
      mergeMap.set(`${row}-${col}`, {
        rowSpan: rawRowSpan,
        colSpan: rawColSpan,
      });

      // 被合并的单元格标记为隐藏
      for (let r = row; r < row + rawRowSpan; r++) {
        for (let c = col; c < col + rawColSpan; c++) {
          if (r !== row || c !== col) {
            mergeMap.set(`${r}-${c}`, { rowSpan: 1, colSpan: 1, hidden: true });
          }
        }
      }
    },
  );

  const children = table.children.map((r: { children: any[] }, l: number) => {
    return {
      type: 'table-row',
      align: aligns?.[l] || undefined,
      children: r.children.map(
        (c: { children: string | any[] }, i: string | number) => {
          const mergeInfo = mergeMap.get(`${l}-${i}`);
          return {
            type: 'table-cell',
            align: aligns?.[i as number] || undefined,
            title: l === 0,
            rows: l,
            cols: i,
            // 直接设置 rowSpan 和 colSpan
            ...(mergeInfo?.rowSpan && mergeInfo.rowSpan > 1
              ? { rowSpan: mergeInfo.rowSpan }
              : {}),
            ...(mergeInfo?.colSpan && mergeInfo.colSpan > 1
              ? { colSpan: mergeInfo.colSpan }
              : {}),
            // 如果是被合并的单元格，标记为隐藏
            ...(mergeInfo?.hidden ? { hidden: true } : {}),
            children: c.children?.length
              ? [
                  {
                    type: 'paragraph',
                    children: parseNodes(
                      c.children as any,
                      plugins,
                      false,
                      c as any,
                      parserConfig,
                    ),
                  },
                ]
              : [
                  {
                    type: 'paragraph',
                    children: [{ text: '' }],
                  },
                ],
          };
        },
      ),
    };
  }) as TableRowNode[];
  // 检查表格是否完成（未闭合）
  // 如果 table 节点有 otherProps.finish，使用它；否则默认为 false（未完成）
  const isFinished =
    (table as any)?.otherProps?.finish !== undefined
      ? (table as any).otherProps.finish
      : false;

  const otherProps = {
    ...(isChart
      ? {
          config,
        }
      : config),
    columns,
    dataSource: dataSource.map((item) => {
      delete item?.chartType;
      return {
        ...item,
      };
    }),
    finish: isFinished, // 标记表格是否完成（未闭合时为 false）
  };

  const node: TableNode | ChartNode = {
    type: isChart ? 'chart' : 'table',
    children: children,
    otherProps,
  } as any;
  return EditorUtils.wrapperCardNode(node);
};

/**
 * 处理标题节点
 * @param currentElement - 当前处理的标题元素，包含depth和children属性
 * @returns 返回格式化的标题节点对象
 */
const handleHeading = (
  currentElement: any,
  plugins: MarkdownEditorPlugin[],
  parserConfig?: ParserMarkdownToSlateNodeConfig,
) => {
  return {
    type: 'head',
    level: currentElement.depth,
    children: currentElement.children?.length
      ? parseNodes(
          currentElement.children,
          plugins,
          false,
          currentElement,
          parserConfig,
        )
      : [{ text: '' }],
  };
};

export const decodeURIComponentUrl = (url: string) => {
  try {
    return decodeURIComponent(url);
  } catch (e) {
    console.error('Failed to decode URI component:', e);
    return url;
  }
};

/**
 * 处理HTML节点
 * @param currentElement - 当前处理的HTML元素
 * @param parent - 父级元素，用于判断上下文
 * @param htmlTag - HTML标签栈，用于跟踪嵌套的HTML标签
 * @returns 返回包含解析后元素和上下文属性的对象
 */
const handleHtml = (currentElement: any, parent: any, htmlTag: any[]) => {
  const value =
    currentElement?.value?.replace('<!--', '').replace('-->', '').trim() ||
    '{}';

  let contextProps = {};
  if (
    value &&
    currentElement?.value?.trim()?.endsWith('-->') &&
    currentElement?.value.trim()?.startsWith('<!--')
  ) {
    try {
      contextProps = json5.parse(value);
    } catch (e) {
      try {
        contextProps = partialJsonParse(value);
      } catch (parseError) {
        console.warn('Failed to parse HTML comment as JSON or partial JSON:', {
          value,
          error: parseError,
        });
      }
      console.warn('HTML comment parse fallback attempted:', e);
    }
  }

  let el: any;
  if (!parent || ['listItem', 'blockquote'].includes(parent.type)) {
    // 检查是否为不完整的图片标记
    const incompleteImageMatch = currentElement.value.match(
      /<incomplete-image\s+data-raw="([^"]+)"\s*\/?>/,
    );
    if (incompleteImageMatch) {
      const rawMarkdown = decodeURIComponent(incompleteImageMatch[1]);
      // 直接创建带有 loading 状态的图片节点（不通过 createMediaNode，因为 URL 为空）
      el = EditorUtils.wrapperCardNode({
        type: 'image',
        url: '', // 空 URL 表示不完整的图片
        mediaType: 'image',
        alt: rawMarkdown,
        loading: true,
        rawMarkdown: rawMarkdown,
        children: [{ text: '' }],
      } as any);
    } else {
      // 检查是否为 <think> 标签
      const thinkElement = findThinkElement(currentElement.value);
      if (thinkElement) {
        // 将 <think> 标签转换为 think 类型的代码块
        el = {
          type: 'code',
          language: 'think',
          value: thinkElement.content,
          children: [
            {
              text: thinkElement.content,
            },
          ],
        };
      } else {
        // 检查是否为 <answer> 标签
        const answerElement = findAnswerElement(currentElement.value);
        if (answerElement) {
          // 将 <answer> 标签的内容作为普通文本
          el = { text: answerElement.content };
        } else {
          const mediaElement = findImageElement(currentElement.value);
          if (mediaElement) {
            el = createMediaNodeFromElement(mediaElement);
          } else if (currentElement.value === '<br/>') {
            el = { type: 'paragraph', children: [{ text: '' }] };
          } else if (currentElement.value.match(/^<\/(img|video|iframe)>/)) {
            // 如果是媒体标签的结束标签，跳过处理
            el = null;
          } else {
            // 检查是否为注释（注释需要特殊处理以提取配置）
            const isComment =
              currentElement.value.trim().startsWith('<!--') &&
              currentElement.value.trim().endsWith('-->');

            // 检查是否为标准 HTML 元素或注释
            if (isComment || isStandardHtmlElement(currentElement.value)) {
              // 标准 HTML 元素或注释：按原逻辑处理
              el = currentElement.value.match(
                /<\/?(table|div|ul|li|ol|p|strong)[^\n>]*?>/,
              )
                ? htmlToFragmentList(currentElement.value, '')
                : {
                    type: 'code',
                    language: 'html',
                    render: true,
                    value: currentElement.value,
                    children: [
                      {
                        text: currentElement.value,
                      },
                    ],
                  };
            } else {
              // 非标准元素（如自定义标签）：当作普通文本处理
              el = { text: currentElement.value };
            }
          }
        }
      }
    }
  } else {
    el = processInlineHtml(currentElement, htmlTag);
  }

  if (el && !Array.isArray(el)) {
    // 只有非文本节点才设置 isConfig 和 otherProps
    if (!('text' in el && Object.keys(el).length === 1)) {
      el.isConfig = currentElement?.value?.trim()?.startsWith('<!--');
      el.otherProps = contextProps;
    }
  }

  return { el, contextProps };
};

/**
 * 处理内联HTML元素
 * @param currentElement - 当前处理的HTML元素
 * @param htmlTag - HTML标签栈
 * @returns 返回处理后的元素对象，如果是标签则返回null
 */
const processInlineHtml = (currentElement: any, htmlTag: any[]) => {
  const breakMatch = currentElement.value.match(/<br\/?>/);
  if (breakMatch) {
    return { type: 'break', children: [{ text: '\n' }] };
  }

  // 检查是否为 <answer> 标签（内联场景）
  const answerElement = findAnswerElement(currentElement.value);
  if (answerElement) {
    // 将 <answer> 标签的内容作为普通文本
    return { text: answerElement.content };
  }

  // 检查是否为不完整的图片标记
  const incompleteImageMatch = currentElement.value.match(
    /<incomplete-image\s+data-raw="([^"]+)"\s*\/?>/,
  );
  if (incompleteImageMatch) {
    const rawMarkdown = decodeURIComponent(incompleteImageMatch[1]);
    // 直接创建带有 loading 状态的图片节点（不通过 createMediaNode，因为 URL 为空）
    return EditorUtils.wrapperCardNode({
      type: 'image',
      url: '', // 空 URL 表示不完整的图片
      mediaType: 'image',
      alt: rawMarkdown,
      loading: true,
      rawMarkdown: rawMarkdown,
      children: [{ text: '' }],
    } as any);
  }

  // 检查是否为非标准 HTML 元素，如果是则直接当作文本
  if (!isStandardHtmlElement(currentElement.value)) {
    return { text: currentElement.value };
  }

  const htmlMatch = currentElement.value.match(
    /<\/?(b|i|del|font|code|span|sup|sub|strong|a)[^\n>]*?>/,
  );

  if (htmlMatch) {
    const [str, tag] = htmlMatch;
    if (
      str.startsWith('</') &&
      htmlTag.length &&
      htmlTag[htmlTag.length - 1].tag === tag
    ) {
      htmlTag.pop();
    }
    if (!str.startsWith('</')) {
      processHtmlTag(str, tag, htmlTag);
    }
    return null;
  } else {
    const mediaElement = findImageElement(currentElement.value);
    if (mediaElement) {
      return createMediaNodeFromElement(mediaElement);
    } else {
      return { text: currentElement.value };
    }
  }
};

/**
 * 处理HTML标签并添加到标签栈中
 * @param str - HTML标签字符串
 * @param tag - 标签名称
 * @param htmlTag - HTML标签栈
 */
const processHtmlTag = (str: string, tag: string, htmlTag: any[]) => {
  if (tag === 'span') {
    try {
      const styles = str.match(/style="([^"\n]+)"/);
      if (styles) {
        const stylesMap = new Map(
          styles[1]
            .split(';')
            .map((item: string) =>
              item.split(':').map((item: string) => item.trim()),
            ) as [string, string][],
        );
        if (stylesMap.get('color')) {
          htmlTag.push({
            tag: tag,
            color: stylesMap.get('color') as string,
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse span style attribute:', { str, error: e });
    }
  } else if (tag === 'a') {
    const url = str.match(/href="([\w:./_\-#\\]+)"/);
    if (url) {
      htmlTag.push({
        tag: tag,
        url: url[1],
      });
    }
  } else if (tag === 'font') {
    let color = str.match(/color="([^"\n]+)"/);
    if (!color) {
      color = str.match(/color=([^"\n]+)/);
    }
    if (color) {
      htmlTag.push({
        tag: tag,
        color: color[1].replaceAll('>', ''),
      });
    }
  } else {
    htmlTag.push({ tag: tag });
  }
};

/**
 * 处理图片节点
 * @param currentElement - 当前处理的图片元素，包含url和alt属性
 * @returns 返回格式化的图片节点对象
 */
const handleImage = (currentElement: any) => {
  return EditorUtils.createMediaNode(
    decodeURIComponent(currentElement?.url),
    'image',
    {
      alt: currentElement.alt,
    },
  );
};

/**
 * 处理内联数学公式
 * @param currentElement - 当前处理的内联数学公式元素
 * @returns 返回格式化的内联KaTeX节点对象
 */
const handleInlineMath = (currentElement: any) => {
  const inlineMathValue =
    typeof currentElement?.value === 'string' ? currentElement.value : '';
  if (shouldTreatInlineMathAsText(inlineMathValue)) {
    return {
      type: 'paragraph',
      children: [{ text: `$${inlineMathValue}$` }],
    } as any;
  }
  return {
    type: 'inline-katex',
    children: [{ text: inlineMathValue }],
  } as InlineKatexNode;
};

/**
 * 处理数学公式块
 * @param currentElement - 当前处理的数学公式块元素
 * @returns 返回格式化的KaTeX块节点对象
 */
const handleMath = (currentElement: any) => {
  return {
    type: 'katex',
    language: 'latex',
    katex: true,
    value: currentElement.value,
    children: [{ text: '' }],
  };
};

/**
 * 处理列表节点
 * @param currentElement - 当前处理的列表元素，包含ordered、start等属性
 * @returns 返回格式化的列表节点对象
 */
const handleList = (
  currentElement: any,
  plugins: MarkdownEditorPlugin[],
  parserConfig?: ParserMarkdownToSlateNodeConfig,
) => {
  const el: any = {
    type: 'list',
    order: currentElement.ordered,
    start: currentElement.start,
    children: parseNodes(
      currentElement.children,
      plugins,
      false,
      currentElement,
      parserConfig,
    ),
  };
  el.task = el.children?.some((s: any) => typeof s.checked === 'boolean');
  return el;
};

/**
 * 处理脚注引用
 * @param currentElement - 当前处理的脚注引用元素
 * @returns 返回格式化的脚注引用节点对象
 */
const handleFootnoteReference = (currentElement: any) => {
  return {
    text: `${currentElement.identifier?.toUpperCase()}`,
    identifier: currentElement.identifier,
    type: 'footnoteReference',
  };
};

/**
 * 处理脚注定义
 * @param currentElement - 当前处理的脚注定义元素
 * @returns 返回格式化的脚注定义节点对象
 */
const handleFootnoteDefinition = (
  currentElement: any,
  plugins: MarkdownEditorPlugin[],
  parserConfig?: ParserMarkdownToSlateNodeConfig,
) => {
  const linkNode = parseNodes(
    currentElement.children,
    plugins,
    false,
    currentElement,
    parserConfig,
  )?.at(0) as any;

  const cellNode = linkNode?.children?.at(0) as any;

  return {
    value: cellNode?.text,
    url: cellNode?.url,
    type: 'footnoteDefinition',
    identifier: currentElement.identifier,
    children: [cellNode],
  };
};

/**
 * 处理列表项节点
 * @param currentElement - 当前处理的列表项元素
 * @returns 返回格式化的列表项节点对象，包含复选框状态和提及信息
 */
const handleListItem = (
  currentElement: any,
  plugins: MarkdownEditorPlugin[],
  parserConfig?: ParserMarkdownToSlateNodeConfig,
) => {
  const children = currentElement.children?.length
    ? parseNodes(
        currentElement.children,
        plugins,
        false,
        currentElement,
        parserConfig,
      )
    : ([{ type: 'paragraph', children: [{ text: '' }] }] as any);

  let mentions = undefined;
  if (
    currentElement.children?.[0]?.children?.[0]?.type === 'link' &&
    currentElement.children?.[0]?.children?.length > 1
  ) {
    const item = children?.[0]?.children?.[0] as any;
    const label = item?.text;
    if (label) {
      mentions = [
        {
          avatar: item?.url,
          name: label,
          id:
            new URLSearchParams('?' + item?.url?.split('?')[1]).get('id') ||
            undefined,
        },
      ];
      delete children?.[0]?.children?.[0];
      if (children?.[0]?.children) {
        children[0].children = children?.[0]?.children?.filter(Boolean);
      }
    }
  }

  if (children[0].type === 'paragraph' && children[0].children[0]?.text) {
    const text = children[0].children[0]?.text;
    const m = text.match(/^\[([x\s])]/);

    if (m) {
      children[0].children[0].text = text.replace(/^\[([x\s])]/, '');
      return {
        type: 'list-item',
        checked: m ? m[1] === 'x' : undefined,
        children: children,
        mentions,
      };
    }
  }

  return {
    type: 'list-item',
    checked: currentElement.checked,
    children: children,
    mentions,
  };
};

/**
 * 处理附件链接
 */
const handleAttachmentLink = (currentElement: any) => {
  const text = currentElement.children
    .map((n: any) => (n as any).value || '')
    .join('');
  const attach = findAttachment(text);

  if (!attach) return null;

  const name = text.match(/>(.*)<\/a>/);
  return {
    type: 'attach',
    url: decodeURIComponentUrl(attach?.url),
    size: attach.size,
    children: [
      {
        type: 'card-before',
        children: [{ text: '' }],
      },
      {
        type: 'card-after',
        children: [{ text: '' }],
      },
    ],
    name: name ? name[1] : attach?.url,
  };
};

/**
 * 处理链接卡片
 */
const handleLinkCard = (currentElement: any, config: any) => {
  const link = currentElement?.children?.at(0) as {
    type: 'link';
    url: string;
    title: string;
  };

  return {
    ...config,
    type: 'link-card',
    url: decodeURIComponentUrl(link?.url),
    children: [
      {
        type: 'card-before',
        children: [{ text: '' }],
      },
      {
        type: 'card-after',
        children: [{ text: '' }],
      },
    ],
    name: link.title,
  };
};

/**
 * 处理段落中的子元素
 */
const processParagraphChildren = (
  currentElement: any,
  plugins: MarkdownEditorPlugin[],
  parserConfig?: ParserMarkdownToSlateNodeConfig,
) => {
  const elements = [];
  let textNodes: any[] = [];

  for (let currentChild of currentElement.children || []) {
    if (currentChild.type === 'image') {
      // 将累积的文本节点生成段落
      if (textNodes.length) {
        elements.push({
          type: 'paragraph',
          children: parseNodes(
            textNodes,
            plugins,
            false,
            currentElement,
            parserConfig,
          ),
        });
        textNodes = [];
      }
      // 添加图片节点
      elements.push(
        EditorUtils.createMediaNode(
          decodeURIComponentUrl(currentChild?.url),
          'image',
          {
            alt: currentChild.alt,
          },
        ),
      );
    } else if (currentChild.type === 'html') {
      // 跳过媒体标签的结束标签
      if (currentChild.value.match(/^<\/(img|video|iframe)>/)) {
        continue;
      }

      const mediaElement = findImageElement(currentChild.value);
      if (mediaElement) {
        const node = createMediaNodeFromElement(mediaElement);
        if (node) {
          elements.push(node);
        }
      } else {
        textNodes.push({ type: 'html', value: currentChild.value });
      }
    } else {
      textNodes.push(currentChild);
    }
  }

  // 处理剩余的文本节点
  if (textNodes.length) {
    elements.push({
      type: 'paragraph',
      children: parseNodes(
        textNodes,
        plugins,
        false,
        currentElement,
        undefined, // parserConfig not available in processParagraphChildren
      ),
    });
  }

  return elements;
};

/**
 * 处理段落节点
 * @param currentElement - 当前处理的段落元素
 * @param config - 配置对象，包含样式和行为设置
 * @param plugins - 插件数组
 * @returns 返回格式化的段落节点对象或元素数组
 */
const handleParagraph = (
  currentElement: any,
  config: any,
  plugins: MarkdownEditorPlugin[],
  parserConfig?: ParserMarkdownToSlateNodeConfig,
) => {
  // 检查是否是附件链接
  if (
    currentElement.children?.[0].type === 'html' &&
    currentElement.children[0].value.startsWith('<a')
  ) {
    const attachNode = handleAttachmentLink(currentElement);
    if (attachNode) return attachNode;
  }

  // 检查是否是链接卡片
  if (
    currentElement?.children?.at(0)?.type === 'link' &&
    config.type === 'card'
  ) {
    return handleLinkCard(currentElement, config);
  }

  // 处理混合内容段落
  return processParagraphChildren(currentElement, plugins, parserConfig);
};

/**
 * 处理内联代码节点
 * @param currentElement - 当前处理的内联代码元素
 * @returns 返回格式化的内联代码节点对象，支持占位符和初始值
 */
const handleInlineCode = (currentElement: any) => {
  const hasPlaceHolder = currentElement.value?.match(/\$\{(.*?)\}/);
  const values = hasPlaceHolder
    ? hasPlaceHolder[1]
        .split(';')
        .map((item: string) => {
          const values = item?.split(':');
          return {
            [values?.at(0) || '']: values?.at(1),
          };
        })
        .reduce((acc: any, item: any) => {
          return {
            ...acc,
            ...item,
          };
        }, {})
    : undefined;

  return {
    text: values ? values?.initialValue || ' ' : currentElement.value,
    tag: currentElement.value?.startsWith('${'),
    placeholder: values?.placeholder || undefined,
    initialValue: values?.initialValue || undefined,
    code: true,
  };
};

/**
 * 处理分割线节点
 * @returns 返回格式化的分割线节点对象
 */
const handleThematicBreak = () => {
  return { type: 'hr', children: [{ text: '' }] };
};

/**
 * 处理代码块节点
 * @param currentElement - 当前处理的代码块元素，包含语言和内容
 * @returns 返回格式化的代码块节点对象，根据语言类型进行特殊处理
 */
const handleCode = (currentElement: any) => {
  const rawValue = currentElement.value || '';
  const langString =
    (currentElement.lang || '').match(NOT_SPACE_START)?.[0] || '';
  const code = `${rawValue.replace(ENDING_NEWLINE, '')}\n`;

  // 检查代码块是否完整
  // 如果是缩进代码块，认为是完整的（因为没有结束标记）
  const isIndentedCode = currentElement.meta === 'indented';

  // 使用更智能的方法判断代码块是否完整
  let streamStatus: 'loading' | 'done' = 'loading';

  if (isIndentedCode) {
    // 缩进代码块没有结束标记，认为是完整的
    streamStatus = 'done';
  } else {
    // 对于围栏代码块，使用多种方法判断
    const endsWithNewline = code.match(ENDING_NEWLINE);

    // 如果代码以换行结尾，可能是完整的
    if (endsWithNewline) {
      // 进一步检查代码内容是否完整（特别是对于 Mermaid 等需要完整语法的情况）
      const isLikelyComplete = isCodeBlockLikelyComplete(
        rawValue,
        currentElement.lang,
      );
      streamStatus = isLikelyComplete ? 'done' : 'loading';
    } else {
      // 没有换行结尾，肯定不完整
      streamStatus = 'loading';
    }
  }

  // 如果已经在 parseNodes 中设置了 finish（基于是否是最后一个节点），优先使用它
  // 否则使用 streamStatus 判断
  const finishValue =
    currentElement.otherProps?.finish !== undefined
      ? currentElement.otherProps.finish
      : streamStatus === 'done';

  const baseCodeElement = {
    type: 'code',
    language:
      currentElement.lang === 'apaasify' ? 'apaasify' : currentElement.lang,
    render: currentElement.meta === 'render',
    value: currentElement.value,
    isConfig: currentElement?.value.trim()?.startsWith('<!--'),
    children: [{ text: currentElement.value }],
    // 添加流式状态支持
    otherProps: {
      ...(currentElement.otherProps || {}),
      'data-block': 'true',
      'data-state': streamStatus,
      // 优先使用 parseNodes 中设置的 finish，否则使用 streamStatus 判断
      finish: finishValue,
      ...(langString ? { 'data-language': langString } : {}),
    },
  };

  const handler =
    LANGUAGE_HANDLERS[currentElement.lang as keyof typeof LANGUAGE_HANDLERS];

  const result = handler
    ? handler(baseCodeElement, currentElement.value)
    : baseCodeElement;

  // 确保 otherProps 被保留
  const resultWithProps = result as CodeElement;
  if (baseCodeElement.otherProps && !resultWithProps.otherProps) {
    resultWithProps.otherProps = baseCodeElement.otherProps;
  } else if (baseCodeElement.otherProps && resultWithProps.otherProps) {
    resultWithProps.otherProps = {
      ...resultWithProps.otherProps,
      ...baseCodeElement.otherProps,
    };
  }

  return resultWithProps;
};

/**
 * 处理YAML节点
 * @param currentElement - 当前处理的YAML元素
 * @returns 返回格式化的YAML代码块节点对象
 */
const handleYaml = (currentElement: any) => {
  return {
    type: 'code',
    language: 'yaml',
    value: currentElement.value,
    frontmatter: true,
    children: [{ text: currentElement.value }],
  };
};

/**
 * 处理引用块节点
 * @param currentElement - 当前处理的引用块元素
 * @returns 返回格式化的引用块节点对象
 */
const handleBlockquote = (
  currentElement: any,
  plugins: MarkdownEditorPlugin[],
  parserConfig?: ParserMarkdownToSlateNodeConfig,
) => {
  return {
    type: 'blockquote',
    children: currentElement.children?.length
      ? parseNodes(
          currentElement.children,
          plugins,
          false,
          currentElement,
          parserConfig,
        )
      : [{ type: 'paragraph', children: [{ text: '' }] }],
  };
};

/**
 * 处理定义节点
 * @param currentElement - 当前处理的定义元素，包含标签和URL
 * @returns 返回格式化的定义段落节点对象
 */
const handleDefinition = (currentElement: any) => {
  return {
    type: 'paragraph',
    children: [
      {
        text:
          `[${currentElement.label}]: ` +
          (currentElement.url ? `${currentElement.url}` : ''),
      },
    ],
  };
};

/**
 * 应用HTML标签样式到元素
 * @param el - 目标元素对象
 * @param htmlTag - HTML标签数组，包含样式信息
 */
const applyHtmlTagsToElement = (el: any, htmlTag: any[]) => {
  for (let t of htmlTag) {
    if (t.tag === 'font') {
      el.color = t.color;
    }
    if (t.tag === 'sup') el.identifier = el.text;
    if (t.tag === 'sub') el.identifier = el.text;
    if (t.tag === 'code') el.code = true;
    if (t.tag === 'i') el.italic = true;
    if (t.tag === 'b' || t.tag === 'strong') el.bold = true;
    if (t.tag === 'del') el.strikethrough = true;
    if ((t.tag === 'span' || t.tag === 'font') && t.color)
      el.highColor = t.color;
    if (t.tag === 'a' && t?.url) {
      el.url = t?.url;
    }
  }
};

/**
 * 应用上下文属性和配置到元素
 * @param el - 目标元素或元素数组
 * @param contextProps - 上下文属性对象
 * @param config - 配置对象
 * @returns 返回应用了属性和配置的元素
 */
const applyContextPropsAndConfig = (
  el: any,
  contextProps: any,
  config: any,
) => {
  if (Array.isArray(el)) {
    return (el as Element[]).map((item) => {
      if (Object.keys(contextProps || {}).length) {
        item.contextProps = contextProps;
      }
      if (Object.keys(config || {}).length && !item.otherProps) {
        item.otherProps = config;
      }
      return item;
    }) as Element[];
  } else {
    if (Object.keys(contextProps || {}).length) {
      el.contextProps = contextProps;
    }
    if (Object.keys(config || {}).length && !el.otherProps) {
      el.otherProps = config;
    }
    return el;
  }
};

/**
 * 根据行间距添加空行元素
 * @param els - 目标元素数组
 * @param preNode - 前一个节点
 * @param currentElement - 当前处理的元素
 * @param top - 是否为顶级解析
 */
const addEmptyLinesIfNeeded = (
  els: any[],
  preNode: any,
  currentElement: any,
  top: boolean,
) => {
  if (preNode && top) {
    const distance =
      (currentElement.position?.start.line || 0) -
      (preNode.position?.end.line || 0);
    if (distance >= EMPTY_LINE_DISTANCE_THRESHOLD) {
      const lines = Math.floor(
        (distance - EMPTY_LINE_CALCULATION_OFFSET) / EMPTY_LINE_DIVISOR,
      );
      Array.from(new Array(lines)).forEach(() => {
        els.push({ type: 'paragraph', children: [{ text: '' }] });
      });
    }
  }
};

/**
 * 元素类型处理器映射表
 * 将元素类型映射到对应的处理函数
 * 注意：parserConfig 需要通过 handleSingleElement 传递，不在这里传递
 */
type ElementHandler = {
  handler: (
    element: any,
    plugins: MarkdownEditorPlugin[],
    config?: any,
    parent?: RootContent,
    htmlTag?: { tag: string; color?: string; url?: string }[],
    preElement?: Element | null,
  ) => Element | Element[] | null;
  needsHtmlResult?: boolean;
};

/**
 * 元素处理器映射表
 * 注意：这些处理器需要通过 handleSingleElement 传递 parserConfig
 */
const elementHandlers: Record<string, ElementHandler> = {
  heading: { handler: (el, plugins) => handleHeading(el, plugins) },
  html: { handler: () => null, needsHtmlResult: true },
  image: { handler: (el) => handleImage(el) },
  inlineMath: { handler: (el) => handleInlineMath(el) },
  math: { handler: (el) => handleMath(el) },
  list: { handler: (el, plugins) => handleList(el, plugins) },
  footnoteReference: { handler: (el) => handleFootnoteReference(el) },
  footnoteDefinition: {
    handler: (el, plugins) => handleFootnoteDefinition(el, plugins),
  },
  listItem: { handler: (el, plugins) => handleListItem(el, plugins) },
  paragraph: {
    handler: (el, plugins, config) => handleParagraph(el, config, plugins),
  },
  inlineCode: { handler: (el) => handleInlineCode(el) },
  thematicBreak: { handler: () => handleThematicBreak() },
  code: { handler: (el) => handleCode(el) },
  yaml: { handler: (el) => handleYaml(el) },
  blockquote: { handler: (el, plugins) => handleBlockquote(el, plugins) },
  table: {
    handler: (el, plugins, config, parent, htmlTag, preElement) =>
      parseTableOrChart(el, preElement, plugins),
  },
  definition: { handler: (el) => handleDefinition(el) },
};

/**
 * 解析 Markdown AST 节点为 Slate 节点（独立函数版本，用于向后兼容）
 * 内部使用 MarkdownToSlateParser 类来处理
 *
 * @deprecated 建议直接使用 MarkdownToSlateParser 类
 */
const parseNodes = (
  nodes: RootContent[],
  plugins: MarkdownEditorPlugin[],
  top = false,
  parent?: RootContent,
  parserConfig?: ParserMarkdownToSlateNodeConfig,
): (Elements | Text)[] => {
  // 创建一个临时 parser 实例来处理
  // 注意：这不是最优的方式，但为了向后兼容保留
  // 使用类型断言访问私有方法
  const parser = new MarkdownToSlateParser(parserConfig || {}, plugins || []);
  return (parser as any).parseNodes(nodes, top, parent);
};

const tableRegex = /^\|.*\|\s*\n\|[-:| ]+\|/m;

/**
 * 标准 HTML 元素列表
 * 这些标签会被正常解析为 HTML，其他标签会被当作普通文本处理
 */
const STANDARD_HTML_ELEMENTS = new Set([
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
  // 自定义标签（用于流式渲染）
  'incomplete-image',
]);

/**
 * 检查 HTML 标签是否为标准元素
 * @param htmlString - HTML 字符串
 * @returns 是否为标准 HTML 元素
 */
function isStandardHtmlElement(htmlString: string): boolean {
  // 提取标签名（支持开始标签和结束标签）
  const tagMatch = htmlString.match(/<\/?(\w+)/);
  if (!tagMatch) return false;

  const tagName = tagMatch[1].toLowerCase();
  return STANDARD_HTML_ELEMENTS.has(tagName);
}

/**
 * 预处理特殊标签（think/answer），将其转换为代码块格式
 * @param markdown - 原始 Markdown 字符串
 * @param tagName - 标签名称（think 或 answer）
 * @returns 处理后的 Markdown 字符串
 */
function preprocessSpecialTags(
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
function preprocessThinkTags(markdown: string): string {
  return preprocessSpecialTags(markdown, 'think');
}

/**
 * 检测不完整的图片标记
 * 参考 useStreaming 中的逻辑，检测类似 ![ 或 ![text]( 的不完整图片语法
 * @param markdown - 要检测的 Markdown 字符串
 * @returns 是否为不完整的图片标记
 */
function isIncompleteImage(markdown: string): boolean {
  // 匹配不完整的图片语法：
  // 1. ![ 开始但还没有 ]
  // 2. ![text] 开始但还没有 (
  // 3. ![text]( 开始但还没有 )
  const incompleteImagePatterns = [
    /^!\[[^\]\r\n]{0,1000}$/, // ![ 或 ![text 但没有 ]
    /^!\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/, // ![text]( 或 ![text](url 但没有 )
  ];
  return incompleteImagePatterns.some((pattern) => pattern.test(markdown));
}

/**
 * 预处理不完整的图片标记，将其转换为特殊的 HTML 标签
 * @param markdown - 原始 Markdown 字符串
 * @returns 处理后的 Markdown 字符串
 */
function preprocessIncompleteImages(markdown: string): string {
  if (!markdown) return markdown;

  // 按行处理，避免在代码块中处理
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  let codeBlockFence = '';
  let codeBlockFenceLen = 0;

  const processedLines = lines.map((line) => {
    // 检测代码块开始/结束
    const fenceMatch = line.match(FENCED_CODE_REGEX);
    if (fenceMatch) {
      const currentFence = fenceMatch[1];
      const char = currentFence[0];
      const len = currentFence.length;

      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockFence = char;
        codeBlockFenceLen = len;
      } else if (char === codeBlockFence && len >= codeBlockFenceLen) {
        inCodeBlock = false;
        codeBlockFence = '';
        codeBlockFenceLen = 0;
      }
      return line;
    }

    // 如果在代码块中，不处理
    if (inCodeBlock) {
      return line;
    }

    // 检测不完整的图片标记
    // 匹配行尾的不完整图片语法（避免匹配完整的图片）
    const trimmedLine = line.trim();

    // 如果整行就是一个不完整的图片标记
    if (isIncompleteImage(trimmedLine)) {
      const encodedRaw = encodeURIComponent(trimmedLine);
      return `<incomplete-image data-raw="${encodedRaw}" />`;
    }

    // 检测行内不完整的图片标记（在行尾）
    // 使用负向前瞻确保不是完整图片的一部分
    return line.replace(/(!\[[^\]]*\]?\(?[^)]*)$/, (match) => {
      // 检查是否是不完整的图片
      if (isIncompleteImage(match.trim())) {
        const encodedRaw = encodeURIComponent(match.trim());
        return `<incomplete-image data-raw="${encodedRaw}" />`;
      }
      return match;
    });
  });

  return processedLines.join('\n');
}

/**
 * 预处理所有非标准 HTML 标签，提取其内容（删除标签本身）
 * @param markdown - 原始 Markdown 字符串
 * @returns 处理后的 Markdown 字符串
 */
function preprocessNonStandardHtmlTags(markdown: string): string {
  let result = markdown;
  let hasNonStandardTags = true;

  // 循环处理，直到没有非标准标签（处理嵌套情况）
  while (hasNonStandardTags) {
    const before = result;

    // 匹配所有 HTML 标签对：<tagname>content</tagname>
    // 注意：跳过 incomplete-image 标签（它是自闭合标签，需要特殊处理）
    result = result.replace(
      /<(\w+)>([\s\S]*?)<\/\1>/g,
      (match, tagName, content) => {
        // 保护 incomplete-image 标签（虽然它是自闭合的，但为了安全起见）
        if (tagName.toLowerCase() === 'incomplete-image') {
          return match;
        }
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

function preprocessMarkdownTableNewlines(markdown: string) {
  // 检查是否包含表格
  if (!tableRegex.test(markdown)) return markdown; // 如果没有表格，直接返回原始字符串

  // 处理表格结尾的换行符：
  // 1. 如果只有一个换行符，改成两个
  // 2. 如果有两个以上换行符，改成两个
  // 3. 如果已经是两个换行符，保持不变
  let processedMarkdown = markdown
    .replace(
      /(\|[^|\n]*\|)\n(?!\n|\|)/g, // 匹配表格行后面跟着单个换行符（不是两个），但下一行不是表格行
      '$1\n\n', // 替换为两个换行符
    )
    .replace(
      /(\|[^|\n]*\|)\n{3,}(?!\|)/g, // 匹配表格行后面跟着3个或更多换行符，但下一行不是表格行
      '$1\n\n', // 替换为两个换行符
    );

  // 如果包含表格，处理换行符
  return processedMarkdown
    ?.split('\n\n')
    .map((line) => {
      if (line.includes('```')) return line; // 如果包含代码块，直接返回原始字符串
      // 检查是否包含表格
      if (!tableRegex.test(line)) return line; // 如果没有表格，直接返回原始字符串
      // 匹配所有表格的行（确保我们在表格行内匹配换行符）
      return line.replace(/\|([^|]+)\|/g, (match) => {
        if (match.replaceAll('\n', '')?.length < MIN_TABLE_CELL_LENGTH)
          return match;
        // 只替换每个表格单元格内的换行符
        return match.split('\n').join('<br>');
      });
    })
    .join('\n\n');
}

/**
 * 解析Markdown字符串的配置选项
 */
export interface ParserMarkdownToSlateNodeConfig {
  /** 是否在新标签页打开链接 */
  openLinksInNewTab?: boolean;
  /** 自定义段落标签（在 Slate 中可能不适用，保留用于兼容性） */
  paragraphTag?: string;
  /** 是否正在输入中（打字机模式） */
  typing?: boolean;
}

/**
 * Markdown 到 Slate 节点解析器类
 *
 * 将 Markdown 字符串解析为 Slate 编辑器节点，支持配置选项和插件。
 * 使用类形式可以避免在函数调用链中传递配置参数和插件。
 */
export class MarkdownToSlateParser {
  private readonly config: ParserMarkdownToSlateNodeConfig;
  private readonly plugins: MarkdownEditorPlugin[];

  constructor(
    config: ParserMarkdownToSlateNodeConfig = {},
    plugins: MarkdownEditorPlugin[] = [],
  ) {
    this.config = config;
    this.plugins = plugins;
  }

  /**
   * 解析 Markdown 字符串并返回解析后的结构和链接信息
   *
   * @param md - 要解析的 Markdown 字符串
   * @returns 一个包含解析后的元素数组和链接信息的对象
   */
  parse(md: string): {
    schema: Elements[];
    links: { path: number[]; target: string }[];
  } {
    // 先预处理 <think> 标签，再预处理不完整的图片，然后预处理其他非标准 HTML 标签，最后处理表格换行
    const thinkProcessed = preprocessThinkTags(md || '');
    const incompleteImageProcessed = preprocessIncompleteImages(thinkProcessed);
    const nonStandardProcessed = preprocessNonStandardHtmlTags(
      incompleteImageProcessed,
    );
    const processedMarkdown = mdastParser.parse(
      preprocessMarkdownTableNewlines(nonStandardProcessed),
    ) as any;

    const markdownRoot = processedMarkdown.children;

    // 使用类的配置和插件，通过 this 访问
    const schema = this.parseNodes(markdownRoot, true, undefined) as Elements[];
    return {
      schema: schema?.filter((item) => {
        if (item.type === 'paragraph' && item.children?.length === 1) {
          if (item.children[0].text === '\n') {
            return false;
          }
          return true;
        }
        return true;
      }),
      links: [],
    };
  }

  /**
   * 解析 Markdown AST 节点为 Slate 节点（类方法版本）
   * - 当有插件时，优先使用插件处理
   * - 插件未处理时，使用默认处理逻辑
   */
  private parseNodes(
    nodes: RootContent[],
    top = false,
    parent?: RootContent,
  ): (Elements | Text)[] {
    if (!nodes?.length)
      return [{ type: 'paragraph', children: [{ text: '' }] }];

    let els: (Elements | Text)[] = [];
    let preNode: null | RootContent = null;
    let preElement: Element = null;
    let htmlTag: { tag: string; color?: string; url?: string }[] = [];
    let contextProps = {};

    for (let i = 0; i < nodes.length; i++) {
      const currentElement = nodes[i] as any;
      let el: Element | null | Element[] = null;
      let pluginHandled = false;

      const config =
        preElement?.type === 'code' &&
        preElement?.language === 'html' &&
        preElement?.otherProps
          ? preElement?.otherProps
          : {};

      // 首先尝试使用插件处理，使用 this.plugins
      for (const plugin of this.plugins) {
        const rule = plugin.parseMarkdown?.find((r) => r.match(currentElement));
        if (rule) {
          const converted = rule.convert(currentElement);
          // 检查转换结果是否为 NodeEntry<Text> 格式
          if (Array.isArray(converted) && converted.length === 2) {
            // NodeEntry<Text> 格式: [node, path]
            el = converted[0] as Element;
          } else {
            // Elements 格式
            el = converted as Element;
          }
          pluginHandled = true;
          break;
        }
      }

      // 如果插件没有处理，使用默认处理逻辑
      if (!pluginHandled) {
        const isLastNode = i === nodes.length - 1;

        // 如果是 table 节点，检查是否是最后一个节点，设置 finish 属性
        if (currentElement.type === 'table') {
          // 如果 table 不是最后一个节点，finish 设置为 true
          if (!isLastNode) {
            if (!(currentElement as any).otherProps) {
              (currentElement as any).otherProps = {};
            }
            (currentElement as any).otherProps.finish = true;
          } else {
            // 如果是最后一个节点，且 typing=false，finish 设置为 true
            if (this.config.typing === false) {
              if (!(currentElement as any).otherProps) {
                (currentElement as any).otherProps = {};
              }
              (currentElement as any).otherProps.finish = true;
            }
            // 否则保持原逻辑（在 parseTableOrChart 中处理，默认为 false）
          }
        }

        // 如果是 code 节点，检查是否是最后一个节点，设置 finish 属性
        if (currentElement.type === 'code') {
          // 如果 code 不是最后一个节点，finish 设置为 true
          if (!isLastNode) {
            if (!(currentElement as any).otherProps) {
              (currentElement as any).otherProps = {};
            }
            (currentElement as any).otherProps.finish = true;
          }
          // 如果是最后一个节点，保持原逻辑（在 handleCode 中处理）
        }

        // 使用统一的处理函数，通过 this 访问配置和插件
        const result = this.handleSingleElement(
          currentElement,
          config,
          parent,
          htmlTag,
          preElement,
        );

        el = result.el;
        if (result.contextProps) {
          contextProps = { ...contextProps, ...result.contextProps };
        }
      }

      addEmptyLinesIfNeeded(els, preNode, currentElement, top);

      if (el) {
        el = applyContextPropsAndConfig(el, contextProps, config);
        Array.isArray(el) ? els.push(...el) : els.push(el);
      }

      preNode = currentElement;
      preElement = el as Element;
    }

    return els;
  }

  /**
   * 处理单个元素（类方法版本）
   */
  private handleSingleElement(
    currentElement: RootContent,
    config: any,
    parent: RootContent | undefined,
    htmlTag: { tag: string; color?: string; url?: string }[],
    preElement: Element | null,
  ): { el: Element | Element[] | null; contextProps?: any } {
    const elementType = currentElement.type;
    const handlerInfo = elementHandlers[elementType];

    // 特殊处理 html 类型
    if (handlerInfo?.needsHtmlResult) {
      const htmlResult = handleHtml(currentElement, parent, htmlTag);
      return {
        el: htmlResult.el,
        contextProps: htmlResult.contextProps,
      };
    }

    // 使用处理器映射表
    // 对于需要 parserConfig 的处理器，直接调用而不是通过 handler
    if (handlerInfo) {
      let handlerResult: Element | Element[] | null;

      // 特殊处理需要 parserConfig 的处理器，使用 this.config 和 this.plugins
      if (elementType === 'heading') {
        handlerResult = this.handleHeading(currentElement);
      } else if (elementType === 'list') {
        handlerResult = this.handleList(currentElement);
      } else if (elementType === 'listItem') {
        handlerResult = this.handleListItem(currentElement);
      } else if (elementType === 'blockquote') {
        handlerResult = this.handleBlockquote(currentElement);
      } else if (elementType === 'footnoteDefinition') {
        handlerResult = this.handleFootnoteDefinition(currentElement);
      } else if (elementType === 'paragraph') {
        handlerResult = this.handleParagraph(currentElement, config);
      } else if (elementType === 'table') {
        handlerResult = this.parseTableOrChart(
          currentElement,
          preElement || (parent as any),
        );
      } else {
        // 使用默认的 handler 调用
        handlerResult = handlerInfo.handler(
          currentElement,
          this.plugins,
          config,
          parent,
          htmlTag,
          preElement,
        );
      }

      return {
        el: handlerResult,
      };
    }

    // 默认处理
    return {
      el: this.handleTextAndInlineElements(currentElement, htmlTag),
    };
  }

  /**
   * 处理标题节点（类方法版本）
   */
  private handleHeading(currentElement: any) {
    return {
      type: 'head',
      level: currentElement.depth,
      children: currentElement.children?.length
        ? this.parseNodes(currentElement.children, false, currentElement)
        : [{ text: '' }],
    };
  }

  /**
   * 处理列表节点（类方法版本）
   */
  private handleList(currentElement: any) {
    const el: any = {
      type: 'list',
      order: currentElement.ordered,
      start: currentElement.start,
      children: this.parseNodes(currentElement.children, false, currentElement),
    };
    el.task = el.children?.some((s: any) => typeof s.checked === 'boolean');
    return el;
  }

  /**
   * 处理脚注定义节点（类方法版本）
   */
  private handleFootnoteDefinition(currentElement: any) {
    const linkNode = this.parseNodes(
      currentElement.children,
      false,
      currentElement,
    )?.at(0) as any;

    const cellNode = linkNode?.children?.at(0) as any;

    return {
      value: cellNode?.text,
      url: cellNode?.url,
      type: 'footnoteDefinition',
      identifier: currentElement.identifier,
      children: [cellNode],
    };
  }

  /**
   * 处理列表项节点（类方法版本）
   */
  private handleListItem(currentElement: any) {
    const children = currentElement.children?.length
      ? this.parseNodes(currentElement.children, false, currentElement)
      : ([{ type: 'paragraph', children: [{ text: '' }] }] as any);

    let mentions = undefined;
    if (
      currentElement.children?.[0]?.children?.[0]?.type === 'link' &&
      currentElement.children?.[0]?.children?.length > 1
    ) {
      const item = children?.[0]?.children?.[0] as any;
      const label = item?.text;
      if (label) {
        mentions = [
          {
            avatar: item?.url,
            name: label,
            id:
              new URLSearchParams('?' + item?.url?.split('?')[1]).get('id') ||
              undefined,
          },
        ];
        delete children?.[0]?.children?.[0];
      }
    }

    return {
      type: 'list-item',
      checked: currentElement.checked,
      children,
      mentions,
    };
  }

  /**
   * 处理段落子节点（类方法版本）
   */
  private processParagraphChildren(currentElement: any) {
    const elements = [];
    let textNodes: any[] = [];

    for (let currentChild of currentElement.children || []) {
      if (currentChild.type === 'image') {
        // 将累积的文本节点生成段落
        if (textNodes.length) {
          elements.push({
            type: 'paragraph',
            children: this.parseNodes(textNodes, false, currentElement),
          });
          textNodes = [];
        }
        // 添加图片节点
        elements.push(
          EditorUtils.createMediaNode(
            decodeURIComponentUrl(currentChild?.url),
            'image',
            {
              alt: currentChild.alt,
            },
          ),
        );
      } else if (currentChild.type === 'html') {
        // 跳过媒体标签的结束标签
        if (currentChild.value.match(/^<\/(img|video|iframe)>/)) {
          continue;
        }

        const mediaElement = findImageElement(currentChild.value);
        if (mediaElement) {
          const node = createMediaNodeFromElement(mediaElement);
          if (node) {
            elements.push(node);
          }
        } else {
          textNodes.push({ type: 'html', value: currentChild.value });
        }
      } else {
        textNodes.push(currentChild);
      }
    }

    // 处理剩余的文本节点
    if (textNodes.length) {
      elements.push({
        type: 'paragraph',
        children: this.parseNodes(textNodes, false, currentElement),
      });
    }

    return elements;
  }

  /**
   * 处理段落节点（类方法版本）
   */
  private handleParagraph(currentElement: any, config: any) {
    // 检查是否是附件链接
    if (
      currentElement.children?.[0].type === 'html' &&
      currentElement.children[0].value.startsWith('<a')
    ) {
      const attachNode = handleAttachmentLink(currentElement);
      if (attachNode) return attachNode;
    }

    // 检查是否是链接卡片
    if (
      currentElement?.children?.at(0)?.type === 'link' &&
      config.type === 'card'
    ) {
      return handleLinkCard(currentElement, config);
    }

    // 处理混合内容段落
    return this.processParagraphChildren(currentElement);
  }

  /**
   * 处理引用块节点（类方法版本）
   */
  private handleBlockquote(currentElement: any) {
    return {
      type: 'blockquote',
      children: currentElement.children?.length
        ? this.parseNodes(currentElement.children, false, currentElement)
        : [{ type: 'paragraph', children: [{ text: '' }] }],
    };
  }

  /**
   * 处理文本和内联元素节点（类方法版本）
   */
  private handleTextAndInlineElements(currentElement: any, htmlTag: any[]) {
    if (currentElement.type === 'text' && htmlTag.length) {
      const el = { text: currentElement.value };
      if (currentElement.value) {
        applyHtmlTagsToElement(el, htmlTag);
      }
      return el;
    }

    if (
      ['strong', 'link', 'text', 'emphasis', 'delete', 'inlineCode'].includes(
        currentElement.type,
      )
    ) {
      if (currentElement.type === 'text') {
        return { text: currentElement.value };
      }

      const leaf: CustomLeaf = {};
      this.applyInlineFormatting(leaf, currentElement);
      applyHtmlTagsToElement(leaf, htmlTag);

      if (
        (currentElement as any)?.children?.some((n: any) => n.type === 'html')
      ) {
        return {
          ...this.parseNodes(
            (currentElement as any)?.children,
            false,
            currentElement,
          )?.at(0),
          url: leaf.url,
        };
      } else {
        return parseText(
          currentElement.children?.length
            ? currentElement.children
            : [{ value: leaf?.url || '' }],
          leaf,
        );
      }
    }
    if (currentElement.type === 'break') {
      return { text: '\n' };
    }

    return { text: '' };
  }

  /**
   * 应用内联格式到叶子节点（类方法版本）
   */
  private applyInlineFormatting(leaf: CustomLeaf, currentElement: any) {
    if (currentElement.type === 'strong') leaf.bold = true;
    if (currentElement.type === 'emphasis') leaf.italic = true;
    if (currentElement.type === 'delete') leaf.strikethrough = true;
    if (currentElement.type === 'link') {
      try {
        leaf.url = currentElement?.url;
        // 如果配置了在新标签页打开链接，添加 target 和 rel 属性
        if (this.config?.openLinksInNewTab) {
          // 使用 otherProps 存储额外的链接属性
          if (!leaf.otherProps) {
            leaf.otherProps = {};
          }
          (leaf.otherProps as any).target = '_blank';
          (leaf.otherProps as any).rel = 'noopener noreferrer';
        }
      } catch (error) {
        leaf.url = currentElement?.url;
      }
    }
  }

  /**
   * 解析表格或图表（类方法版本）
   */
  private parseTableOrChart(table: Table, preNode: RootContent): CardNode {
    const keyMap = new Map<string, string>();

    // @ts-ignore
    const config =
      // @ts-ignore
      preNode?.type === 'code' && // @ts-ignore
      preNode?.language === 'html' && // @ts-ignore
      preNode?.otherProps
        ? // @ts-ignore
          preNode?.otherProps
        : {};

    const tableHeader = table?.children?.at(0);
    const columns =
      tableHeader?.children
        ?.map((node) => {
          return myRemark
            .stringify({
              type: 'root',
              children: [node],
            })
            .trim();
        })
        .map((key) => {
          // 规范化字段名，统一处理转义字符
          const normalizedKey = normalizeFieldName(key);
          const value = keyMap.get(normalizedKey) || normalizedKey;
          return value;
        })
        .map((key) => ({ dataIndex: key })) || [];

    const dataSource =
      table?.children?.slice(1)?.map((row) => {
        return row.children?.reduce((acc: any, cell: any, index: number) => {
          const column = columns[index];
          const key =
            column?.dataIndex ||
            (typeof column === 'string' ? column : undefined);
          if (key) {
            acc[key] = myRemark
              .stringify({
                type: 'root',
                children: [cell],
              })
              .trim();
          }
          return acc;
        }, {});
      }) || [];

    if (table.align?.every((item) => !item)) {
      const aligns = getColumnAlignment(dataSource, columns);
      table.align = aligns;
    }

    const aligns = table.align;

    const isChart = config?.chartType || config?.at?.(0)?.chartType;

    // 计算合并单元格信息
    const mergeCells = config.mergeCells || [];

    // 创建合并单元格映射，用于快速查找
    const mergeMap = new Map<
      string,
      { rowSpan: number; colSpan: number; hidden?: boolean }
    >();
    mergeCells?.forEach(
      ({ row, col, rowSpan, rowspan, colSpan, colspan }: any) => {
        let rawRowSpan = rowSpan || rowspan;
        let rawColSpan = colSpan || colspan;
        // 主单元格
        mergeMap.set(`${row}-${col}`, {
          rowSpan: rawRowSpan,
          colSpan: rawColSpan,
        });

        // 被合并的单元格标记为隐藏
        for (let r = row; r < row + rawRowSpan; r++) {
          for (let c = col; c < col + rawColSpan; c++) {
            if (r !== row || c !== col) {
              mergeMap.set(`${r}-${c}`, {
                rowSpan: 1,
                colSpan: 1,
                hidden: true,
              });
            }
          }
        }
      },
    );

    const children = table.children.map((r: { children: any[] }, l: number) => {
      return {
        type: 'table-row',
        align: aligns?.[l] || undefined,
        children: r.children.map(
          (c: { children: string | any[] }, i: string | number) => {
            const mergeInfo = mergeMap.get(`${l}-${i}`);
            return {
              type: 'table-cell',
              align: aligns?.[i as number] || undefined,
              title: l === 0,
              rows: l,
              cols: i,
              ...(mergeInfo?.rowSpan && mergeInfo.rowSpan > 1
                ? { rowSpan: mergeInfo.rowSpan }
                : {}),
              ...(mergeInfo?.colSpan && mergeInfo.colSpan > 1
                ? { colSpan: mergeInfo.colSpan }
                : {}),
              ...(mergeInfo?.hidden ? { hidden: true } : {}),
              children: c.children?.length
                ? [
                    {
                      type: 'paragraph',
                      children: this.parseNodes(
                        c.children as any,
                        false,
                        c as any,
                      ),
                    },
                  ]
                : [
                    {
                      type: 'paragraph',
                      children: [{ text: '' }],
                    },
                  ],
            };
          },
        ),
      };
    }) as TableRowNode[];

    // 检查表格是否完成（未闭合）
    // 如果 table 节点有 otherProps.finish，使用它；否则默认为 false（未完成）
    const isFinished =
      (table as any)?.otherProps?.finish !== undefined
        ? (table as any).otherProps.finish
        : false;

    const otherProps = {
      ...(isChart
        ? {
            config,
          }
        : config),
      columns: columns.map((col) => col.dataIndex),
      dataSource: dataSource.map((item) => {
        delete item?.chartType;
        return {
          ...item,
        };
      }),
      finish: isFinished, // 标记表格是否完成（未闭合时为 false）
    };

    const node: TableNode | ChartNode = {
      type: isChart ? 'chart' : 'table',
      children: children,
      otherProps,
    } as any;
    return EditorUtils.wrapperCardNode(node);
  }
}

/**
 * 解析Markdown字符串并返回解析后的结构和链接信息。
 *
 * @param md - 要解析的Markdown字符串。
 * @param plugins - 可选的Markdown编辑器插件数组，用于扩展解析功能。
 * @param config - 可选的解析配置选项。
 * @returns 一个包含解析后的元素数组和链接信息的对象。
 *
 * @property schema - 解析后的元素数组。
 * @property links - 包含路径和目标链接的对象数组。
 *
 * @example
 * ```typescript
 * // 使用函数形式（向后兼容）
 * const result = parserMarkdownToSlateNode(markdown, plugins, { openLinksInNewTab: true });
 *
 * // 使用类形式（推荐，避免配置传递问题）
 * const parser = new MarkdownToSlateParser(
 *   { openLinksInNewTab: true },
 *   plugins
 * );
 * const result = parser.parse(markdown);
 * ```
 */
export const parserMarkdownToSlateNode = (
  md: string,
  plugins?: MarkdownEditorPlugin[],
  config?: ParserMarkdownToSlateNodeConfig,
): {
  schema: Elements[];
  links: { path: number[]; target: string }[];
} => {
  const parser = new MarkdownToSlateParser(config || {}, plugins || []);
  return parser.parse(md);
};
