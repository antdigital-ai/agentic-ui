import { Checkbox, Image } from 'antd';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import React, { useMemo, useRef } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import AnimationText from './AnimationText';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import type { Plugin, Processor } from 'unified';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { JINJA_DOLLAR_PLACEHOLDER } from '../MarkdownEditor/editor/parser/constants';
import { remarkDirectiveContainer } from '../MarkdownEditor/editor/parser/remarkDirectiveContainer';
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
import { ToolUseBarThink } from '../ToolUseBarThink';
import type { RendererBlockProps } from './types';

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
        const num = Number(val);
        record[columns[j].dataIndex] = isNaN(num) || val === '' ? val : num;
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
    .use(remarkDirective)
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
  if (Array.isArray(children))
    return children.map(extractChildrenText).join('');
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
  streaming?: boolean,
  linkConfig?: {
    openInNewTab?: boolean;
    onClick?: (url?: string) => boolean | void;
  },
) => {
  const listCls = `${prefixCls}-list`;
  const tableCls = `${prefixCls}-content-table`;
  const contentCls = prefixCls; // e.g. ant-agentic-md-editor-content

  const wrapAnimation = (children: any) =>
    streaming
      ? jsx(AnimationText as any, { children })
      : children;

  return {
    // ================================================================
    // Block 级别元素
    // ================================================================

    p: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('div' as any, {
        ...rest,
        'data-be': 'paragraph',
        'data-testid': 'markdown-paragraph',
        children: wrapAnimation(children),
      });
    },

    h1: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('h1' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-1',
        children: wrapAnimation(children),
      });
    },
    h2: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('h2' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-2',
        children: wrapAnimation(children),
      });
    },
    h3: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('h3' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-3',
        children: wrapAnimation(children),
      });
    },
    h4: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('h4' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-4',
        children: wrapAnimation(children),
      });
    },
    h5: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('h5' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-5',
        children: wrapAnimation(children),
      });
    },
    h6: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('h6' as any, {
        ...rest,
        'data-be': 'head',
        'data-testid': 'markdown-heading-6',
        children: wrapAnimation(children),
      });
    },

    blockquote: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('blockquote' as any, {
        ...rest,
        'data-be': 'blockquote',
        'data-testid': 'markdown-blockquote',
        children,
      });
    },

    ul: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('div' as any, {
        className: `${listCls}-container`,
        'data-be': 'list',
        'data-testid': 'markdown-unordered-list',
        children: jsx('ul' as any, {
          ...rest,
          className: `${listCls} ul`,
          children,
        }),
      });
    },
    ol: (props: any) => {
      const { node: _node, children, start, ...rest } = props;
      return jsx('div' as any, {
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
    },

    li: (props: any) => {
      const { node: _node, children, className, ...rest } = props;
      const isTask =
        className === 'task-list-item' ||
        (Array.isArray(className) && className.includes('task-list-item'));

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

        return jsxs('li' as any, {
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
      }

      return jsx('li' as any, {
        ...rest,
        className: `${listCls}-item`,
        'data-be': 'list-item',
        'data-testid': 'markdown-list-item',
        children,
      });
    },

    table: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('div' as any, {
        className: tableCls,
        'data-testid': 'markdown-table',
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
      return jsx('th' as any, { ...rest, 'data-testid': 'markdown-th', children });
    },
    td: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('td' as any, { ...rest, 'data-testid': 'markdown-td', children });
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
      const { node: _node, href, onClick: _origOnClick, ...rest } = props;
      const openInNewTab = linkConfig?.openInNewTab !== false;
      return jsx('a' as any, {
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
    },

    strong: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('strong' as any, {
        ...rest,
        'data-testid': 'markdown-bold',
        style: { fontWeight: 'bold' },
        children,
      });
    },

    em: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('em' as any, {
        ...rest,
        'data-testid': 'markdown-italic',
        style: { fontStyle: 'italic' },
        children,
      });
    },

    del: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('del' as any, {
        ...rest,
        'data-testid': 'markdown-strikethrough',
        children,
      });
    },

    code: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('code' as any, {
        ...rest,
        'data-testid': 'markdown-inline-code',
        className: `${contentCls}-inline-code`,
        children,
      });
    },

    mark: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('mark' as any, {
        ...rest,
        'data-testid': 'markdown-mark',
        style: {
          background: '#f59e0b',
          padding: '0.1em 0.2em',
          borderRadius: 2,
        },
        children,
      });
    },

    kbd: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('kbd' as any, {
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
    },

    sub: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('sub' as any, {
        ...rest,
        'data-testid': 'markdown-sub',
        children,
      });
    },

    // ================================================================
    // 代码块 pre > code → 路由到自定义渲染器
    pre: (props: any) => {
      const { node: _node, children, ...rest } = props;
      const codeChild = Array.isArray(children) ? children[0] : children;
      const codeProps = codeChild?.props || {};
      const language = extractLanguageFromClassName(codeProps.className);

      const CodeBlockComponent =
        userComponents.__codeBlock || userComponents.code;
      if (CodeBlockComponent) {
        return jsx(CodeBlockComponent as any, {
          ...rest,
          language,
          children: codeProps.children,
          node: _node,
        });
      }

      return jsxs('pre' as any, {
        ...rest,
        children: [children],
      });
    },

    img: (props: any) => {
      const { node: _node, src, alt, width, height, ..._rest } = props;
      const imgWidth = width ? Number(width) || width : 400;
      return jsx('div' as any, {
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
    },

    // 视频：对齐 ReadonlyMedia 的 video 处理
    video: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('div' as any, {
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
    },

    // 音频：对齐 ReadonlyMedia 的 audio 处理
    audio: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('div' as any, {
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
    },

    // iframe
    iframe: (props: any) => {
      const { node: _node, ...rest } = props;
      return jsx('div' as any, {
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
    },

    hr: (props: any) => {
      const { node: _node, ...rest } = props;
      return jsx('hr' as any, {
        ...rest,
        'data-be': 'hr',
        'data-testid': 'markdown-hr',
      });
    },

    // 脚注引用 sup > a（remark-gfm 有定义时生成）
    sup: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('span' as any, {
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
    },

    span: (props: any) => {
      const { node: _node, children, ...rest } = props;
      if (rest['data-fnc'] === 'fnc') {
        return jsx('span' as any, {
          ...rest,
          'data-testid': 'markdown-footnote-ref',
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

interface UseMarkdownToReactOptions {
  remarkPlugins?: MarkdownRemarkPlugin[];
  htmlConfig?: MarkdownToHtmlConfig;
  components?: Record<string, React.ComponentType<RendererBlockProps>>;
  /** MarkdownEditor 的 CSS 前缀，用于生成对齐的 className */
  prefixCls?: string;
  /** 链接配置：onClick 拦截、openInNewTab 控制 */
  linkConfig?: {
    openInNewTab?: boolean;
    onClick?: (url?: string) => boolean | void;
  };
  /** 是否处于流式状态，用于最后一个块的打字动画 */
  streaming?: boolean;
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

const _BLOCK_CACHE_KEY = Symbol('blockCache');

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
/**
 * 流式场景下，最后一个块每个字符都变化，但大部分变化只是尾部追加。
 * 对最后一个块做节流：只在新增了换行、块级标记、或超过一定字符数时才重新解析。
 */
const LAST_BLOCK_THROTTLE_CHARS = 20;
const BLOCK_BOUNDARY_TRIGGERS = /[\n`|#>*\-[\]]!$]/;

const shouldReparseLastBlock = (
  prevSource: string | undefined,
  newSource: string,
): boolean => {
  if (!prevSource) return true;
  if (newSource.length < prevSource.length) return true;
  if (!newSource.startsWith(prevSource)) return true;
  const added = newSource.slice(prevSource.length);
  if (added.length >= LAST_BLOCK_THROTTLE_CHARS) return true;
  if (BLOCK_BOUNDARY_TRIGGERS.test(added)) return true;
  return false;
};

export const useMarkdownToReact = (
  content: string,
  options?: UseMarkdownToReactOptions,
): React.ReactNode => {
  const processorRef = useRef<Processor | null>(null);
  const blockCacheRef = useRef<Map<string, BlockCacheEntry>>(new Map());
  const lastBlockRef = useRef<{
    source: string;
    element: React.ReactNode;
  } | null>(null);

  const processor = useMemo(() => {
    const p = createHastProcessor(options?.remarkPlugins, options?.htmlConfig);
    processorRef.current = p;
    return p;
  }, [options?.remarkPlugins, options?.htmlConfig]);

  const prefixCls = options?.prefixCls || 'ant-agentic-md-editor';

  const components = useMemo(() => {
    const userComponents = options?.components || {};
    return buildEditorAlignedComponents(
      prefixCls,
      userComponents,
      options?.streaming,
      options?.linkConfig,
    );
  }, [prefixCls, options?.components, options?.streaming, options?.linkConfig]);

  return useMemo(() => {
    if (!content) return null;

    try {
      const preprocessed = content.replace(
        new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'),
        '$',
      );

      const blocks = splitMarkdownBlocks(preprocessed);
      if (blocks.length === 0) return null;

      const cache = blockCacheRef.current;
      const newCache = new Map<string, BlockCacheEntry>();
      const elements: React.ReactNode[] = [];

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const isLast = i === blocks.length - 1;
        // 用 index + 内容前 64 字符作 key，保持稳定性：
        // 相同位置 + 相同内容开头 → 相同 key → React 不 unmount
        const stableKey = `b${i}-${block.slice(0, 64)}`;

        if (!isLast) {
          const cached = cache.get(block);
          if (cached && cached.source === block) {
            newCache.set(block, cached);
            elements.push(
              jsx(Fragment, { children: cached.element }, stableKey),
            );
            continue;
          }
        }

        // 最后一个块：节流——仅在有意义的变化时重新解析
        if (isLast && lastBlockRef.current) {
          if (!shouldReparseLastBlock(lastBlockRef.current.source, block)) {
            newCache.set(block, {
              source: lastBlockRef.current.source,
              element: lastBlockRef.current.element,
            });
            elements.push(
              jsx(
                Fragment,
                { children: lastBlockRef.current.element },
                stableKey,
              ),
            );
            continue;
          }
        }

        const element = renderMarkdownBlock(block, processor, components);
        const entry = { source: block, element };
        newCache.set(block, entry);
        if (isLast) lastBlockRef.current = entry;
        elements.push(jsx(Fragment, { children: element }, stableKey));
      }

      blockCacheRef.current = newCache;
      return jsxs(Fragment, { children: elements });
    } catch (error) {
      console.error('Failed to render markdown:', error);
      return null;
    }
  }, [content, processor, components, options?.streaming]);
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
    const preprocessed = content.replace(
      new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'),
      '$',
    );

    const mdast = processor.parse(preprocessed);
    const hast = processor.runSync(mdast);

    const userComps = components || {};
    const allComponents = buildEditorAlignedComponents(
      'ant-agentic-md-editor',
      userComps,
      false,
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
