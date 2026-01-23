import type { RootContent } from 'mdast';
import { Element } from 'slate';

import { ChartTypeConfig, Elements } from '../../el';
import { MarkdownEditorPlugin } from '../../plugin';
import { applyContextPropsAndConfig } from './parse/applyContextPropsAndConfig';
import {
  handleBlockquote,
  handleFootnoteDefinition,
  handleHeading,
  handleList,
  handleListItem,
  handleParagraph,
  handleTextAndInlineElements,
} from './parse/parseBlockElements';
import { handleCode, handleYaml } from './parse/parseCode';
import {
  handleDefinition,
  handleInlineCode,
  handleThematicBreak,
} from './parse/parseElements';
import { addEmptyLinesIfNeeded } from './parse/parseEmptyLines';
import { handleFootnoteReference } from './parse/parseFootnote';
import {
  handleHtml,
  preprocessNonStandardHtmlTags,
  preprocessThinkTags,
} from './parse/parseHtml';
import { handleInlineMath, handleMath } from './parse/parseMath';
import { handleImage } from './parse/parseMedia';
import {
  parseTableOrChart,
  preprocessMarkdownTableNewlines,
} from './parse/parseTable';
import mdastParser from './remarkParse';

// 全局解析缓存
const parseCache = new Map<string, Elements[]>();

/**
 * 清空解析缓存
 */
export const clearParseCache = (): void => {
  parseCache.clear();
};

/**
 * Markdown 块信息
 */
interface MarkdownBlock {
  content: string;
  hash: string;
}

type HtmlTagInfo = { tag: string; color?: string; url?: string };

type ParseContext = {
  preNode: RootContent | null;
  preElement: Element | null;
  htmlTag: HtmlTagInfo[];
  contextProps: Record<string, unknown>;
};

interface HandleSingleElementParams {
  currentElement: RootContent;
  config: Record<string, unknown>;
  parent?: RootContent;
  htmlTag: HtmlTagInfo[];
  preElement: Element | null;
}

interface ElementHandlerContext {
  config: Record<string, unknown>;
  parent?: RootContent;
  htmlTag: HtmlTagInfo[];
  preElement: Element | null;
}

/**
 * 生成简单的字符串哈希
 */
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

/**
 * 将 Markdown 文本按块分割
 * 正确处理代码块、HTML 标签、脚注等内容
 * 返回带有内容和哈希的块数组
 */
const splitMarkdownIntoBlocks = (
  md: string,
  config?: ParserMarkdownToSlateNodeConfig,
  plugins?: MarkdownEditorPlugin[],
): MarkdownBlock[] => {
  const blocks: string[] = [];
  let currentBlock = '';
  let inCodeBlock = false;
  let htmlTagDepth = 0;

  const lines = md.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测代码块开始/结束
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    // 检测 HTML 标签深度（非代码块时）
    if (!inCodeBlock) {
      const openTags = (line.match(/<[a-zA-Z][^/>]*>/g) || []).length;
      const closeTags = (line.match(/<\/[a-zA-Z][^>]*>/g) || []).length;
      const selfClosing = (line.match(/<[^>]*\/>/g) || []).length;
      htmlTagDepth += openTags - closeTags - selfClosing;
      htmlTagDepth = Math.max(0, htmlTagDepth);
    }

    // 检查当前块是否以 HTML 结尾（注释或标签）
    const blockEndsWithHtml = /<!--[\s\S]*?-->$|<[^>]+>$/.test(
      currentBlock.trim(),
    );

    // 检查当前块是否包含脚注引用（需要和脚注定义一起解析）
    const hasFootnoteRef = /\[\^[^\]]+\]/.test(currentBlock);
    // 检查下一行是否是脚注定义
    const nextLineIsFootnoteDef =
      i + 1 < lines.length && /^\[\^[^\]]+\]:/.test(lines[i + 1].trim());

    // 只有在非代码块、非 HTML 块、且当前块不以 HTML 结尾、且不涉及脚注时，连续空行才作为分割点
    const isBlockBoundary =
      line === '' &&
      !inCodeBlock &&
      htmlTagDepth === 0 &&
      !blockEndsWithHtml &&
      !hasFootnoteRef &&
      !nextLineIsFootnoteDef &&
      currentBlock.endsWith('\n');

    if (isBlockBoundary) {
      if (currentBlock.trim()) {
        blocks.push(currentBlock.trim());
      }
      currentBlock = '';
      continue;
    }

    currentBlock += line + '\n';
  }

  if (currentBlock.trim()) {
    blocks.push(currentBlock.trim());
  }

  // 合并小于 100 个字符的块到下一个块，同时处理包含 --- 的块
  const MIN_BLOCK_SIZE = 100;
  const mergedBlocks: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // 检查当前块是否包含 --- (frontmatter 分隔符或 thematic break)
    // 如果包含 ---，且有上一个块，则合并到上一个块
    const containsHr = /^---\s*$/m.test(block);
    if (containsHr && mergedBlocks.length > 0) {
      mergedBlocks[mergedBlocks.length - 1] += '\n\n' + block;
      continue;
    }

    // 如果当前块小于 100 个字符，且有下一个块，则合并到下一个块
    if (block.length < MIN_BLOCK_SIZE && i + 1 < blocks.length) {
      blocks[i + 1] = block + '\n\n' + blocks[i + 1];
      continue;
    }

    mergedBlocks.push(block);
  }

  // 生成带哈希的块数组
  const configStr = config ? JSON.stringify(config) : '';
  const pluginsCount = plugins?.length || 0;
  const configHash = simpleHash(`${configStr}_${pluginsCount}`);

  return mergedBlocks.map((content, index) => ({
    content,
    hash: `${simpleHash(content)}_${configHash}_${index}`,
  }));
};
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

  config?: ChartTypeConfig[];
}

/**
 * 元素类型处理器映射表
 * 将元素类型映射到对应的处理函数
 * 注意：parserConfig 需要通过 handleSingleElement 传递，不在这里传递
 */
type ElementHandler = {
  handler: (element: any, context: ElementHandlerContext) => Element | Element[] | null;
  needsHtmlResult?: boolean;
};

// 删除 <answer> 和 </answer> 标签，保留中间内容
const removeAnswerTags = (text: string): string => {
  return text.replace(/<answer>\s*/g, '').replace(/\s*<\/answer>/g, '');
};

/**
 * Markdown 到 Slate 节点解析器类
 *
 * 将 Markdown 字符串解析为 Slate 编辑器节点，支持配置选项和插件。
 * 使用类形式可以避免在函数调用链中传递配置参数和插件。
 */
export class MarkdownToSlateParser {
  private config: ParserMarkdownToSlateNodeConfig;
  private readonly plugins: MarkdownEditorPlugin[];

  constructor(
    config: ParserMarkdownToSlateNodeConfig = {},
    plugins: MarkdownEditorPlugin[] = [],
  ) {
    this.config = config;
    this.plugins = plugins;
  }

  private preprocessMarkdown(md: string): string {
    const thinkProcessed = removeAnswerTags(preprocessThinkTags(md || ''));
    const nonStandardProcessed = removeAnswerTags(
      preprocessNonStandardHtmlTags(thinkProcessed),
    );
    return preprocessMarkdownTableNewlines(nonStandardProcessed);
  }

  private buildMarkdownRoot(md: string): RootContent[] {
    const preprocessedMarkdown = this.preprocessMarkdown(md);
    const ast = mdastParser.parse(preprocessedMarkdown) as any;
    const processedMarkdown = mdastParser.runSync(ast) as any;
    return processedMarkdown.children as RootContent[];
  }

  private filterTopLevelSchema(schema: Elements[]): Elements[] {
    return schema?.filter((item) => {
      if (item.type === 'paragraph' && !item.children?.length) {
        return false;
      }
      if (item.type === 'paragraph' && item.children?.length === 1) {
        if (
          item.children[0].text === '\n' ||
          item.children[0].text === undefined
        ) {
          return false;
        }
        return true;
      }
      return true;
    });
  }

  private createEmptyParagraph(): Elements {
    return { type: 'paragraph', children: [{ text: '' }] };
  }

  private createParseContext(): ParseContext {
    return { preNode: null, preElement: null, htmlTag: [], contextProps: {} };
  }

  private parseHtmlCommentProps(
    currentElement: RootContent,
  ): Record<string, unknown> | null {
    const htmlValue = (currentElement as any)?.value;
    const isHtmlComment =
      currentElement.type === 'html' &&
      typeof htmlValue === 'string' &&
      htmlValue.trim().startsWith('<!--') &&
      htmlValue.trim().endsWith('-->');
    if (!isHtmlComment) {
      return null;
    }

    try {
      const commentContent = htmlValue
        .replace('<!--', '')
        .replace('-->', '')
        .trim();
      const parsed = JSON.parse(commentContent) as Record<string, unknown>;
      if (Array.isArray(parsed)) {
        return { config: parsed as ChartTypeConfig[] };
      }
      if (parsed && Object.keys(parsed).length > 0) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  private resolveConfig(
    preElement: Element | null,
    contextProps: Record<string, unknown>,
  ): Record<string, unknown> {
    const baseConfig =
      preElement?.type === 'code' &&
      preElement?.language === 'html' &&
      preElement?.otherProps
        ? preElement?.otherProps
        : {};
    if (contextProps && Object.keys(contextProps).length > 0) {
      return { ...baseConfig, ...contextProps };
    }
    return baseConfig;
  }

  private parseWithPlugins(currentElement: RootContent): {
    handled: boolean;
    el: Element | Element[] | null;
  } {
    for (const plugin of this.plugins) {
      const rule = plugin.parseMarkdown?.find((r) => r.match(currentElement));
      if (rule) {
        const converted = rule.convert(currentElement);
        if (Array.isArray(converted) && converted.length === 2) {
          return { handled: true, el: converted[0] as Element };
        }
        return { handled: true, el: converted as Element };
      }
    }
    return { handled: false, el: null };
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
    const markdownRoot = this.buildMarkdownRoot(md);
    const schema = this.parseNodes(markdownRoot, true, undefined) as Elements[];
    const filteredSchema = this.filterTopLevelSchema(schema);

    return {
      schema: filteredSchema,
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
    if (!nodes?.length) {
      return [this.createEmptyParagraph()];
    }

    let els: (Elements | Text)[] = [];
    const context = this.createParseContext();

    for (const currentElement of nodes) {
      const htmlCommentProps = this.parseHtmlCommentProps(currentElement);
      if (htmlCommentProps) {
        // 将注释属性存储到 contextProps 中，供下一个元素使用
        context.contextProps = { ...context.contextProps, ...htmlCommentProps };
        // 跳过 HTML 注释本身，避免生成独立的 HTML 代码节点
        //
        // 【为何 preNode 里拿不到图表配置】
        // continue 后不会 push 任何 el，也不会执行 preNode=currentElement、preElement=el。
        // 下一轮处理表格时，preElement 仍是「注释前」的节点（如 paragraph/heading），
        // 不可能是 type='code' 且 language='html' 的节点，parseTableOrChart 里
        // 从 preNode（实为 preElement）取 otherProps 会得到 {}。
        // 因此图表配置必须通过 contextProps，由 table handler 以
        // contextChartConfig 传入 parseTableOrChart。
        continue;
      }

      const config = this.resolveConfig(context.preElement, context.contextProps);
      const pluginResult = this.parseWithPlugins(currentElement);
      let el: Element | Element[] | null = pluginResult.el;

      if (Object.keys(config).length > 0) {
        this.config = { ...this.config, ...config };
      }

      if (!pluginResult.handled) {
        const result = this.handleSingleElement({
          currentElement,
          config,
          parent,
          htmlTag: context.htmlTag,
          preElement: context.preElement,
        });

        el = result.el;
        if (result.contextProps) {
          context.contextProps = {
            ...context.contextProps,
            ...result.contextProps,
          };
        }
        // 更新 htmlTag 数组，以便后续节点可以使用
        if (result.htmlTag) {
          context.htmlTag = result.htmlTag;
        }
      }

      els = addEmptyLinesIfNeeded(els, context.preNode, currentElement, top);

      if (el) {
        const appliedElement = applyContextPropsAndConfig(
          el,
          context.contextProps,
          config,
        );
        // 使用 if-else 而不是条件表达式，避免类型错误
        if (Array.isArray(appliedElement)) {
          els = [...els, ...appliedElement];
        } else {
          els = [...els, appliedElement];
        }
      }

      context.preNode = currentElement;
      context.preElement = el as Element;
    }

    return els;
  }

  /**
   * 处理单个元素（类方法版本）
   */
  /**
   * 获取统一的元素处理器映射表
   */
  private getElementHandlers(): Record<string, ElementHandler> {
    const parseNodesFn = (nodes: any[], top: boolean, parent: any) =>
      this.parseNodes(nodes, top, parent);

    const parseNodesForTable = (
      nodes: RootContent[],
      _plugins: MarkdownEditorPlugin[],
      top?: boolean,
      parent?: RootContent,
    ) => this.parseNodes(nodes, top || false, parent);

    return {
      html: { handler: () => null, needsHtmlResult: true },
      image: { handler: (el) => handleImage(el) },
      inlineMath: { handler: (el) => handleInlineMath(el) },
      math: { handler: (el) => handleMath(el) },
      footnoteReference: { handler: (el) => handleFootnoteReference(el) },
      inlineCode: { handler: (el) => handleInlineCode(el) },
      thematicBreak: { handler: () => handleThematicBreak() },
      code: { handler: (el, context) => handleCode(el, context.config) },
      yaml: { handler: (el) => handleYaml(el) },
      definition: { handler: (el) => handleDefinition(el) },
      heading: {
        handler: (el) => handleHeading(el, parseNodesFn),
      },
      list: {
        handler: (el) => handleList(el, parseNodesFn),
      },
      listItem: {
        handler: (el) => handleListItem(el, parseNodesFn),
      },
      blockquote: {
        handler: (el) => handleBlockquote(el, parseNodesFn),
      },
      footnoteDefinition: {
        handler: (el) => handleFootnoteDefinition(el, parseNodesFn),
      },
      paragraph: {
        handler: (el, context) =>
          handleParagraph(el, context.config, parseNodesFn),
      },
      table: {
        // 传入 config：当上一条是图表注释且被 continue 掉时，config 来自 contextProps，
        // 作为 contextChartConfig 供 parseTableOrChart 在 preNode 无 html 配置时使用
        handler: (el, context) =>
          parseTableOrChart(
            el,
            context.preElement || (context.parent as any),
            this.plugins,
            parseNodesForTable,
            this.config,
            context.config as Record<string, unknown>,
          ),
      },
    };
  }

  private handleSingleElement(
    params: HandleSingleElementParams,
  ): { el: Element | Element[] | null; contextProps?: any; htmlTag?: any[] } {
    const { currentElement, config, parent, htmlTag, preElement } = params;
    const elementType = currentElement.type;
    const elementHandlers = this.getElementHandlers();
    const handlerInfo = elementHandlers[elementType];

    if (handlerInfo?.needsHtmlResult) {
      const htmlResult = handleHtml(currentElement, parent, htmlTag, (md) =>
        ({ schema: this.parse(md).schema }),
      );
      const result: any = {
        el: htmlResult.el,
      };
      if (htmlResult.contextProps) {
        result.contextProps = htmlResult.contextProps;
      }
      if (htmlResult.htmlTag) {
        result.htmlTag = htmlResult.htmlTag;
      }
      return result;
    }

    if (!handlerInfo) {
      return {
        el: handleTextAndInlineElements(
          currentElement,
          htmlTag,
          (nodes, top, parent) => this.parseNodes(nodes, top, parent),
          this.config,
        ),
      };
    }

    const handlerResult = handlerInfo.handler(
      currentElement,
      {
        config,
        parent,
        htmlTag,
        preElement,
      },
    );

    return { el: handlerResult };
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
  // 将 markdown 按块分割，同时生成哈希
  const blocks = splitMarkdownIntoBlocks(md || '', config, plugins);

  // 复用同一个 parser 实例
  const parser = new MarkdownToSlateParser(config || {}, plugins || []);

  // 如果只有一个块，直接解析
  if (blocks.length <= 1) {
    const result = parser.parse(md);
    const blockHash = blocks[0]?.hash || simpleHash(md || '');
    // 为 schema 元素添加 hash
    return {
      schema: result.schema.map((s, index) => ({
        ...s,
        hash: blockHash + '-' + index,
      })),
      links: result.links,
    };
  }

  // 对每个块进行缓存查找或解析
  const allSchemas: Elements[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const { content, hash } = blocks[i];

    // 检查缓存
    if (parseCache.has(hash)) {
      const cachedSchema = parseCache.get(hash)!;
      allSchemas.push(...cachedSchema);
      continue;
    }

    // 缓存未命中，解析块
    const result = parser.parse(content);

    // 为 schema 元素添加 hash
    const schemaWithHash = result.schema.map((s, index) => ({
      ...s,
      hash: `${hash}-${index}`,
    }));

    // 存入缓存（带 hash）
    parseCache.set(hash, schemaWithHash);

    // 限制缓存大小（最多 100 个条目）
    if (parseCache.size > 100) {
      const firstKey = parseCache.keys().next().value;
      if (firstKey) {
        parseCache.delete(firstKey);
      }
    }

    allSchemas.push(...schemaWithHash);
  }

  return {
    schema: allSchemas,
    links: [],
  };
};
