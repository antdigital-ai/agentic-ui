import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  const gridLightColor = 'rgba(0, 0, 0, 0.08)';
  const gridDarkColor = 'rgba(255, 255, 255, 0.14)';
  const controlBackgroundColor = token.colorBgElevated || token.colorBgContainer;
  const controlBorderColor = token.colorBorder;

  return {
    [token.componentCls]: {
      marginBottom: '0.75em',
      cursor: 'default',
      userSelect: 'none',
      padding: '0.75rem 0',
      borderRadius: '1em',
      maxWidth: '800px',
      border: `1px solid ${token.colorBorder}`,
      backgroundColor: token.colorBgContainer,
      minWidth: '240px',
      minHeight: '200px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      position: 'relative',
      isolation: 'isolate',
      contain: 'layout style paint',
      overflow: 'hidden',
      transition: 'height 0.3s ease, min-height 0.3s ease',

      '&-fullscreen': {
        width: '100%',
        maxWidth: '100%',
        height: '100%',
      },

      '&-toolbar': {
        display: 'flex',
        alignItems: 'center',
        gap: token.paddingXS,
        width: '100%',
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        borderBottom: `1px solid ${controlBorderColor}`,
        backgroundColor: controlBackgroundColor,
      },

      '&-toolbar-btn': {
        border: `1px solid ${controlBorderColor}`,
        background: token.colorBgContainer,
        color: token.colorText,
        borderRadius: token.borderRadius,
        padding: `0 ${token.paddingXS}px`,
        fontSize: token.fontSizeSM,
        lineHeight: `${token.controlHeightSM || 24}px`,
        height: token.controlHeightSM || 24,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          color: token.colorPrimary,
          borderColor: token.colorPrimary,
        },
      },

      '&-viewport': {
        width: '100%',
        minHeight: 220,
        overflow: 'hidden',
        position: 'relative',
        touchAction: 'none',
        cursor: 'grab',
      },
      '&-viewport[data-mermaid-panning="true"]': {
        cursor: 'grabbing',
      },
      '&-viewport[data-mermaid-grid="true"]': {
        backgroundSize: '28px 28px',
        backgroundImage: `radial-gradient(circle, ${gridLightColor} 1.2px, transparent 1.2px)`,
      },
      '&-viewport[data-mermaid-grid="true"]&-dark-grid': {
        backgroundImage: `radial-gradient(circle, ${gridDarkColor} 1.2px, transparent 1.2px)`,
      },

      '& [data-mermaid-container="true"]': {
        width: '100%',
        minHeight: 220,
        display: 'block',
        justifyContent: 'center',
        position: 'relative',
        isolation: 'isolate',
        contain: 'layout style paint',
        overflow: 'visible',
        transition:
          'opacity 0.3s ease, height 0.3s ease, min-height 0.3s ease, max-height 0.3s ease',
        '--mermaid-pan-x': '0px',
        '--mermaid-pan-y': '0px',
        '--mermaid-scale': 1,
      },

      '& [data-mermaid-wrapper]': {
        position: 'relative',
        width: 'max-content',
        maxWidth: 'none',
        overflow: 'visible',
        isolation: 'isolate',
        contain: 'layout style paint',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        minHeight: 0,
        transform: 'translate(var(--mermaid-pan-x), var(--mermaid-pan-y)) scale(var(--mermaid-scale))',
        transformOrigin: '0 0',
        willChange: 'transform',
      },

      '& [data-mermaid-svg="true"]': {
        maxWidth: '100%',
        height: 'auto',
        overflow: 'hidden',
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
        '& .node': {
          '& rect, & circle, & ellipse, & polygon': {
            stroke: token.colorBorder,
            strokeWidth: '1px',
            fill: token.colorBgContainer,
          },
        },
        '& text': {
          dominantBaseline: 'middle',
          textAnchor: 'middle',
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
    [`${token.componentCls}[data-mermaid-theme="dark"] ${token.componentCls}-viewport[data-mermaid-grid="true"]`]:
      {
        backgroundImage: `radial-gradient(circle, ${gridDarkColor} 1.2px, transparent 1.2px)`,
      },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('agentic-plugin-mermaid', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
