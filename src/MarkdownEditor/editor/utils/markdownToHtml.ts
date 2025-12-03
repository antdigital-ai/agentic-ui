import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import type { Plugin, Processor } from 'unified';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import {
  convertParagraphToImage,
  fixStrongWithSpecialChars,
} from '../parser/remarkParse';

// 使用 any 类型避免 hast 类型依赖问题
type HastElement = {
  tagName: string;
  properties?: Record<string, any>;
  children?: HastNode[];
};

type HastNode = HastElement | { type: 'text'; value: string };

type HastRoot = {
  type: 'root';
  children: HastNode[];
};

export type MarkdownRemarkPlugin = Plugin | [Plugin, ...unknown[]];
export type MarkdownToHtmlOptions = MarkdownRemarkPlugin[];

/**
 * Markdown 转 HTML 的配置选项
 */
export interface MarkdownToHtmlConfig {
  /** 是否在新标签页打开链接 */
  openLinksInNewTab?: boolean;
  /** 自定义段落标签，默认为 'p' */
  paragraphTag?: string;
  /** 用户自定义的 unified 插件配置 */
  markedConfig?: MarkdownRemarkPlugin[];
}

// HTML 转义相关的正则表达式和工具
const ESCAPE_TEST_NO_ENCODE =
  /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const ESCAPE_TEST = /[&<>"']/;
const ESCAPE_REPLACE = /[&<>"']/g;
const ESCAPE_REPLACE_NO_ENCODE =
  /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g;
const ENDING_NEWLINE = /\n$/;

const ESCAPE_REPLACEMENTS: { [index: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const getEscapeReplacement = (ch: string) => ESCAPE_REPLACEMENTS[ch];

/**
 * HTML 转义函数
 * @param html - 要转义的 HTML 字符串
 * @param encode - 是否编码所有特殊字符（包括 &）
 * @returns 转义后的字符串
 */
export function escapeHtml(html: string, encode?: boolean): string {
  if (encode) {
    if (ESCAPE_TEST.test(html)) {
      return html.replace(ESCAPE_REPLACE, getEscapeReplacement);
    }
  } else {
    if (ESCAPE_TEST_NO_ENCODE.test(html)) {
      return html.replace(ESCAPE_REPLACE_NO_ENCODE, getEscapeReplacement);
    }
  }

  return html;
}

const INLINE_MATH_WITH_SINGLE_DOLLAR = { singleDollarTextMath: true };
const FRONTMATTER_LANGUAGES: readonly string[] = ['yaml'];

const remarkRehypePlugin = remarkRehype as unknown as Plugin;

/**
 * 配置链接渲染器，在新标签页打开链接
 */
function rehypeLinkTarget(): Plugin<[], HastRoot> {
  return () => {
    return (tree: any) => {
      visit(tree, 'element', (node: any) => {
        if (node.tagName === 'a' && node.properties) {
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      });
    };
  };
}

/**
 * 配置段落渲染器，支持自定义段落标签
 */
function rehypeParagraphTag(tagName: string = 'p'): Plugin<[], HastRoot> {
  return () => {
    return (tree: any) => {
      visit(tree, 'element', (node: any) => {
        if (node.tagName === 'p') {
          node.tagName = tagName;
        }
      });
    };
  };
}

/**
 * 从代码节点中提取原始文本
 */
function getCodeText(node: any): string {
  if (!node.children) return '';
  return node.children
    .map((child: any) => {
      if (child.type === 'text' && 'value' in child) {
        return String(child.value);
      }
      if (child.type === 'element') {
        return getCodeText(child);
      }
      return '';
    })
    .join('');
}

/**
 * 配置代码块渲染器，添加流式状态支持
 */
function rehypeCodeBlock(): Plugin<[], HastRoot> {
  return () => {
    return (tree: any) => {
      visit(tree, 'element', (node: any) => {
        if (node.tagName === 'pre' && node.children?.[0]) {
          const codeNode = node.children[0] as any;
          if (codeNode.tagName === 'code' && codeNode.properties) {
            // 检查是否为代码块（而非行内代码）
            // 代码块通常在 pre 标签内，且有 className 包含 language-
            const hasLanguageClass = codeNode.properties.className
              ? Array.isArray(codeNode.properties.className)
                ? codeNode.properties.className.some((cls: any) =>
                    String(cls).startsWith('language-'),
                  )
                : String(codeNode.properties.className).startsWith('language-')
              : false;

            // 或者通过检查代码内容长度来判断（代码块通常较长）
            const codeText = getCodeText(codeNode);
            const isBlock =
              hasLanguageClass ||
              (codeText.includes('\n') && codeText.length > 10);

            if (isBlock) {
              // 添加 data-block 属性
              codeNode.properties['data-block'] = 'true';

              // 默认设置为 done，在实际流式场景中可以通过外部传入状态
              // 这里我们检查代码是否看起来完整（有换行且不以换行结尾可能表示未完成）
              const endsWithNewline = codeText.match(ENDING_NEWLINE);
              const streamStatus = endsWithNewline ? 'done' : 'loading';

              // 添加 data-state 属性
              codeNode.properties['data-state'] = streamStatus;

              // 转义代码内容（移除末尾换行后重新添加，确保格式一致）
              if (codeNode.children && codeNode.children.length > 0) {
                const textNode = codeNode.children[0];
                if (textNode.type === 'text' && 'value' in textNode) {
                  const code = String(textNode.value).replace(
                    ENDING_NEWLINE,
                    '',
                  );
                  textNode.value = escapeHtml(code, true) + '\n';
                }
              }
            }
          }
        }
      });
    };
  };
}

export const DEFAULT_MARKDOWN_REMARK_PLUGINS: readonly MarkdownRemarkPlugin[] =
  [
    remarkParse,
    remarkGfm,
    fixStrongWithSpecialChars,
    convertParagraphToImage,
    [remarkMath as unknown as Plugin, INLINE_MATH_WITH_SINGLE_DOLLAR],
    [remarkFrontmatter, FRONTMATTER_LANGUAGES],
    [remarkRehypePlugin, { allowDangerousHtml: true }],
  ] as const;

const DEFAULT_REMARK_PLUGINS: MarkdownRemarkPlugin[] = [
  ...DEFAULT_MARKDOWN_REMARK_PLUGINS,
];

const applyPlugins = (
  processor: Processor,
  plugins: MarkdownRemarkPlugin[],
): Processor => {
  const extendedProcessor = processor as Processor & {
    use: (plugin: Plugin, ...args: unknown[]) => Processor;
  };
  plugins.forEach((entry) => {
    if (Array.isArray(entry)) {
      const [plugin, ...pluginOptions] = entry as unknown as [
        Plugin,
        ...unknown[],
      ];
      extendedProcessor.use(plugin, ...pluginOptions);
      return;
    }
    extendedProcessor.use(entry as Plugin);
  });

  return processor;
};

const resolveRemarkPlugins = (
  plugins?: MarkdownToHtmlOptions,
): MarkdownRemarkPlugin[] => {
  if (!plugins || plugins.length === 0) {
    return DEFAULT_REMARK_PLUGINS;
  }
  return plugins;
};

const createMarkdownProcessor = (
  plugins?: MarkdownToHtmlOptions,
  config?: MarkdownToHtmlConfig,
) => {
  const processor = unified();
  const remarkPlugins = resolveRemarkPlugins(plugins);
  applyPlugins(processor, remarkPlugins);
  processor.use(rehypeRaw).use(rehypeKatex as unknown as Plugin);

  // 应用配置选项
  if (config?.openLinksInNewTab) {
    processor.use(rehypeLinkTarget());
  }

  if (config?.paragraphTag && config.paragraphTag !== 'p') {
    processor.use(rehypeParagraphTag(config.paragraphTag));
  }

  processor.use(rehypeCodeBlock());

  // 用户自定义配置（最后应用，可以覆盖默认配置）
  if (config?.markedConfig) {
    applyPlugins(processor, config.markedConfig);
  }

  processor.use(rehypeStringify);
  return processor;
};

/**
 * 将 Markdown 内容转换为 HTML（异步版本）
 *
 * 使用 unified 处理器链来处理 Markdown 到 HTML 的转换，支持：
 * - GitHub 风味 Markdown (GFM)
 * - 数学公式 (KaTeX)
 * - 前置元数据 (Frontmatter)
 * - 特殊字符修复
 * - 原始 HTML 标签
 * - 链接在新标签页打开（可选）
 * - 自定义段落标签（可选）
 * - 代码块流式状态支持
 *
 * @param markdown - 要转换的 Markdown 字符串
 * @param plugins - 可选的 unified 插件配置
 * @param config - 可选的渲染配置选项
 * @returns Promise<string> - 从 Markdown 生成的 HTML 字符串
 *
 * @example
 * ```typescript
 * const html = await markdownToHtml('# 标题\n\n这是**粗体**文本');
 * console.log(html); // '<h1>标题</h1><p>这是<strong>粗体</strong>文本</p>'
 *
 * // 使用配置选项
 * const htmlWithConfig = await markdownToHtml(
 *   '[链接](https://example.com)',
 *   undefined,
 *   { openLinksInNewTab: true, paragraphTag: 'div' }
 * );
 * ```
 *
 * @throws {Error} 当转换过程中发生错误时返回空字符串
 */
export const markdownToHtml = async (
  markdown: string,
  plugins?: MarkdownToHtmlOptions,
  config?: MarkdownToHtmlConfig,
): Promise<string> => {
  try {
    const htmlContent = await createMarkdownProcessor(plugins, config).process(
      markdown,
    );

    return String(htmlContent);
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return '';
  }
};

/**
 * 将 Markdown 内容转换为 HTML（同步版本）
 *
 * 同步版本的 markdownToHtml，使用相同的处理器链但以同步方式执行。
 * 适用于不需要异步处理的场景，但可能会阻塞主线程。
 *
 * @param markdown - 要转换的 Markdown 字符串
 * @param plugins - 可选的 unified 插件配置
 * @param config - 可选的渲染配置选项
 * @returns string - 从 Markdown 生成的 HTML 字符串
 *
 * @example
 * ```typescript
 * const html = markdownToHtmlSync('## 副标题\n\n- 列表项1\n- 列表项2');
 * console.log(html); // '<h2>副标题</h2><ul><li>列表项1</li><li>列表项2</li></ul>'
 *
 * // 使用配置选项
 * const htmlWithConfig = markdownToHtmlSync(
 *   '[链接](https://example.com)',
 *   undefined,
 *   { openLinksInNewTab: true }
 * );
 * ```
 *
 * @throws {Error} 当转换过程中发生错误时返回空字符串
 *
 * @remarks
 * - 建议在可能的情况下使用异步版本 `markdownToHtml`
 * - 同步版本可能影响用户界面响应性
 */
export const markdownToHtmlSync = (
  markdown: string,
  plugins?: MarkdownToHtmlOptions,
  config?: MarkdownToHtmlConfig,
): string => {
  try {
    const file = createMarkdownProcessor(plugins, config).processSync(markdown);
    return String(file);
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return '';
  }
};
