import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { useMemo, useRef } from 'react';
import type { Plugin, Processor } from 'unified';
import { unified } from 'unified';
import {
  convertParagraphToImage,
  fixStrongWithSpecialChars,
  protectJinjaDollarInText,
} from '../MarkdownEditor/editor/parser/remarkParse';
import { remarkDirectiveContainer } from '../MarkdownEditor/editor/parser/remarkDirectiveContainer';
import {
  REMARK_REHYPE_DIRECTIVE_HANDLERS,
  type MarkdownRemarkPlugin,
  type MarkdownToHtmlConfig,
} from '../MarkdownEditor/editor/utils/markdownToHtml';
import { JINJA_DOLLAR_PLACEHOLDER } from '../MarkdownEditor/editor/parser/constants';
import type { RendererBlockProps } from './types';

const INLINE_MATH_WITH_SINGLE_DOLLAR = { singleDollarTextMath: true };
const FRONTMATTER_LANGUAGES: readonly string[] = ['yaml'];
const REMARK_DIRECTIVE_CONTAINER_OPTIONS = {
  className: 'markdown-container',
  titleElement: { className: ['markdown-container__title'] },
};

const remarkRehypePlugin = remarkRehype as unknown as Plugin;

/**
 * 创建 unified 处理器，将 markdown 转为 hast
 */
const createHastProcessor = (
  extraRemarkPlugins?: MarkdownRemarkPlugin[],
  config?: MarkdownToHtmlConfig,
): Processor => {
  const processor = unified() as Processor & {
    use: (plugin: Plugin, ...args: unknown[]) => Processor;
  };

  (processor as any)
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
    .use(fixStrongWithSpecialChars)
    .use(convertParagraphToImage)
    .use(protectJinjaDollarInText)
    .use(remarkMath, INLINE_MATH_WITH_SINGLE_DOLLAR)
    .use(remarkFrontmatter, FRONTMATTER_LANGUAGES)
    .use(remarkDirective)
    .use(remarkDirectiveContainer, REMARK_DIRECTIVE_CONTAINER_OPTIONS)
    .use(remarkRehypePlugin, {
      allowDangerousHtml: true,
      handlers: REMARK_REHYPE_DIRECTIVE_HANDLERS,
    })
    .use(rehypeRaw)
    .use(rehypeKatex);

  if (extraRemarkPlugins) {
    extraRemarkPlugins.forEach((entry) => {
      if (Array.isArray(entry)) {
        const [plugin, ...pluginOptions] = entry as unknown as [Plugin, ...unknown[]];
        processor.use(plugin, ...pluginOptions);
      } else {
        processor.use(entry as Plugin);
      }
    });
  }

  if (config?.markedConfig) {
    config.markedConfig.forEach((entry) => {
      if (Array.isArray(entry)) {
        const [plugin, ...pluginOptions] = entry as unknown as [Plugin, ...unknown[]];
        processor.use(plugin, ...pluginOptions);
      } else {
        processor.use(entry as Plugin);
      }
    });
  }

  return processor as Processor;
};

/**
 * 从 code 元素的 className 中提取语言
 */
const extractLanguageFromClassName = (
  className: string | string[] | undefined,
): string | undefined => {
  if (!className) return undefined;
  const classes = Array.isArray(className) ? className : [className];
  for (const cls of classes) {
    const match = String(cls).match(/^language-(.+)$/);
    if (match) return match[1];
  }
  return undefined;
};

interface UseMarkdownToReactOptions {
  remarkPlugins?: MarkdownRemarkPlugin[];
  htmlConfig?: MarkdownToHtmlConfig;
  components?: Record<string, React.ComponentType<RendererBlockProps>>;
}

/**
 * 将 markdown 字符串转换为 React 元素树的 hook。
 *
 * 使用 unified + remark + rehype 将 markdown 解析为 hast，
 * 再通过 hast-util-to-jsx-runtime 转为 React 元素。
 * 支持自定义组件映射，用于拦截特殊块（code, chart, mermaid 等）。
 */
export const useMarkdownToReact = (
  content: string,
  options?: UseMarkdownToReactOptions,
): React.ReactNode => {
  const processorRef = useRef<Processor | null>(null);

  const processor = useMemo(() => {
    const p = createHastProcessor(options?.remarkPlugins, options?.htmlConfig);
    processorRef.current = p;
    return p;
  }, [options?.remarkPlugins, options?.htmlConfig]);

  return useMemo(() => {
    if (!content) return null;

    try {
      const preprocessed = content
        .replace(new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'), '$');

      const mdast = processor.parse(preprocessed);
      const hast = processor.runSync(mdast);

      const components = options?.components || {};

      const result = toJsxRuntime(hast as any, {
        Fragment,
        jsx: jsx as any,
        jsxs: jsxs as any,
        components: {
          ...components,
          a: (props: any) => {
            const { node, ...rest } = props;
            return jsx('a' as any, {
              ...rest,
              target: '_blank',
              rel: 'noopener noreferrer',
            });
          },
          pre: (props: any) => {
            const { node, children, ...rest } = props;
            const codeChild = Array.isArray(children) ? children[0] : children;
            const codeProps = codeChild?.props || {};
            const language = extractLanguageFromClassName(codeProps.className);

            // __codeBlock 是内部约定的代码块渲染器 key
            const CodeBlockComponent = components.__codeBlock || components.code;
            if (CodeBlockComponent) {
              return jsx(CodeBlockComponent as any, {
                ...rest,
                language,
                children: codeProps.children,
                node,
              });
            }

            return jsxs('pre' as any, {
              ...rest,
              children: [children],
            });
          },
        } as any,
      });

      return result;
    } catch (error) {
      console.error('Failed to render markdown:', error);
      return null;
    }
  }, [content, processor, options?.components]);
};

/**
 * 同步将 markdown 转为 React 元素（非 hook 版本，用于测试或一次性转换）
 */
export const markdownToReactSync = (
  content: string,
  components?: Record<string, React.ComponentType<RendererBlockProps>>,
  remarkPlugins?: MarkdownRemarkPlugin[],
  htmlConfig?: MarkdownToHtmlConfig,
): React.ReactNode => {
  if (!content) return null;

  try {
    const processor = createHastProcessor(remarkPlugins, htmlConfig);
    const preprocessed = content
      .replace(new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'), '$');

    const mdast = processor.parse(preprocessed);
    const hast = processor.runSync(mdast);

    return toJsxRuntime(hast as any, {
      Fragment,
      jsx: jsx as any,
      jsxs: jsxs as any,
      components: {
        ...components,
        a: (props: any) => {
          const { node, ...rest } = props;
          return jsx('a' as any, {
            ...rest,
            target: '_blank',
            rel: 'noopener noreferrer',
          });
        },
      } as any,
    });
  } catch (error) {
    console.error('Failed to render markdown:', error);
    return null;
  }
};
