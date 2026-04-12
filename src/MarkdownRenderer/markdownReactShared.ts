import { Checkbox, Image } from 'antd';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import React, { useContext } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import type { Plugin, Processor } from 'unified';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { remarkDirectiveContainer } from '../MarkdownEditor/editor/parser/remarkDirectiveContainer';
import remarkDirectiveContainersOnly from '../MarkdownEditor/editor/parser/remarkDirectiveContainersOnly';
import {
  convertParagraphToImage,
  fixStrongWithSpecialChars,
  protectJinjaDollarInText,
} from '../MarkdownEditor/editor/parser/remarkParse';
import {
  REMARK_REHYPE_DIRECTIVE_HANDLERS,
  type MarkdownRemarkPlugin,
  type MarkdownToHtmlConfig,
} from '../MarkdownEditor/editor/utils/markdownToHtml';
import type { MarkdownEditorProps } from '../MarkdownEditor/types';
import { parseChineseCurrencyToNumber } from '../Plugins/chart/utils';
import { ToolUseBarThink } from '../ToolUseBarThink';
import AnimationText from './AnimationText';
import {
  FncRefForMarkdown,
  extractFootnoteRefFromSupChildren,
} from './FncRefForMarkdown';
import { StreamingAnimationContext } from './StreamingAnimationContext';
import type { MarkdownRendererEleProps, RendererBlockProps } from './types';

const INLINE_MATH_WITH_SINGLE_DOLLAR = { singleDollarTextMath: true };
const FRONTMATTER_LANGUAGES: readonly string[] = ['yaml'];
const REMARK_DIRECTIVE_CONTAINER_OPTIONS = {
  className: 'markdown-container',
  titleElement: { className: ['markdown-container__title'] },
};

const remarkRehypePlugin = remarkRehype as unknown as Plugin;

const FOOTNOTE_REF_PATTERN = /\[\^([^\]]+)\]/g;

const CHART_COMMENT_PATTERN = /^<!--\s*(\[[\s\S]*\]|\{[\s\S]*\})\s*-->$/;

const extractCellText = (cell: any): string => {
  if (!cell?.children) return '';
  return cell.children
    .map((child: any) => {
      if (child.type === 'text') return child.value || '';
      if (child.children) return extractCellText(child);
      return '';
    })
    .join('')
    .trim();
};

/**
 * 从 mdast table 节点提取列名和数据
 */
const extractTableData = (
  tableNode: any,
): {
  columns: { title: string; dataIndex: string }[];
  dataSource: Record<string, any>[];
} | null => {
  if (!tableNode.children?.length) return null;

  const headerRow = tableNode.children[0];
  if (!headerRow?.children?.length) return null;

  const columns = headerRow.children.map((cell: any) => {
    const text = extractCellText(cell);
    return { title: text, dataIndex: text, key: text };
  });

  const dataSource: Record<string, any>[] = [];
  for (let i = 1; i < tableNode.children.length; i++) {
    const row = tableNode.children[i];
    if (!row?.children) continue;
    const record: Record<string, any> = { key: `row-${i}` };
    row.children.forEach((cell: any, j: number) => {
      if (j < columns.length) {
        const val = extractCellText(cell);
        if (val === '') {
          record[columns[j].dataIndex] = val;
        } else {
          const num = Number(val);
          if (Number.isFinite(num)) {
            record[columns[j].dataIndex] = num;
          } else {
            const cn = parseChineseCurrencyToNumber(val);
            record[columns[j].dataIndex] = cn !== null ? cn : val;
          }
        }
      }
    });
    dataSource.push(record);
  }

  return { columns, dataSource };
};

/**
 * remark 插件：将 "HTML 注释（图表配置）+ 表格" 组合转为 chart 代码块。
 *
 * 在 MarkdownEditor 中，parseTableOrChart 负责此逻辑。
 * 在 MarkdownRenderer 中，此插件在 mdast 层面完成等价转换。
 *
 * 匹配模式：
 * ```
 * <!-- [{"chartType":"line","x":"month","y":"value",...}] -->
 * | month | value |
 * |-------|-------|
 * | 2024  | 100   |
 * ```
 */
const remarkChartFromComment = () => {
  return (tree: any) => {
    const children = tree.children;
    if (!children || !Array.isArray(children)) return;

    const toRemove: number[] = [];

    for (let i = 0; i < children.length - 1; i++) {
      const node = children[i];
      const next = children[i + 1];

      if (node.type !== 'html' || next.type !== 'table') continue;

      const match = node.value?.match(CHART_COMMENT_PATTERN);
      if (!match) continue;

      let chartConfig: any;
      try {
        chartConfig = JSON.parse(match[1]);
      } catch {
        continue;
      }

      if (!Array.isArray(chartConfig)) chartConfig = [chartConfig];
      const hasChartType = chartConfig.some(
        (c: any) => c.chartType && c.chartType !== 'table',
      );
      if (!hasChartType) continue;

      const tableData = extractTableData(next);
      if (!tableData) continue;

      const chartJson = JSON.stringify({
        config: chartConfig,
        columns: tableData.columns,
        dataSource: tableData.dataSource,
      });

      children[i] = {
        type: 'code',
        lang: 'chart',
        value: chartJson,
      };
      toRemove.push(i + 1);
      i++;
    }

    for (let j = toRemove.length - 1; j >= 0; j--) {
      children.splice(toRemove[j], 1);
    }
  };
};

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
          children.push({
            type: 'text',
            value: value.slice(lastIndex, match.index),
          });
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
    .use(remarkDirectiveContainersOnly)
    .use(remarkDirectiveContainer, REMARK_DIRECTIVE_CONTAINER_OPTIONS)
    .use(remarkChartFromComment)
    .use(remarkRehypePlugin, {
      allowDangerousHtml: true,
      handlers: REMARK_REHYPE_DIRECTIVE_HANDLERS,
    })
    .use(rehypeRaw)
    .use(rehypeKatex, { strict: 'ignore' } as any)
    .use(rehypeFootnoteRef);

  if (extraRemarkPlugins) {
    extraRemarkPlugins.forEach((entry) => {
      if (Array.isArray(entry)) {
        const [plugin, ...pluginOptions] = entry as unknown as [
          Plugin,
          ...unknown[],
        ];
        processor.use(plugin, ...pluginOptions);
      } else {
        processor.use(entry as Plugin);
      }
    });
  }

  if (config?.markedConfig) {
    config.markedConfig.forEach((entry) => {
      if (Array.isArray(entry)) {
        const [plugin, ...pluginOptions] = entry as unknown as [
          Plugin,
          ...unknown[],
        ];
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
  const flat =
    typeof className === 'string' ? className : className.map(String).join(' ');
  const classes = flat.split(/\s+/).filter(Boolean);
  for (const cls of classes) {
    const match = cls.match(/^language-(.+)$/);
    if (match) return match[1];
  }
  return undefined;
};

const extractChildrenText = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children))
    return children.map(extractChildrenText).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractChildrenText(children.props.children);
  }
  return '';
};

/** <think> 标签 → ToolUseBarThink（MarkdownRenderer 无 Slate 上下文，直接渲染） */
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

/** hast → React 组件映射，与 MarkdownEditor Readonly 的 data-be / prefixCls 对齐 */
const buildEditorAlignedComponents = (
  prefixCls: string,
  userComponents: Record<string, React.ComponentType<RendererBlockProps>>,
  streaming?: boolean,
  linkConfig?: {
    openInNewTab?: boolean;
    onClick?: (url?: string) => boolean | void;
  },
  fncProps?: MarkdownEditorProps['fncProps'],
  streamingParagraphAnimation?: boolean,
  eleRender?: (
    props: MarkdownRendererEleProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode,
) => {
  const listCls = `${prefixCls}-list`;
  const tableCls = `${prefixCls}-content-table`;
  const contentCls = prefixCls; // e.g. ant-agentic-md-editor-content

  /** 仅当 streaming、末块动画上下文允许且显式开启段落动画时包 AnimationText */
  const StreamAnimWrap = ({ children }: { children: any }) => {
    const ctx = useContext(StreamingAnimationContext);
    const animateBlock = ctx?.animateBlock ?? true;
    const allow = !!streaming && animateBlock && !!streamingParagraphAnimation;
    if (!allow) return children;
    return jsx(AnimationText as any, { children });
  };
  StreamAnimWrap.displayName = 'StreamAnimWrap';

  const wrapAnimation = (children: any) => jsx(StreamAnimWrap, { children });

  /**
   * 应用 eleRender 拦截：若用户返回非 undefined 值则使用，否则使用 defaultDom。
   * 不对 table-cell/table-row 等子结构元素（th/td/tr/thead/tbody）进行拦截，
   * 与 Slate 模式保持一致。
   */
  const applyEleRender = (
    tagName: string,
    props: any,
    defaultDom: React.ReactNode,
    skip = false,
  ): React.ReactNode => {
    if (!eleRender || skip) return defaultDom;
    const result = eleRender({ tagName, ...props }, defaultDom);
    return result !== undefined ? result : defaultDom;
  };

  return {
    // ================================================================
    // Block 级别元素
    // ================================================================

    p: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('div' as any, {
        ...rest,
        'data-be': 'paragraph',
        'data-testid': 'markdown-paragraph',
        children: wrapAnimation(children),
      });
      return applyEleRender('p', { node, children, ...rest }, defaultDom);
    },

    h1: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('h1' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-1',
        children,
      });
      return applyEleRender('h1', { node, children, ...rest }, defaultDom);
    },
    h2: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('h2' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-2',
        children,
      });
      return applyEleRender('h2', { node, children, ...rest }, defaultDom);
    },
    h3: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('h3' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-3',
        children,
      });
      return applyEleRender('h3', { node, children, ...rest }, defaultDom);
    },
    h4: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('h4' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-4',
        children,
      });
      return applyEleRender('h4', { node, children, ...rest }, defaultDom);
    },
    h5: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('h5' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-5',
        children,
      });
      return applyEleRender('h5', { node, children, ...rest }, defaultDom);
    },
    h6: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('h6' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-6',
        children,
      });
      return applyEleRender('h6', { node, children, ...rest }, defaultDom);
    },

    blockquote: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('blockquote' as any, {
        ...rest,
        'data-be': 'blockquote',
        'data-testid': 'markdown-blockquote',
        children,
      });
      return applyEleRender(
        'blockquote',
        { node, children, ...rest },
        defaultDom,
      );
    },

    ul: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('div' as any, {
        className: `${listCls}-container`,
        'data-be': 'list',
        'data-testid': 'markdown-unordered-list',
        children: jsx('ul' as any, {
          ...rest,
          className: `${listCls} ul`,
          children,
        }),
      });
      return applyEleRender('ul', { node, children, ...rest }, defaultDom);
    },
    ol: (props: any) => {
      const { node, children, start, ...rest } = props;
      const defaultDom = jsx('div' as any, {
        className: `${listCls}-container`,
        'data-be': 'list',
        'data-testid': 'markdown-ordered-list',
        children: jsx('ol' as any, {
          ...rest,
          className: `${listCls} ol`,
          start,
          children,
        }),
      });
      return applyEleRender(
        'ol',
        { node, children, start, ...rest },
        defaultDom,
      );
    },

    li: (props: any) => {
      const { node, children, className, ...rest } = props;
      const isTask =
        className === 'task-list-item' ||
        (Array.isArray(className) && className.includes('task-list-item'));

      let defaultDom: React.ReactNode;
      if (isTask) {
        const childArray = Array.isArray(children) ? children : [children];
        let checked = false;
        const filteredChildren = childArray.filter((child: any) => {
          if (
            React.isValidElement(child) &&
            (child as any).props?.type === 'checkbox'
          ) {
            checked = !!(child as any).props?.checked;
            return false;
          }
          return true;
        });

        defaultDom = jsxs('li' as any, {
          ...rest,
          className: `${listCls}-item ${listCls}-task`,
          'data-be': 'list-item',
          'data-testid': 'markdown-task-item',
          children: [
            jsx('span' as any, {
              className: `${listCls}-check-item`,
              contentEditable: false,
              'data-check-item': true,
              children: jsx(Checkbox as any, { checked, disabled: true }),
            }),
            ...filteredChildren,
          ],
        });
      } else {
        defaultDom = jsx('li' as any, {
          ...rest,
          className: `${listCls}-item`,
          'data-be': 'list-item',
          'data-testid': 'markdown-list-item',
          children,
        });
      }

      return applyEleRender(
        'li',
        { node, children, className, ...rest },
        defaultDom,
      );
    },

    table: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('div' as any, {
        className: tableCls,
        'data-testid': 'markdown-table',
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
      return applyEleRender('table', { node, children, ...rest }, defaultDom);
    },

    thead: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('thead' as any, {
        ...rest,
        'data-testid': 'markdown-thead',
        children,
      });
    },
    tbody: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('tbody' as any, {
        ...rest,
        'data-testid': 'markdown-tbody',
        children,
      });
    },
    tr: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('tr' as any, {
        ...rest,
        'data-testid': 'markdown-tr',
        children,
      });
    },
    th: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('th' as any, {
        ...rest,
        'data-testid': 'markdown-th',
        style: { whiteSpace: 'normal', maxWidth: '20%' },
        children: wrapAnimation(children),
      });
    },
    td: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('td' as any, {
        ...rest,
        'data-testid': 'markdown-td',
        style: { whiteSpace: 'normal', maxWidth: '20%' },
        children: wrapAnimation(children),
      });
    },

    // input[type=checkbox]：task list 的 checkbox（兜底，主逻辑在 li 中）
    input: (props: any) => {
      const { node: _node, type, checked, disabled, ...rest } = props;
      if (type === 'checkbox') {
        return jsx(Checkbox as any, {
          checked: !!checked,
          disabled: true,
          'data-testid': 'markdown-checkbox',
        });
      }
      return jsx('input' as any, { ...rest, type, checked, disabled });
    },

    // ================================================================
    // Leaf 级别（行内元素）
    // ================================================================

    a: (props: any) => {
      const { node, href, onClick: _origOnClick, ...rest } = props;
      const openInNewTab = linkConfig?.openInNewTab !== false;
      const defaultDom = jsx('a' as any, {
        ...rest,
        href,
        'data-be': 'text',
        'data-url': 'url',
        'data-testid': 'markdown-link',
        target: openInNewTab ? '_blank' : undefined,
        rel: openInNewTab ? 'noopener noreferrer' : undefined,
        onClick: (e: MouseEvent) => {
          if (linkConfig?.onClick) {
            const res = linkConfig.onClick(href);
            if (res === false) {
              e.preventDefault();
              return;
            }
          }
        },
      });
      return applyEleRender('a', { node, href, ...rest }, defaultDom);
    },

    strong: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('strong' as any, {
        ...rest,
        'data-testid': 'markdown-bold',
        style: { fontWeight: 'bold' },
        children,
      });
      return applyEleRender('strong', { node, children, ...rest }, defaultDom);
    },

    em: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('em' as any, {
        ...rest,
        'data-testid': 'markdown-italic',
        style: { fontStyle: 'italic' },
        children,
      });
      return applyEleRender('em', { node, children, ...rest }, defaultDom);
    },

    del: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('del' as any, {
        ...rest,
        'data-testid': 'markdown-strikethrough',
        children,
      });
      return applyEleRender('del', { node, children, ...rest }, defaultDom);
    },

    code: (props: any) => {
      const { node: _node, children, className, ...rest } = props;
      const fenceLang = extractLanguageFromClassName(className);
      return jsx('code' as any, {
        ...rest,
        'data-testid': fenceLang
          ? 'markdown-fenced-code'
          : 'markdown-inline-code',
        className: fenceLang ? className : `${contentCls}-inline-code`,
        children,
      });
    },

    mark: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('mark' as any, {
        ...rest,
        'data-testid': 'markdown-mark',
        style: {
          background: 'var(--ant-color-warning-bg, #f59e0b)',
          padding: '0.1em 0.2em',
          borderRadius: 2,
        },
        children,
      });
      return applyEleRender('mark', { node, children, ...rest }, defaultDom);
    },

    kbd: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('kbd' as any, {
        ...rest,
        'data-testid': 'markdown-kbd',
        style: {
          padding: '0.1em 0.4em',
          fontSize: '0.85em',
          border: '1px solid var(--color-gray-border-light, #d9d9d9)',
          borderRadius: 3,
          boxShadow: '0 1px 0 var(--color-gray-border-light, #d9d9d9)',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        },
        children,
      });
      return applyEleRender('kbd', { node, children, ...rest }, defaultDom);
    },

    sub: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('sub' as any, {
        ...rest,
        'data-testid': 'markdown-sub',
        children,
      });
      return applyEleRender('sub', { node, children, ...rest }, defaultDom);
    },

    // ================================================================
    // 代码块 pre > code → 路由到自定义渲染器
    pre: (props: any) => {
      const { node: hastPreNode, children, ...rest } = props;
      const codeChild = Array.isArray(children) ? children[0] : children;
      const codeProps = codeChild?.props || {};
      const codeHastClass =
        hastPreNode?.children?.[0]?.type === 'element' &&
        hastPreNode.children[0].tagName === 'code'
          ? hastPreNode.children[0].properties?.className
          : undefined;
      let language = extractLanguageFromClassName(codeProps.className);
      if (!language) {
        language = extractLanguageFromClassName(
          codeHastClass as string | string[] | undefined,
        );
      }

      const CodeBlockComponent =
        userComponents.__codeBlock || userComponents.code;
      if (CodeBlockComponent) {
        return jsx(CodeBlockComponent as any, {
          ...rest,
          language,
          children: codeProps.children,
          node: hastPreNode,
        });
      }

      const defaultDom = jsxs('pre' as any, {
        ...rest,
        children: [children],
      });
      return applyEleRender(
        'pre',
        { node: hastPreNode, children, ...rest },
        defaultDom,
      );
    },

    img: (props: any) => {
      const { node, src, alt, width, height, ...rest } = props;
      const imgWidth = width ? Number(width) || width : 400;
      const defaultDom = jsx('div' as any, {
        'data-be': 'image',
        'data-testid': 'markdown-image',
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
          'data-testid': 'image-container',
          'data-be': 'image-container',
          children: jsx(Image as any, {
            src,
            alt: alt || 'image',
            width: imgWidth,
            height,
            preview: { getContainer: () => document.body },
            referrerPolicy: 'no-referrer',
            draggable: false,
            style: {
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
            },
          }),
        }),
      });
      return applyEleRender(
        'img',
        { node, src, alt, width, height, ...rest },
        defaultDom,
      );
    },

    // 视频：对齐 ReadonlyMedia 的 video 处理
    video: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('div' as any, {
        'data-be': 'media',
        'data-testid': 'markdown-video',
        style: {
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          margin: '0.5em 0',
        },
        children: jsx('video' as any, {
          ...rest,
          controls: true,
          style: {
            maxWidth: '100%',
            borderRadius: 8,
          },
          children,
        }),
      });
      return applyEleRender('video', { node, children, ...rest }, defaultDom);
    },

    // 音频：对齐 ReadonlyMedia 的 audio 处理
    audio: (props: any) => {
      const { node, children, ...rest } = props;
      const defaultDom = jsx('div' as any, {
        'data-be': 'media',
        'data-testid': 'markdown-audio',
        style: {
          position: 'relative',
          width: '100%',
          margin: '0.5em 0',
        },
        children: jsx('audio' as any, {
          ...rest,
          controls: true,
          style: { width: '100%' },
          children,
        }),
      });
      return applyEleRender('audio', { node, children, ...rest }, defaultDom);
    },

    // iframe
    iframe: (props: any) => {
      const { node, ...rest } = props;
      const defaultDom = jsx('div' as any, {
        'data-testid': 'markdown-iframe',
        style: {
          position: 'relative',
          width: '100%',
          margin: '0.5em 0',
        },
        children: jsx('iframe' as any, {
          ...rest,
          style: {
            width: '100%',
            minHeight: 300,
            border: '1px solid var(--color-gray-border-light, #e8e8e8)',
            borderRadius: 8,
          },
        }),
      });
      return applyEleRender('iframe', { node, ...rest }, defaultDom);
    },

    hr: (props: any) => {
      const { node, ...rest } = props;
      const defaultDom = jsx('hr' as any, {
        ...rest,
        'data-be': 'hr',
        'data-testid': 'markdown-hr',
      });
      return applyEleRender('hr', { node, ...rest }, defaultDom);
    },

    // 脚注引用 sup > a（remark-gfm 有定义时生成）— 与 Slate FncLeaf 对齐
    sup: (props: any) => {
      const { node, children, ...rest } = props;
      const meta = extractFootnoteRefFromSupChildren(children);
      if (meta) {
        return jsx(FncRefForMarkdown as any, {
          fncProps,
          linkConfig,
          identifier: meta.identifier,
          url: meta.url,
          children,
        });
      }
      const defaultDom = jsx('span' as any, {
        ...rest,
        'data-fnc': 'fnc',
        'data-testid': 'markdown-footnote-ref',
        className: `${contentCls}-fnc`,
        style: {
          fontSize: 12,
          cursor: 'pointer',
        },
        children,
      });
      return applyEleRender('sup', { node, children, ...rest }, defaultDom);
    },

    span: (props: any) => {
      const { node: _node, children, ...rest } = props;
      if (rest['data-fnc'] === 'fnc') {
        const raw = rest['data-fnc-name'];
        const identifier =
          raw !== undefined && raw !== null && String(raw).length > 0
            ? String(raw)
            : extractChildrenText(children) || '?';
        return jsx(FncRefForMarkdown as any, {
          fncProps,
          linkConfig,
          identifier,
          children,
        });
      }
      return jsx('span' as any, { ...rest, children });
    },

    section: (props: any) => {
      const { node: _node, children, className, ...rest } = props;
      const isFootnotes =
        className === 'footnotes' ||
        typeof rest?.['data-footnotes'] !== 'undefined';
      if (isFootnotes) {
        return jsx('div' as any, {
          ...rest,
          'data-be': 'footnoteDefinition',
          'data-testid': 'markdown-footnote-section',
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

    think: ThinkBlockRendererComponent,

    answer: (props: any) => {
      const { node: _node, children } = props;
      return jsx(Fragment, { children });
    },

    // 用户提供的组件覆盖在最上层
    ...userComponents,
  };
};

/** markdown 片段 → React 元素 */
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
      passNode: true,
    });
  } catch {
    return null;
  }
};

/** 按双换行拆块，尊重代码围栏边界 */
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
        // 触发分割的是「第二个连续空行」，不应并入上一块末尾，否则与单块解析结果字符串不一致、缓存失效
        const withoutTrailingBlank = current.slice(0, -1);
        blocks.push(withoutTrailingBlank.join('\n'));
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

export interface UseMarkdownToReactOptions {
  remarkPlugins?: MarkdownRemarkPlugin[];
  htmlConfig?: MarkdownToHtmlConfig;
  components?: Record<string, React.ComponentType<RendererBlockProps>>;
  prefixCls?: string;
  linkConfig?: {
    openInNewTab?: boolean;
    onClick?: (url?: string) => boolean | void;
  };
  fncProps?: MarkdownEditorProps['fncProps'];
  streaming?: boolean;
  /** 默认 false */
  streamingParagraphAnimation?: boolean;
  /** 原始流字符串，与 useStreaming 输出分离避免缓存误判 */
  contentRevisionSource?: string;
  /** 返回 undefined 回退默认渲染 */
  eleRender?: (
    props: MarkdownRendererEleProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode;
}

export {
  buildEditorAlignedComponents,
  createHastProcessor,
  renderMarkdownBlock,
  splitMarkdownBlocks,
};
export type { MarkdownRendererEleProps };
