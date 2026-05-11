import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

/** 根容器内边距（与 ant-agentic-plugin-mermaid 设计一致） */
const MERMAID_ROOT_PADDING_PX = 8;

/** 左上角工具栏占位，避免与流程图节点重叠 */
const MERMAID_TOOLBAR_RESERVE_INLINE = 72;

const genStyle: GenStyleFn<'Mermaid'> = (token) => {
  return {
    [token.componentCls]: {
      marginBottom: '0.75em',
      cursor: 'default',
      userSelect: 'none',
      padding: MERMAID_ROOT_PADDING_PX,
      borderRadius: '1em',
      maxWidth: '800px',
      border: `1px solid ${token.colorBorder}`,
      backgroundColor: token.colorBgContainer,
      minWidth: '240px',
      minHeight: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'stretch',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      transition: 'height 0.3s ease, min-height 0.3s ease',

      '&-toolbar-float': {
        position: 'absolute',
        top: MERMAID_ROOT_PADDING_PX,
        insetInlineStart: MERMAID_ROOT_PADDING_PX,
        insetInlineEnd: 'auto',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: token.paddingXXS,
        pointerEvents: 'auto',
      },

      /**
       * 不用 flex:1 撑满父级，避免矮图下方大块留白；
       * 内边距为工具栏与四周安全区，内容 flex 居中。
       */
      '&-viewport': {
        width: '100%',
        minHeight: 120,
        boxSizing: 'border-box',
        paddingBlock: token.paddingLG,
        paddingInlineStart: token.paddingLG + MERMAID_TOOLBAR_RESERVE_INLINE,
        paddingInlineEnd: token.paddingLG,
        overflow: 'auto',
        position: 'relative',
        touchAction: 'auto',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },

      '& [data-mermaid-container="true"]': {
        zIndex: 0,
        width: '100%',
        maxWidth: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'visible',
        transition:
          'opacity 0.3s ease, height 0.3s ease, min-height 0.3s ease, max-height 0.3s ease',
      },

      /**
       * 须为确定宽度，子 SVG 的 width:100% 才能按 viewBox 算出高度；
       * 使用 max-content 时百分比参照异常，易出现「有 DOM 但看不见」。
       */
      '& [data-mermaid-wrapper]': {
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'visible',
        display: 'block',
        minHeight: 0,
        marginInline: 'auto',
      },

      '& [data-mermaid-svg="true"]': {
        display: 'block',
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
        overflow: 'visible',
      },

      '&-error': {
        textAlign: 'center',
        color: token.colorError,
        padding: '0.5rem',
        flex: 1,
        position: 'relative',
        zIndex: 1,
        wordBreak: 'break-word',
        maxWidth: '100%',
        height: '100%',
        width: '100%',
        animation: 'agenticMermaidFadeIn 0.3s ease',
      },

      '&-empty': {
        textAlign: 'left',
        color: token.colorTextSecondary,
        padding: '0.75rem 1.5rem',
        position: 'relative',
        zIndex: 1,
        flex: 1,
        height: '100%',
        width: '100%',
        fontFamily:
          "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
        fontSize: '0.875em',
        lineHeight: 1.7,
        animation: 'agenticMermaidFadeIn 0.3s ease',
      },

      '@keyframes agenticMermaidFadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },

      '& svg': {
        '& foreignObject': {
          overflow: 'visible',
        },
        '& foreignObject div': {
          overflow: 'visible',
        },
        '& .node': {
          '& rect, & circle, & ellipse, & polygon': {
            stroke: token.colorBorder,
            strokeWidth: '1px',
            fill: token.colorBgContainer,
          },
        },
        /**
         * 勿改 text-anchor / dominant-baseline：Mermaid 11 用 y、tspan 定位，
         * 全局 middle 会把流程图标签挪出框外，看起来像空白。
         */
        '& text': {
          fill: `${token.colorText} !important`,
        },
        '& tspan': {
          fill: `${token.colorText} !important`,
        },
        '& .nodeLabel': {
          fontWeight: 500,
          fill: `${token.colorText} !important`,
        },
        '& .edgeLabel': {
          fill: `${token.colorTextSecondary} !important`,
        },
        '& .flowchart-label': {
          fill: `${token.colorText} !important`,
        },
        '& .label': {
          fill: `${token.colorText} !important`,
        },
      },
    },
  };
};

const useGenStyle = genStyleHooks('Mermaid', genStyle);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'agentic-plugin-mermaid');
  return { wrapSSR, hashId };
}
