import type { ChatTokenType, GenerateStyle } from '../Hooks/useStyle';
import { useEditorStyleRegister } from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      boxSizing: 'border-box',
      maxWidth: '100%',
      lineHeight: 1.7,
      whiteSpace: 'normal',
      color: 'var(--color-gray-text-default)',
      font: 'var(--font-text-paragraph-lg)',
      letterSpacing: 'var(--letter-spacing-paragraph-lg, normal)',

      '*': {
        boxSizing: 'border-box',
      },

      // Headings
      h1: { fontSize: '2em', fontWeight: 600, margin: '0.67em 0' },
      h2: { fontSize: '1.5em', fontWeight: 600, margin: '0.75em 0' },
      h3: { fontSize: '1.25em', fontWeight: 600, margin: '0.83em 0' },
      h4: { fontSize: '1em', fontWeight: 600, margin: '1.12em 0' },
      h5: { fontSize: '0.83em', fontWeight: 600, margin: '1.5em 0' },
      h6: { fontSize: '0.75em', fontWeight: 600, margin: '1.67em 0' },

      // Paragraphs
      p: {
        margin: '0.5em 0',
        lineHeight: 1.7,
      },

      // Links
      a: {
        color: token.colorPrimary || 'var(--color-primary)',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
        },
      },

      // Lists
      'ul, ol': {
        paddingInlineStart: '2em',
        margin: '0.5em 0',
      },
      li: {
        margin: '0.25em 0',
      },

      // Blockquote
      blockquote: {
        margin: '0.5em 0',
        paddingInlineStart: '1em',
        borderInlineStart: `3px solid ${token.colorBorderSecondary || '#d9d9d9'}`,
        color: token.colorTextSecondary || '#666',
      },

      // Inline code
      'code:not(pre code)': {
        background: 'var(--color-gray-bg-default, rgba(0, 0, 0, 0.04))',
        borderRadius: 4,
        padding: '0.15em 0.4em',
        fontSize: '0.9em',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      },

      // Horizontal rule
      hr: {
        border: 'none',
        borderTop: `1px solid ${token.colorBorderSecondary || '#d9d9d9'}`,
        margin: '1em 0',
      },

      // Table
      table: {
        width: '100%',
        borderCollapse: 'collapse',
        margin: '0.5em 0',
        borderRadius: 'var(--agentic-ui-table-border-radius, 8px)',
        overflow: 'hidden',
        border: `1px solid var(--agentic-ui-table-border-color, #E7E9E8)`,
      },
      'th, td': {
        padding: 'var(--agentic-ui-table-cell-padding, 12px 16px)',
        textAlign: 'start',
        borderBottom: `1px solid var(--agentic-ui-table-border-color, #E7E9E8)`,
        borderInlineEnd: `1px solid var(--agentic-ui-table-border-color, #E7E9E8)`,
        minWidth: 'var(--agentic-ui-table-cell-min-width, 80px)',
      },
      th: {
        fontWeight: 600,
        background: 'var(--agentic-ui-table-header-bg, #f7f7f9)',
      },
      'tr:hover td': {
        background: 'var(--agentic-ui-table-hover-bg, rgba(0,0,0,0.04))',
      },

      // Images
      img: {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: 8,
      },

      // Strong & Emphasis
      strong: { fontWeight: 600 },
      em: { fontStyle: 'italic' },
      del: { textDecoration: 'line-through' },

      // Code block
      [`${token.componentCls}-code-block`]: {
        margin: '0.5em 0',
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${token.colorBorderSecondary || '#e8e8e8'}`,
        background: '#fafafa',
      },
      [`${token.componentCls}-code-block-header`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        background: '#f5f5f5',
        borderBottom: `1px solid ${token.colorBorderSecondary || '#e8e8e8'}`,
        fontSize: 12,
      },
      [`${token.componentCls}-code-block-language`]: {
        color: token.colorTextSecondary || '#666',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      },
      [`${token.componentCls}-code-block-copy`]: {
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: token.colorTextSecondary || '#666',
        fontSize: 14,
        padding: '2px 6px',
        borderRadius: 4,
        '&:hover': {
          background: 'rgba(0,0,0,0.06)',
        },
      },
      [`${token.componentCls}-code-block-content`]: {
        margin: 0,
        padding: '12px 16px',
        overflow: 'auto',
        fontSize: 13,
        lineHeight: 1.6,
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        '& code': {
          background: 'transparent',
          padding: 0,
          borderRadius: 0,
          fontSize: 'inherit',
          fontFamily: 'inherit',
        },
      },

      // Mermaid block
      [`${token.componentCls}-mermaid-block`]: {
        margin: '0.5em 0',
        padding: 16,
        textAlign: 'center' as const,
        '& svg': {
          maxWidth: '100%',
        },
      },

      // Chart block
      [`${token.componentCls}-chart-block`]: {
        margin: '0.5em 0',
        padding: 16,
      },

      // KaTeX
      '.katex-display': {
        margin: '0.5em 0',
        overflow: 'auto',
      },

      // Container (directive)
      '.markdown-container': {
        margin: '0.5em 0',
        padding: '12px 16px',
        borderRadius: 8,
        border: `1px solid ${token.colorBorderSecondary || '#e8e8e8'}`,
        background: 'rgba(0,0,0,0.02)',
      },
      '.markdown-container__title': {
        fontWeight: 600,
        marginBottom: 8,
      },
    },
  };
};

export const useMarkdownRendererStyle = (prefixCls: string) => {
  return useEditorStyleRegister('MarkdownRenderer', (token) => {
    return [
      genStyle({
        ...token,
        componentCls: `.${prefixCls}`,
      }),
    ];
  });
};
