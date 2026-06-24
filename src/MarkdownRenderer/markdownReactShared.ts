import { Checkbox, Image } from 'antd';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import React from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import type { Processor, Plugin } from 'unified';

import type {
  MarkdownRemarkPlugin,
  MarkdownToHtmlConfig,
} from '../MarkdownEditor/editor/utils/markdownToHtml';
import type { FormulaConfig } from '../Config/formulaConfig';
import type { MarkdownEditorProps } from '../MarkdownEditor/types';
import { ToolUseBarThink } from '../ToolUseBarThink';
import { debugInfo } from '../Utils/debugUtils';
import {
  shouldRenderUrlAsPlainText,
  UNSAFE_URL_PLAIN_TEXT_STYLE,
} from '../Utils/htmlUrlSafety';
import {
  extractFootnoteRefFromSupChildren,
  FncRefForMarkdown,
} from './FncRefForMarkdown';
import { createHastProcessor } from './processor';
import {
  INITIAL_FENCE_STATE,
  updateFenceStateForLine,
} from './streaming/fenceTracker';
import type { MarkdownRendererEleProps, RendererBlockProps } from './types';
import {
  extractChildrenText,
  extractLanguageFromClassName,
} from './utils/astExtract';

const THINK_BLOCK_STYLES = {
  root: {
    boxSizing: 'border-box' as const,
    maxWidth: '680px',
    marginTop: 8,
  },
};

/** <think> 标签 → ToolUseBarThink（MarkdownRenderer 无 Slate 上下文，直接渲染） */
const ThinkBlockRendererComponent = (props: any) => {
  const { children } = props;
  const content = extractChildrenText(children);
  const isLoading = content.endsWith('...');

  return React.createElement(ToolUseBarThink, {
    testId: 'think-block-renderer',
    styles: THINK_BLOCK_STYLES,
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
  eleRender?: (
    props: MarkdownRendererEleProps,
    defaultDom: React.ReactNode,
  ) => React.ReactNode,
) => {
  const listCls = `${prefixCls}-list`;
  const tableCls = `${prefixCls}-content-table`;
  const contentCls = prefixCls; // e.g. ant-agentic-md-editor-content

  /**
   * 应用 eleRender 拦截：若用户返回非 undefined 值则使用，否则使用 defaultDom。
   * 不对 table-cell/table-row 等子结构元素（th/td/tr/thead/tbody）进行拦截，
   * 与 Slate 模式保持一致。
   */
  const applyEleRender = (
    tagName: string,
    props: any,
    defaultDom: React.ReactNode,
  ): React.ReactNode => {
    if (!eleRender) return defaultDom;
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
        children,
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
        children,
      });
    },
    td: (props: any) => {
      const { node: _node, children, ...rest } = props;
      return jsx('td' as any, {
        ...rest,
        'data-testid': 'markdown-td',
        style: { whiteSpace: 'normal', maxWidth: '20%' },
        children,
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
      if (shouldRenderUrlAsPlainText(href || '')) {
        return jsx('span' as any, {
          ...rest,
          'data-testid': 'markdown-unsafe-url-plain-text',
          style: UNSAFE_URL_PLAIN_TEXT_STYLE,
          children: href,
        });
      }
      const openInNewTab = linkConfig?.openInNewTab !== false;
      const defaultDom = jsx('a' as any, {
        ...rest,
        href,
        'data-be': 'text',
        'data-url': 'url',
        'data-testid': 'markdown-link',
        target: openInNewTab ? '_blank' : undefined,
        rel: openInNewTab ? 'noopener noreferrer' : undefined,
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
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
      const { node, children, color, bg, label, ...rest } = props;
      const markStyle: Record<string, string> = {};
      if (color) markStyle.color = color;
      if (bg) markStyle.backgroundColor = bg;
      const labelNode =
        label &&
        jsx('span' as any, {
          'data-testid': 'markdown-mark-label',
          style: { marginInlineEnd: 4, fontSize: '0.85em', opacity: 0.75 },
          children: label,
        });
      const defaultDom = jsx('mark' as any, {
        ...rest,
        'data-testid': 'markdown-mark',
        style: Object.keys(markStyle).length
          ? { ...rest.style, ...markStyle }
          : rest.style,
        children: labelNode ? [labelNode, children] : children,
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
      if (shouldRenderUrlAsPlainText(src || '')) {
        return jsx('span' as any, {
          ...rest,
          'data-testid': 'markdown-unsafe-url-plain-text',
          style: UNSAFE_URL_PLAIN_TEXT_STYLE,
          children: src,
        });
      }
      // width 若未提供，不设置默认值，完全由 CSS 控制宽度
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
            width: width ? Number(width) || width : undefined,
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
    thinking: ThinkBlockRendererComponent,

    answer: (props: any) => {
      const { node: _node, children } = props;
      return jsx(Fragment, { children });
    },

    // 用户提供的组件覆盖在最上层
    ...userComponents,
  };
};

const ERROR_FALLBACK_STYLE: React.CSSProperties = {
  margin: '0.5em 0',
  padding: '0.5em 0.75em',
  background: 'var(--ant-color-error-bg, #fff2f0)',
  border: '1px solid var(--ant-color-error-border, #ffccc7)',
  borderRadius: 4,
  fontSize: '0.85em',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

/** markdown 片段 → React 元素；解析失败时降级为原文 <pre> 兜底，避免内容静默丢失。 */
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
  } catch (error) {
    debugInfo('[MarkdownRenderer] renderMarkdownBlock failed', {
      error: (error as Error)?.message || String(error),
      blockContent,
    });
    return jsx('pre' as any, {
      'data-testid': 'markdown-block-error-fallback',
      style: ERROR_FALLBACK_STYLE,
      children: blockContent,
    });
  }
};

import { isGfmTableLine } from './streaming/gfmTableLine';

const LIST_ITEM_PATTERN = /^(\s*)([-+*]|\d+[.)]) /;
const BLOCKQUOTE_PATTERN = /^\s*>/;
const HTML_COMMENT_PATTERN = /^\s*<!--/;
const FOOTNOTE_DEF_PATTERN = /^\s*\[\^/;

/** 匹配 think 标签开标签：`<think>`、`<thinking>`、`<redacted_thinking>`，支持属性（如 `<think lang="zh">`） */
const THINK_OPEN_RE = /^<(think|thinking|redacted_thinking)\b[^>]*>\s*$/;
/** 匹配 think 标签闭标签（独占一行） */
const THINK_CLOSE_RE = /^<\/(think|thinking|redacted_thinking)\s*>$/;
/** 匹配行内出现的 think 闭标签（如 `content`） */
const THINK_CLOSE_INLINE_RE = /<\/(think|thinking|redacted_thinking)\s*>/;
/**
 * 匹配「开标签 + 内容 + 闭标签」在同一行的 think 标签对（如 `<think>inline content</think>`）。
 * 这种情况无需进入 inThinkTag 状态，整行保留在当前 block 即可。
 */
const THINK_INLINE_PAIR_RE =
  /^<(think|thinking|redacted_thinking)\b[^>]*>([\s\S]*)<\/(think|thinking|redacted_thinking)\s*>$/;
/** 匹配同行开标签后紧跟非空白内容（如 `<think>content`，闭标签在后续行） */
const THINK_OPEN_INLINE_RE = /^<(think|thinking|redacted_thinking)\b[^>]*>\S/;

/** 按单空行拆块，保留围栏代码块、列表、blockquote、HTML 注释+表格、脚注定义、think 标签、GFM 表格的连续性 */
const splitMarkdownBlocks = (content: string): string[] => {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let fenceState = { ...INITIAL_FENCE_STATE };
  let inThinkTag = false;
  let inList = false;
  let inBlockquote = false;
  let pendingBlankLines = 0;

  const lastNonEmptyLine = (): string => {
    for (let i = current.length - 1; i >= 0; i--) {
      if (current[i] !== '') return current[i];
    }
    return '';
  };

  for (const line of lines) {
    fenceState = updateFenceStateForLine(fenceState, line);

    if (fenceState.inFenced) {
      if (pendingBlankLines > 0) {
        for (let i = 0; i < pendingBlankLines; i++) current.push('');
        pendingBlankLines = 0;
      }
      current.push(line);
      continue;
    }

    // 同行完整标签对（如 `<think>inline</think>`），无需进入 think 上下文，整行保留
    const trimmedLine = line.trim();
    if (!inThinkTag && THINK_INLINE_PAIR_RE.test(trimmedLine)) {
      // 空行 + 同行标签对：空行标志着段落边界，先提交前一个 block
      if (pendingBlankLines > 0 && current.length > 0) {
        blocks.push(current.join('\n'));
        current = [];
        pendingBlankLines = 0;
      } else if (pendingBlankLines > 0) {
        for (let i = 0; i < pendingBlankLines; i++) current.push('');
        pendingBlankLines = 0;
      }
      current.push(line);
      continue;
    }

    // 检测 think 开标签独占一行（如 `<think>`）
    if (!inThinkTag && THINK_OPEN_RE.test(trimmedLine)) {
      inThinkTag = true;
      // 空行 + think 开标签：空行标志着段落边界，先提交前一个 block
      if (pendingBlankLines > 0 && current.length > 0) {
        blocks.push(current.join('\n'));
        current = [];
        pendingBlankLines = 0;
      } else if (pendingBlankLines > 0) {
        for (let i = 0; i < pendingBlankLines; i++) current.push('');
        pendingBlankLines = 0;
      }
      current.push(line);
      continue;
    }

    // 同行开标签后紧跟内容（如 `<think>content`），闭标签在后续行 → 进入 think 上下文
    if (!inThinkTag && THINK_OPEN_INLINE_RE.test(trimmedLine)) {
      inThinkTag = true;
      // 空行 + think 开标签：空行标志着段落边界，先提交前一个 block
      if (pendingBlankLines > 0 && current.length > 0) {
        blocks.push(current.join('\n'));
        current = [];
        pendingBlankLines = 0;
      } else if (pendingBlankLines > 0) {
        for (let i = 0; i < pendingBlankLines; i++) current.push('');
        pendingBlankLines = 0;
      }
      current.push(line);
      continue;
    }

    // 在 think 上下文内，跳过空行切分，所有内容推入当前 block
    if (inThinkTag) {
      // 检测闭标签：独占一行 或 行内包含闭标签
      if (THINK_CLOSE_RE.test(trimmedLine) || THINK_CLOSE_INLINE_RE.test(trimmedLine)) {
        inThinkTag = false;
      }
      // 提交之前 pending 的空行
      if (pendingBlankLines > 0) {
        for (let i = 0; i < pendingBlankLines; i++) current.push('');
        pendingBlankLines = 0;
      }
      current.push(line);
      continue;
    }

    if (line === '') {
      if (current.length > 0) {
        pendingBlankLines++;
      }
      continue;
    }

    if (pendingBlankLines > 0) {
      const nextIsListItem = LIST_ITEM_PATTERN.test(line);
      const nextIsBlockquote = BLOCKQUOTE_PATTERN.test(line);
      const nextIsContinuation =
        (inList && (nextIsListItem || /^\s+\S/.test(line))) ||
        (inBlockquote && nextIsBlockquote);

      const prevIsHtmlComment = HTML_COMMENT_PATTERN.test(lastNonEmptyLine());
      const nextIsFootnoteDef = FOOTNOTE_DEF_PATTERN.test(line);

      // GFM 中空行终止表格，所以两张相邻表格必须切成两块——若仍合并，
      // 后表格每次增长都会拖累前表格的 memo 命中
      if (
        current.length > 0 &&
        !nextIsContinuation &&
        !prevIsHtmlComment &&
        !nextIsFootnoteDef
      ) {
        blocks.push(current.join('\n'));
        current = [];
        inList = false;
        inBlockquote = false;
      } else {
        for (let i = 0; i < pendingBlankLines; i++) current.push('');
      }
      pendingBlankLines = 0;
    }

    inList = LIST_ITEM_PATTERN.test(line) || (inList && /^\s+\S/.test(line));
    inBlockquote = BLOCKQUOTE_PATTERN.test(line);

    // AI 流式输出常见「标题 → 表格」无空行；表格单独成块避免末块 reparse 连带标题闪烁
    if (
      current.length > 0 &&
      isGfmTableLine(line) &&
      !isGfmTableLine(lastNonEmptyLine()) &&
      !HTML_COMMENT_PATTERN.test(lastNonEmptyLine())
    ) {
      blocks.push(current.join('\n'));
      current = [];
      inList = false;
      inBlockquote = false;
    }

    current.push(line);
  }
  if (current.length > 0) {
    blocks.push(current.join('\n'));
  }
  if (blocks.length === 0) {
    blocks.push('');
  }
  return blocks;
};

export interface UseMarkdownToReactOptions {
  remarkPlugins?: MarkdownRemarkPlugin[];
  rehypePlugins?: Plugin[];
  htmlConfig?: MarkdownToHtmlConfig;
  formula?: FormulaConfig;
  components?: Record<string, React.ComponentType<RendererBlockProps>>;
  prefixCls?: string;
  linkConfig?: {
    openInNewTab?: boolean;
    onClick?: (url?: string) => boolean | void;
  };
  fncProps?: MarkdownEditorProps['fncProps'];
  streaming?: boolean;
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
