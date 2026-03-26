import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      marginBottom: '0.75em',
      cursor: 'default',
      userSelect: 'none',
      padding: '0.75rem 0',
      borderRadius: '1em',
      maxWidth: '800px',
      border: '1px solid #e8e8e8',
      backgroundColor: '#fff',
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

      '& [data-mermaid-container="true"]': {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        isolation: 'isolate',
        contain: 'layout style paint',
        overflow: 'hidden',
        transition:
          'opacity 0.3s ease, height 0.3s ease, min-height 0.3s ease, max-height 0.3s ease',
      },

      '& [data-mermaid-wrapper]': {
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        isolation: 'isolate',
        contain: 'layout style paint',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      },

      '& [data-mermaid-svg="true"]': {
        maxWidth: '100%',
        height: 'auto',
        overflow: 'hidden',
      },

      '&-error': {
        textAlign: 'center',
        color: 'rgba(239, 68, 68, 0.8)',
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
        color: '#6B7280',
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
            stroke: '#333',
            strokeWidth: '1px',
            fill: '#fff',
          },
        },
        '& text': {
          dominantBaseline: 'middle',
          textAnchor: 'middle',
        },
        '& .nodeLabel': {
          fontWeight: 500,
          fill: '#333 !important',
        },
        '& .edgeLabel': {
          fill: '#666 !important',
        },
        '& .flowchart-label': {
          fill: '#333 !important',
        },
        '& .label': {
          fill: '#333 !important',
        },
      },
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
