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
  handler: (
    element: any,
    _plugins: MarkdownEditorPlugin[],
    config?: any,
    parent?: RootContent,
    htmlTag?: { tag: string; color?: string; url?: string }[],
    preElement?: Element | null,
    _parser?: any,
  ) => Element | Element[] | null;
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
    // 先预处理 <think> 标签，然后预处理其他非标准 HTML 标签，最后处理表格换行
    const thinkProcessed = removeAnswerTags(preprocessThinkTags(md || ''));
    const nonStandardProcessed = removeAnswerTags(
      preprocessNonStandardHtmlTags(thinkProcessed),
    );
    // parse() 只执行 parser，需要 runSync() 来执行 transformer 插件
    const ast = mdastParser.parse(
      preprocessMarkdownTableNewlines(nonStandardProcessed),
    ) as any;
    const processedMarkdown = mdastParser.runSync(ast) as any;
    const markdownRoot = processedMarkdown.children;

    // 使用类的配置和插件，通过 this 访问
    const schema = this.parseNodes(markdownRoot, true, undefined) as Elements[];
    return {
      schema: schema?.filter((item) => {
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
    let pendingHtmlCommentProps: any = null;

    for (let i = 0; i < nodes.length; i++) {
      const currentElement = nodes[i] as any;
      let el: Element | null | Element[] = null;
      let pluginHandled = false;

      // 检查当前元素是否是 HTML 注释
      const isHtmlComment =
        currentElement.type === 'html' &&
        currentElement.value?.trim()?.startsWith('<!--') &&
        currentElement.value?.trim()?.endsWith('-->');

      let htmlCommentProps: Record<string, any> = {};
      let isOtherPropsComment = false;
      if (isHtmlComment) {
        try {
          const commentContent = currentElement.value
            .replace('<!--', '')
            .replace('-->', '')
            .trim();
          htmlCommentProps = JSON.parse(commentContent);
          // 如果能够成功解析为 JSON 对象，且是对象类型（不是数组或基本类型）
          if (
            typeof htmlCommentProps === 'object' &&
            htmlCommentProps !== null &&
            !Array.isArray(htmlCommentProps)
          ) {
            // 检查是否包含代码块的元数据属性（data-language、data-block、data-state）
            // 这些属性表明这是代码块的 otherProps 序列化生成的注释
            const hasCodeMetadataProps =
              htmlCommentProps['data-language'] ||
              htmlCommentProps['data-block'] ||
              htmlCommentProps['data-state'];
            // 只有当包含代码块元数据属性时，才认为是 otherProps 注释
            // 对齐注释（如 {"align":"center"}）不包含这些属性，应该被保留
            isOtherPropsComment = hasCodeMetadataProps;
          }
          if (Array.isArray(htmlCommentProps)) {
            htmlCommentProps = {
              config: htmlCommentProps as ChartTypeConfig[],
            };
          }
        } catch (e) {
          // 解析失败，不是 JSON 格式的注释，可能是真正的 HTML 注释
          isOtherPropsComment = false;
        }
      }

      const nextElement = i + 1 < nodes.length ? nodes[i + 1] : null;
      const isNextCodeBlock = nextElement?.type === 'code';

      // 如果 HTML 注释是代码块的 otherProps 序列化生成的，应该跳过，避免被解析为独立的 HTML 代码节点
      // 如果后面跟着代码块，存储注释属性供代码块使用
      if (isHtmlComment && isOtherPropsComment) {
        if (isNextCodeBlock) {
          // 后面有代码块，存储属性供代码块使用
          pendingHtmlCommentProps = htmlCommentProps;
        }
        // 无论后面是否有代码块，都跳过 HTML 注释，避免生成独立的 HTML 代码节点
        continue;
      }

      // 确定要使用的 config：优先使用待处理的 HTML 注释属性，否则使用前一个 HTML 代码节点的属性
      let config = pendingHtmlCommentProps
        ? pendingHtmlCommentProps
        : preElement?.type === 'code' &&
            preElement?.language === 'html' &&
            preElement?.otherProps
          ? preElement?.otherProps
          : {};

      // 如果 HTML 注释不是代码块元数据注释，但包含 JSON 对象属性（如对齐注释），
      // 应该跳过注释本身，但将属性应用到下一个元素
      if (
        isHtmlComment &&
        !isOtherPropsComment &&
        htmlCommentProps &&
        Object.keys(htmlCommentProps).length > 0
      ) {
        // 将对齐注释等非代码块元数据注释的属性存储到 contextProps 中，供下一个元素使用
        contextProps = { ...contextProps, ...htmlCommentProps };
        // 同时将属性作为 config 传递，以便 applyContextPropsAndConfig 设置 otherProps
        config = { ...config, ...htmlCommentProps };
        // 跳过 HTML 注释本身，避免生成独立的 HTML 代码节点
        continue;
      }

      // 如果当前元素应该使用 contextProps 中的属性作为 config（用于设置 otherProps）
      // 这主要针对对齐注释等场景，需要同时设置 contextProps 和 otherProps
      if (contextProps && Object.keys(contextProps).length > 0) {
        config = { ...config, ...contextProps };
      }

      // 如果使用了待处理的 HTML 注释属性，清空它
      if (pendingHtmlCommentProps && config === pendingHtmlCommentProps) {
        pendingHtmlCommentProps = null;
      }

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
      if (Object.keys(config).length > 0) {
        this.config = { ...this.config, ...config };
      }

      // 如果插件没有处理，使用默认处理逻辑
      if (!pluginHandled) {
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
        // 更新 htmlTag 数组，以便后续节点可以使用
        if (result.htmlTag) {
          htmlTag = result.htmlTag;
        }
      }

      els = addEmptyLinesIfNeeded(els, preNode, currentElement, top);

      if (el) {
        el = applyContextPropsAndConfig(el, contextProps, config);
        // 使用 if-else 而不是条件表达式，避免类型错误
        if (Array.isArray(el)) {
          els = [...els, ...el];
        } else {
          els = [...els, el];
        }
      }

      preNode = currentElement;
      preElement = el as Element;
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
      code: { handler: (el, _plugins, config) => handleCode(el, config) },
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
        handler: (el, _plugins, config) =>
          handleParagraph(el, config, parseNodesFn),
      },
      table: {
        handler: (el, _plugins, _config, parent, _htmlTag, preElement) =>
          parseTableOrChart(
            el,
            preElement || (parent as any),
            this.plugins,
            parseNodesForTable,
            this.config,
          ),
      },
    };
  }

  private handleSingleElement(
    currentElement: RootContent,
    config: any,
    parent: RootContent | undefined,
    htmlTag: { tag: string; color?: string; url?: string }[],
    preElement: Element | null,
  ): { el: Element | Element[] | null; contextProps?: any; htmlTag?: any[] } {
    const elementType = currentElement.type;
    const elementHandlers = this.getElementHandlers();
    const handlerInfo = elementHandlers[elementType];

    if (handlerInfo?.needsHtmlResult) {
      const htmlResult = handleHtml(currentElement, parent, htmlTag);
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
      this.plugins,
      config,
      parent,
      htmlTag,
      preElement,
      this,
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
  const parser = new MarkdownToSlateParser(config || {}, plugins || []);
  return parser.parse(md);
};
