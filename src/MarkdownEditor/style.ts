import type { CSSInterpolation } from '@ant-design/cssinjs';
import { MOBILE_BREAKPOINT, MOBILE_PADDING } from '../Constants/mobile';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

// ── Table ──────────────────────────────────────────────────────────────────
const TABLE_BORDER = '1px solid var(--agentic-ui-table-border-color, #E7E9E8)';
const TABLE_RADIUS = 'var(--agentic-ui-table-border-radius, 8px)';
const TABLE_CELL = {
  verticalAlign: 'top' as const,
  padding: 'var(--agentic-ui-table-cell-padding, 16px 12px)',
  textAlign: 'left' as const,
  lineHeight: '24px',
  fontSize: '1em',
  minWidth: 'var(--agentic-ui-table-cell-min-width, 120px)',
  width: 'var(--agentic-ui-table-cell-min-width, 120px)',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  zIndex: 1,
  background: 'inherit',
};

const genTableStyle = (
  token: ChatTokenType,
  mobileBreakpoint: string,
  mobilePadding: string,
): Record<string, CSSInterpolation> => {
  const tableCls = `${token.componentCls}-content-table`;

  return {
    [tableCls]: {
      width: '100%',
      overflow: 'auto',
      flex: 1,
      minWidth: 0,
      position: 'relative',

      '&-container': {
        maxWidth: '100%',
        minWidth: 0,
        outline: 'none',
        position: 'relative',
        marginBottom: 12,
        [`&:hover ${tableCls}-readonly-table-actions`]: {
          opacity: 1,
          transform: 'translateX(50%)',
          top: -24,
        },
      },
      '&-editor-table': { marginTop: '1em' },
      '&-readonly-table-actions': {
        opacity: 0,
        position: 'absolute',
        top: 20,
        display: 'flex',
        gap: 8,
        right: '50%',
        zIndex: 1000,
        backgroundColor: 'var(--color-gray-bg-page-light)',
        borderRadius: 'var(--radius-control-base)',
        padding: '4px 8px',
        boxShadow: 'var(--shadow-control-base)',
        border: 'none',
        transform: 'translateX(50%)',
        transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
      },

      table: {
        borderCollapse: 'separate',
        borderSpacing: 0,
        width: 'max-content',
        tableLayout: 'fixed',
        margin: '16px 0',
        maxWidth: '100%',
        position: 'relative',
        fontVariant: 'tabular-nums',
        borderRadius: TABLE_RADIUS,
        border: TABLE_BORDER,

        // readonly：overflow: hidden，不影响编辑态 UI
        [`&${tableCls}-readonly-table`]: {
          width: '100%',
          tableLayout: 'auto',
          overflow: 'hidden',
          border: TABLE_BORDER,
        },

        th: {
          ...TABLE_CELL,
          backgroundColor: 'var(--agentic-ui-table-header-bg, #f7f7f9)',
          border: 'none',
          borderBottom: TABLE_BORDER,
          borderLeft: 'none',
          borderTop: 'none',
          fontWeight: 600,
        },
        'th:not(:first-child)': { borderLeft: TABLE_BORDER },

        td: {
          ...TABLE_CELL,
          borderBottom: TABLE_BORDER,
          borderLeft: TABLE_BORDER,
          'div[data-be="paragraph"]': { margin: 0, textWrap: 'auto' },
        },

        'td:first-child': { borderLeft: 'none' },
        'tr:last-child td': { borderBottom: 'none' },
        'tr td:first-child': { fontWeight: 600 },

        'tbody tr:hover': {
          background:
            'linear-gradient(var(--agentic-ui-table-hover-bg, rgba(0, 0, 0, 0.04)), var(--agentic-ui-table-hover-bg, rgba(0, 0, 0, 0.04))), linear-gradient(var(--agentic-ui-table-cell-bg, #ffffff), var(--agentic-ui-table-cell-bg, #ffffff))',
        },
        [`@media (max-width: ${mobileBreakpoint})`]: {
          'th, td': { padding: mobilePadding },
        },
      },
    },

    [`${token.componentCls}-table-td`]: {
      padding: '8px',
      verticalAlign: 'middle',
      wordWrap: 'break-word',
      wordBreak: 'break-all',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'pre-wrap',
      '&[data-select="true"]:after': {
        content: '" "',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        pointerEvents: 'none',
        backgroundColor: 'var(--color-primary-control-fill-secondary-hover)',
      },
      [`@media (max-width: ${mobileBreakpoint})`]: { padding: '2px' },
    },
    [`${token.componentCls}-table-row-index`]: { display: 'table-row' },
    [`${token.componentCls}-table-cell-index`]: {
      width: 12,
      maxWidth: 12,
      padding: 0,
      position: 'relative',
      verticalAlign: 'middle',
      backgroundColor: 'var(--color-gray-control-fill-secondary)',
      '&:hover': {
        backgroundColor: 'var(--color-gray-control-fill-secondary-hover)',
      },
    },
    [`${token.componentCls}-table-cell-index-spacer`]: {
      cursor: 'pointer',
      backgroundColor: 'var(--color-gray-control-fill-secondary)',
      '&:hover': {
        backgroundColor: 'var(--color-gray-control-fill-secondary-hover)',
      },
    },
  };
};

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      boxSizing: 'border-box',
      height: 'max-content',
      maxWidth: '100%',
      outline: 'none',
      tabSize: 4,
      position: 'relative',
      lineHeight: 1.7,
      whiteSpace: 'normal',
      // 主容器默认样式
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      font: 'var(--font-text-paragraph-lg)',
      letterSpacing: 'var(--letter-spacing-paragraph-lg, normal)',
      color: 'var(--color-gray-text-default)',
      // 全局样式
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: 'hsl(240 5.9% 90%) transparent',
        boxSizing: 'border-box',
      },
      'div[data-composition] div:not([data-no-focus]).empty:first-child::before':
        {
          display: 'none',
        },
      '> *': {
        boxSizing: 'border-box',
        scrollbarWidth: 'thin',
        fontVariantNumeric: 'tabular-nums',
        WebkitTextSizeAdjust: '100%',
        msTextSizeAdjust: '100%',
        WebkitFontSmoothing: 'antialiased',
        scrollbarColor: 'hsl(#e4e4e7) transparent',
      },
      '&-edit-area': {
        outline: 'none !important',
      },
      '&-toolbar-container': {
        width: '100%',
        maxWidth: '100%',
        position: 'sticky',
        zIndex: 99,
        top: 0,
      },
      '&-container': {
        // 默认 padding，可以通过 contentStyle 覆盖
        // 使用 CSS 变量，允许通过内联样式覆盖
        padding: 'var(--agentic-ui-content-padding, 4px 20px)',
        overflow: 'auto',
        display: 'flex',
        position: 'relative',
        gap: 24,
        outline: 'none',
        [`@media (max-width: ${MOBILE_BREAKPOINT})`]: {
          padding: 'var(--agentic-ui-content-padding, 4px 4px)',
        },
      },
      '&-content': {},
      '&-focus': {
        height: 64,
      },

      // ============================================================================
      // Elements Styles
      // ============================================================================

      // --- List ---
      [`${token.componentCls}-list`]: {
        listStyle: 'disc',
        marginBottom: '0',
        marginTop: '0',
        '&-container': {
          marginTop: '0.5em',
          marginBottom: '0.5em',
        },
        'div[data-be="paragraph"]': {
          display: 'block',
          marginBottom: '0 !important',
          marginTop: '0 !important',
          paddingTop: '0 !important',
          paddingBottom: '0 !important',
        },
        [`li:not(${token.componentCls}-list-task) > :first-child [data-drag-handle]`]:
          {
            paddingLeft: '2px',
            paddingRight: '12px',
            left: '-44px !important',
          },
        [`li${token.componentCls}-list-task > :nth-child(2) [data-drag-handle]`]:
          {
            paddingLeft: '2px',
            paddingRight: '10px',
            left: '-50px !important',
          },
        '&-check-item': {
          display: 'flex',
          alignItems: 'center',
          position: 'absolute',
          userSelect: 'none',
          height: '1.87em',
          left: '0',
          top: '0',
          zIndex: 10,
        },
        '&-item': {
          position: 'relative',
          wordBreak: 'break-all',
          gap: '4px',
          "> [data-be='list']": {
            marginBottom: '0',
          },
          [`&${token.componentCls}-list-task`]: {
            paddingLeft: '24px',
            display: 'flex',
            alignItems: 'center',
          },
        },
        '&.ol': {
          '&::marker': {
            color: 'var(--color-gray-text-light)',
          },
          [`&${token.componentCls}-list`]: {
            listStyle: 'decimal',
            [`& ol${token.componentCls}-list`]: {
              listStyle: 'lower-alpha',
              paddingLeft: 'var(--padding-4x)',
              [`& ol${token.componentCls}-list`]: {
                listStyle: 'lower-roman',
                [`& ol${token.componentCls}-list`]: {
                  listStyle: 'decimal',
                },
              },
            },
          },
        },
        '&.ul': {
          [`&${token.componentCls}-list`]: {
            listStyle: 'disc',
            [`& ul${token.componentCls}-list`]: {
              listStyle: 'circle',
              paddingLeft: 'var(--padding-4x)',
              [`& ul${token.componentCls}-list`]: {
                listStyle: 'square',
                [`& ul${token.componentCls}-list`]: {
                  listStyle: 'disc',
                },
              },
            },
          },
        },
        '&[data-task]': {
          listStyle: 'none !important',
          paddingLeft: '0',
        },
      },

      // --- LinkCard (BEM: block__element) ---
      [`${token.componentCls}-link-card`]: {
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      },
      [`${token.componentCls}-link-card__container`]: {
        padding: 12,
        border: '1px solid #f0f0f0',
        borderRadius: '0.5em',
        margin: '8px 0',
        width: '100%',
        maxHeight: '120px',
        minHeight: 72,
        backgroundImage:
          'linear-gradient(rgb(249, 251, 255) 0%, rgb(243, 248, 255) 100%)',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: '#262626',
        justifyContent: 'space-between',
        '& [data-icon-box]': {
          padding: '0 18px',
          color: '#6b7280',
          cursor: 'pointer',
          '&:hover': {
            color: '#1667ff',
          },
        },
      },
      [`${token.componentCls}-link-card__content`]: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: '#262626',
        fontSize: 16,
        flex: 1,
        minWidth: 0,
      },
      [`${token.componentCls}-link-card__title`]: {
        overflow: 'ellipsis',
        textOverflow: 'ellipsis',
        textWrap: 'nowrap',
        textDecoration: 'none',
        display: 'block',
        color: '#262626',
      },
      [`${token.componentCls}-link-card__description`]: {
        flex: 1,
        minWidth: 0,
        marginTop: 4,
        lineHeight: '24px',
        display: 'flex',
        fontSize: 12,
        color: 'rgba(0,0,0,0.45)',
        justifyContent: 'space-between',
      },
      [`${token.componentCls}-link-card__collaborators`]: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        justifyContent: 'space-between',
      },
      [`${token.componentCls}-link-card__update-time`]: {
        color: 'rgba(0,0,0,0.45)',
        fontSize: 12,
      },

      // --- TagPopup ---
      [`${token.componentCls}-tag-popup`]: {
        position: 'relative',
        cursor: 'pointer',
        padding: '0px 4px',
        margin: '0 2px',
        display: 'inline-flex',
        font: 'var(--font-text-body-base)',
        color: 'var(--color-primary-text-secondary)',
        borderRadius: 'var(--radius-control-sm)',
        background: 'var(--color-primary-bg-tip)',

        '[data-tag-popup-input]': {
          '&:not([data-composition]).empty::before': {
            color: 'var(--color-primary-text-disabled)',
            content: 'attr(title)',
            userSelect: 'none',
            position: 'absolute',
            left: '4px',
            top: 0,
          },
          '&:hover::before': {
            opacity: 0.6,
          },
          '&.empty::after': {
            content: 'attr(title)',
            opacity: 0,
            overflow: 'hidden',
            userSelect: 'none',
          },
        },
        '&-arrow': {
          position: 'absolute',
          right: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-primary-text-disabled)',
          transition: 'transform 0.2s ease',
          '&.open': {
            transform: 'translateY(-50%) rotate(180deg)',
          },
        },
        '&-has-arrow': {
          paddingRight: '12px',
        },
        '&-loading': {
          // 加载状态的样式可以在这里添加
        },
      },

      // --- Mermaid ---
      [`${token.componentCls}-mermaid`]: {
        // 基础容器样式
        height: '240px',
        minWidth: '300px',
        maxWidth: '800px',
        minHeight: '240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'stretch',
        zIndex: 5,
        color: 'rgb(27, 27, 27)',
        padding: '1em',
        margin: '1em 0',
        fontSize: '0.8em',
        lineHeight: '1.5',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        fontFamily: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
        wordWrap: 'break-word',
        borderRadius: '12px',
        background: '#FFFFFF',
        boxShadow: 'var(--shadow-control-base)',

        // SVG 渲染优化
        '& svg': {
          // 节点样式
          '& .node': {
            '& rect, & circle, & ellipse, & polygon': {
              stroke: '#333',
              strokeWidth: '1px',
              fill: '#fff',
            },
          },

          // 强制设置所有文字样式
          '& text': {
            // 确保文字不会被裁剪
            dominantBaseline: 'middle',
            textAnchor: 'middle',
          },

          // 节点标签 - 更大的字体
          '& .nodeLabel': {
            fontWeight: 500,
            fill: '#333 !important',
          },

          // 边标签 - 稍小一些但仍然清晰
          '& .edgeLabel': {
            fill: '#666 !important',
          },

          // 专门针对流程图的文字
          '& .flowchart-label': {
            fill: '#333 !important',
          },

          // 针对不同类型的标签
          '& .label': {
            fill: '#333 !important',
          },
        },

        // 错误状态样式
        '&-error': {
          color: '#d73a49',
          background: '#ffeaea',
          border: '1px solid #f97583',
          padding: '12px',
          borderRadius: '4px',
          textAlign: 'left',

          '& pre': {
            margin: '8px 0 0',
            background: '#f6f8fa',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
          },
        },
      },

      // --- Table（全部样式统一在 genTableStyle 中）---
      ...genTableStyle(token, MOBILE_BREAKPOINT, MOBILE_PADDING),
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('MarkdownEditor', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(editorToken), genStyle(editorToken)];
  });
}
