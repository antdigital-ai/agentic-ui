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

/**
 * 构建与 MarkdownEditor Readonly 组件对齐的 hast→React 组件映射。
 *
 * MarkdownEditor 的 Slate 元素使用 data-be 属性和 prefixCls 类名，
 * 这里为原生 HTML 标签添加相同的属性，使共用的 CSS 能正确命中。
 */
const buildEditorAlignedComponents = (
  prefixCls: string,
  userComponents: Record<string, React.ComponentType<RendererBlockProps>>,
) => {
  const listCls = `${prefixCls}-list`;
  const tableCls = `${prefixCls}-content-table`;

  return {
    // 段落：data-be="paragraph"
    p: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('div' as any, {
        ...rest,
        'data-be': 'paragraph',
        children,
      });
    },

    // 标题：h1-h6, data-be="head"
    h1: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('h1' as any, { ...rest, 'data-be': 'head', children });
    },
    h2: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('h2' as any, { ...rest, 'data-be': 'head', children });
    },
    h3: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('h3' as any, { ...rest, 'data-be': 'head', children });
    },
    h4: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('h4' as any, { ...rest, 'data-be': 'head', children });
    },
    h5: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('h5' as any, { ...rest, 'data-be': 'head', children });
    },
    h6: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('h6' as any, { ...rest, 'data-be': 'head', children });
    },

    // 引用块：data-be="blockquote"
    blockquote: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('blockquote' as any, {
        ...rest,
        'data-be': 'blockquote',
        children,
      });
    },

    // 列表（ul/ol）：包裹 div.list-container + ul/ol.list
    ul: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('div' as any, {
        className: `${listCls}-container`,
        'data-be': 'list',
        children: jsx('ul' as any, {
          ...rest,
          className: `${listCls} ul`,
          children,
        }),
      });
    },
    ol: (props: any) => {
      const { node, children, start, ...rest } = props;
      return jsx('div' as any, {
        className: `${listCls}-container`,
        'data-be': 'list',
        children: jsx('ol' as any, {
          ...rest,
          className: `${listCls} ol`,
          start,
          children,
        }),
      });
    },

    // 列表项：li.list-item, data-be="list-item"
    li: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('li' as any, {
        ...rest,
        className: `${listCls}-item`,
        'data-be': 'list-item',
        children,
      });
    },

    // 表格：复用 MarkdownEditor 的表格 CSS 结构
    table: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('div' as any, {
        className: tableCls,
        children: jsx('div' as any, {
          className: `${tableCls}-container`,
          children: jsx('table' as any, {
            ...rest,
            className: `${tableCls}-readonly-table`,
            children,
          }),
        }),
      });
    },

    // 链接：新标签页打开
    a: (props: any) => {
      const { node, ...rest } = props;
      return jsx('a' as any, {
        ...rest,
        target: '_blank',
        rel: 'noopener noreferrer',
      });
    },

    // 代码块 pre > code → 路由到自定义渲染器
    pre: (props: any) => {
      const { node, children, ...rest } = props;
      const codeChild = Array.isArray(children) ? children[0] : children;
      const codeProps = codeChild?.props || {};
      const language = extractLanguageFromClassName(codeProps.className);

      const CodeBlockComponent = userComponents.__codeBlock || userComponents.code;
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

    // 图片：对齐 ReadonlyEditorImage 的 DOM 结构
    img: (props: any) => {
      const { node, ...rest } = props;
      return jsx('div' as any, {
        'data-be': 'image',
        style: {
          position: 'relative',
          userSelect: 'none',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        },
        children: jsx('div' as any, {
          style: {
            padding: 4,
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          },
          'data-be': 'image-container',
          children: jsx('img' as any, {
            ...rest,
            style: {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 8,
            },
          }),
        }),
      });
    },

    // 水平线
    hr: (props: any) => {
      const { node, ...rest } = props;
      return jsx('hr' as any, { ...rest, 'data-be': 'hr' });
    },

    // 用户提供的组件覆盖在最上层
    ...userComponents,
  };
};

interface UseMarkdownToReactOptions {
  remarkPlugins?: MarkdownRemarkPlugin[];
  htmlConfig?: MarkdownToHtmlConfig;
  components?: Record<string, React.ComponentType<RendererBlockProps>>;
  /** MarkdownEditor 的 CSS 前缀，用于生成对齐的 className */
  prefixCls?: string;
}

/**
 * 将 markdown 字符串转换为 React 元素树的 hook。
 *
 * 使用 unified + remark + rehype 将 markdown 解析为 hast，
 * 再通过 hast-util-to-jsx-runtime 转为 React 元素。
 * 输出的元素带有与 MarkdownEditor 一致的 className 和 data-be 属性。
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

  const prefixCls = options?.prefixCls || 'ant-agentic-md-editor';

  return useMemo(() => {
    if (!content) return null;

    try {
      const preprocessed = content
        .replace(new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'), '$');

      const mdast = processor.parse(preprocessed);
      const hast = processor.runSync(mdast);

      const userComponents = options?.components || {};
      const components = buildEditorAlignedComponents(prefixCls, userComponents);

      return toJsxRuntime(hast as any, {
        Fragment,
        jsx: jsx as any,
        jsxs: jsxs as any,
        components: components as any,
      });
    } catch (error) {
      console.error('Failed to render markdown:', error);
      return null;
    }
  }, [content, processor, options?.components, prefixCls]);
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

    const userComps = components || {};
    const allComponents = buildEditorAlignedComponents(
      'ant-agentic-md-editor',
      userComps,
    );

    return toJsxRuntime(hast as any, {
      Fragment,
      jsx: jsx as any,
      jsxs: jsxs as any,
      components: allComponents as any,
    });
  } catch (error) {
    console.error('Failed to render markdown:', error);
    return null;
  }
};
