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
import { fixStrongWithSpecialChars } from '../parser/remarkParse';

export type MarkdownRemarkPlugin = Plugin | [Plugin, ...unknown[]];
export type MarkdownToHtmlOptions = MarkdownRemarkPlugin[];

const INLINE_MATH_WITH_SINGLE_DOLLAR = { singleDollarTextMath: true };
const FRONTMATTER_LANGUAGES: readonly string[] = ['yaml'];

const remarkRehypePlugin = remarkRehype as unknown as Plugin;

export const DEFAULT_MARKDOWN_REMARK_PLUGINS: readonly MarkdownRemarkPlugin[] =
  [
    remarkParse,
    remarkGfm,
    fixStrongWithSpecialChars,
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

const createMarkdownProcessor = (plugins?: MarkdownToHtmlOptions) => {
  const processor = unified();
  const remarkPlugins = resolveRemarkPlugins(plugins);
  applyPlugins(processor, remarkPlugins);
  processor
    .use(rehypeRaw)
    .use(rehypeKatex as unknown as Plugin)
    .use(rehypeStringify);
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
 *
 * @param markdown - 要转换的 Markdown 字符串
 * @returns Promise<string> - 从 Markdown 生成的 HTML 字符串
 *
 * @example
 * ```typescript
 * const html = await markdownToHtml('# 标题\n\n这是**粗体**文本');
 * console.log(html); // '<h1>标题</h1><p>这是<strong>粗体</strong>文本</p>'
 * ```
 *
 * @throws {Error} 当转换过程中发生错误时返回空字符串
 */
export const markdownToHtml = async (
  markdown: string,
  plugins?: MarkdownToHtmlOptions,
): Promise<string> => {
  try {
    const htmlContent =
      await createMarkdownProcessor(plugins).process(markdown);

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
 * @returns string - 从 Markdown 生成的 HTML 字符串
 *
 * @example
 * ```typescript
 * const html = markdownToHtmlSync('## 副标题\n\n- 列表项1\n- 列表项2');
 * console.log(html); // '<h2>副标题</h2><ul><li>列表项1</li><li>列表项2</li></ul>'
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
): string => {
  try {
    const file = createMarkdownProcessor(plugins).processSync(markdown);
    return String(file);
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return '';
  }
};
