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
import React, { useMemo, useRef } from 'react';
import type { Plugin, Processor } from 'unified';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { ToolUseBarThink } from '../ToolUseBarThink';
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

const FOOTNOTE_REF_PATTERN = /\[\^([^\]]+)\]/g;

/**
 * rehype 插件：将文本中残留的 [^N] 模式转为 fnc 标记元素。
 *
 * remark-gfm 只在有对应 footnoteDefinition 时才会转换 footnoteReference，
 * 但 AI 对话场景中 [^1] 常用作内联引用（无底部定义）。
 * 此插件在 hast 层面补充处理这些"裸引用"。
 */
const rehypeFootnoteRef = () => {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;
      const value = node.value as string;
      if (!FOOTNOTE_REF_PATTERN.test(value)) return;

      FOOTNOTE_REF_PATTERN.lastIndex = 0;
      const children: any[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = FOOTNOTE_REF_PATTERN.exec(value)) !== null) {
        if (match.index > lastIndex) {
          children.push({ type: 'text', value: value.slice(lastIndex, match.index) });
        }
        children.push({
          type: 'element',
          tagName: 'span',
          properties: {
            'data-fnc': 'fnc',
            'data-fnc-name': match[1],
          },
          children: [{ type: 'text', value: match[1] }],
        });
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      if (children.length > 0) {
        parent.children.splice(index, 1, ...children);
        return index + children.length;
      }
    });
  };
};

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
    .use(rehypeKatex)
    .use(rehypeFootnoteRef);

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
 * 提取 React children 的文本内容
 */
const extractChildrenText = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractChildrenText).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractChildrenText(children.props.children);
  }
  return '';
};

/**
 * <think> 标签渲染组件——使用 ToolUseBarThink 替代原生 DOM。
 * 在 MarkdownEditor 中，<think> 被预处理为 ```think 代码块，
 * 然后由 ThinkBlock 组件（依赖 Slate 上下文）渲染为 ToolUseBarThink。
 * 在 MarkdownRenderer 中，<think> 通过 rehypeRaw 保留为 hast 元素，
 * 这里直接渲染为 ToolUseBarThink，无需 Slate 上下文。
 */
const ThinkBlockRendererComponent = (props: any) => {
  const { children } = props;
  const content = extractChildrenText(children);
  const isLoading = content.endsWith('...');

  return React.createElement(ToolUseBarThink, {
    testId: 'think-block-renderer',
    styles: {
      root: {
        boxSizing: 'border-box',
        maxWidth: '680px',
        marginTop: 8,
      },
    },
    toolName: isLoading ? '深度思考...' : '深度思考',
    thinkContent: content,
    status: isLoading ? 'loading' : 'success',
  });
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
  const contentCls = prefixCls; // e.g. ant-agentic-md-editor-content

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
    // 无 Slate 节点数据，使用 table-layout: auto 自动计算列宽
    table: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('div' as any, {
        className: tableCls,
        children: jsx('div' as any, {
          className: `${tableCls}-container`,
          children: jsx('table' as any, {
            ...rest,
            className: `${tableCls}-readonly-table`,
            style: { tableLayout: 'auto', width: '100%' },
            children,
          }),
        }),
      });
    },

    // thead / tbody：直接透传
    thead: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('thead' as any, { ...rest, children });
    },
    tbody: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('tbody' as any, { ...rest, children });
    },
    tr: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('tr' as any, { ...rest, children });
    },
    th: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('th' as any, {
        ...rest,
        style: { whiteSpace: 'normal', width: 'auto' },
        children,
      });
    },
    td: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('td' as any, {
        ...rest,
        style: { whiteSpace: 'normal', width: 'auto' },
        children,
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

    // 脚注引用 sup > a（remark-gfm 有定义时生成）
    sup: (props: any) => {
      const { node, children, ...rest } = props;
      return jsx('span' as any, {
        ...rest,
        'data-fnc': 'fnc',
        className: `${contentCls}-fnc`,
        style: {
          fontSize: 12,
          cursor: 'pointer',
        },
        children,
      });
    },

    // span：拦截 rehypeFootnoteRef 生成的 data-fnc span，应用 fnc 样式
    span: (props: any) => {
      const { node, children, ...rest } = props;
      if (rest['data-fnc'] === 'fnc') {
        return jsx('span' as any, {
          ...rest,
          className: `${contentCls}-fnc`,
          style: {
            fontSize: 12,
            cursor: 'pointer',
          },
          children,
        });
      }
      return jsx('span' as any, { ...rest, children });
    },

    // 脚注定义区：remark-gfm 生成 <section data-footnotes class="footnotes">
    section: (props: any) => {
      const { node, children, className, ...rest } = props;
      const isFootnotes =
        className === 'footnotes' ||
        (typeof rest?.['data-footnotes'] !== 'undefined');
      if (isFootnotes) {
        return jsx('div' as any, {
          ...rest,
          'data-be': 'footnoteDefinition',
          style: {
            fontSize: 12,
            borderTop: '1px solid var(--color-gray-border-light, #e8e8e8)',
            marginTop: 16,
            paddingTop: 8,
          },
          children,
        });
      }
      return jsx('section' as any, { ...rest, className, children });
    },

    // <think> 标签：渲染为 ToolUseBarThink 组件
    think: ThinkBlockRendererComponent,

    // <answer> 标签：直接透传子内容（answer 标签是包裹在 think 外层的）
    answer: (props: any) => {
      const { node, children } = props;
      return jsx(Fragment, { children });
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
 * 将单个 markdown 片段转为 React 元素（内部函数）
 */
const renderMarkdownBlock = (
  blockContent: string,
  processor: Processor,
  components: Record<string, any>,
): React.ReactNode => {
  if (!blockContent.trim()) return null;
  try {
    const mdast = processor.parse(blockContent);
    const hast = processor.runSync(mdast);
    return toJsxRuntime(hast as any, {
      Fragment,
      jsx: jsx as any,
      jsxs: jsxs as any,
      components: components as any,
    });
  } catch {
    return null;
  }
};

/**
 * 将 markdown 按块（双换行）拆分，尊重代码围栏边界。
 * 返回的每个块是一个独立的 markdown 片段，可单独解析。
 */
const splitMarkdownBlocks = (content: string): string[] => {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inFence = !inFence;
    }
    if (!inFence && line === '' && current.length > 0) {
      const prev = current[current.length - 1];
      if (prev === '') {
        blocks.push(current.join('\n'));
        current = [];
        continue;
      }
    }
    current.push(line);
  }
  if (current.length > 0) {
    blocks.push(current.join('\n'));
  }
  return blocks;
};

const BLOCK_CACHE_KEY = Symbol('blockCache');

interface BlockCacheEntry {
  source: string;
  element: React.ReactNode;
}

/**
 * 将 markdown 字符串转换为 React 元素树的 hook。
 *
 * 性能优化：分块缓存
 * - markdown 按双换行拆分为独立块
 * - 已完成的块（非最后一个）通过内容哈希缓存 React 输出
 * - 每次更新只重新解析变化的块（通常仅最后一个）
 * - 稳定块的 React 元素直接复用，跳过 parse → hast → jsx 全链路
 */
export const useMarkdownToReact = (
  content: string,
  options?: UseMarkdownToReactOptions,
): React.ReactNode => {
  const processorRef = useRef<Processor | null>(null);
  const blockCacheRef = useRef<Map<string, BlockCacheEntry>>(new Map());

  const processor = useMemo(() => {
    const p = createHastProcessor(options?.remarkPlugins, options?.htmlConfig);
    processorRef.current = p;
    return p;
  }, [options?.remarkPlugins, options?.htmlConfig]);

  const prefixCls = options?.prefixCls || 'ant-agentic-md-editor';

  const components = useMemo(() => {
    const userComponents = options?.components || {};
    return buildEditorAlignedComponents(prefixCls, userComponents);
  }, [prefixCls, options?.components]);

  return useMemo(() => {
    if (!content) return null;

    try {
      const preprocessed = content
        .replace(new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'), '$');

      const blocks = splitMarkdownBlocks(preprocessed);
      if (blocks.length === 0) return null;

      const cache = blockCacheRef.current;
      const newCache = new Map<string, BlockCacheEntry>();
      const elements: React.ReactNode[] = [];

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const isLast = i === blocks.length - 1;

        // 非最后一个块：使用缓存
        if (!isLast) {
          const cached = cache.get(block);
          if (cached && cached.source === block) {
            newCache.set(block, cached);
            elements.push(
              jsx(Fragment, { children: cached.element, key: i }),
            );
            continue;
          }
        }

        // 最后一个块或缓存未命中：重新解析
        const element = renderMarkdownBlock(block, processor, components);
        newCache.set(block, { source: block, element });
        elements.push(
          jsx(Fragment, { children: element, key: i }),
        );
      }

      blockCacheRef.current = newCache;
      return jsxs(Fragment, { children: elements });
    } catch (error) {
      console.error('Failed to render markdown:', error);
      return null;
    }
  }, [content, processor, components]);
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
