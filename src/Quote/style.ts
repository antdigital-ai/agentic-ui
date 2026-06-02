import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genQuoteStyle: GenStyleFn<'Quote'> = (token) => {
  return {
    [token.componentCls]: {
      '&-container': {
        width: 'fit-content',
        minWidth: '150px',
        maxWidth: '560px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        gap: '8px',
        borderRadius: 'var(--radius-control-base)',
        cursor: 'pointer',
        font: 'var(--font-text-body-sm)',
      },

      '&-container:hover': {
        borderRadius: 'var(--radius-control-sm)',
        background: 'var(--color-gray-control-fill-hover)',
        boxShadow: 'var(--shadow-border-base)',
      },

      '&-container:hover &-close-button': {
        display: 'flex',
        alignItems: 'center',
      },

      '&-quote-icon': {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        color: 'var(--color-gray-text-secondary)',
      },

      '&-close-button': {
        fontSize: 14,
        color: 'var(--color-gray-text-default)',
        display: 'none',
      },

      '&-quoteDescription': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,

        color: 'var(--color-gray-text-default)',
        font: 'var(--font-text-body-sm)',
      },

      '&-popup': {
        position: 'absolute',
        bottom: 30,
        minWidth: '240px',
        maxWidth: '800px',
        borderRadius: 'var(--radius-card-base)',
        background: 'var(--color-gray-bg-page-light)',
        boxSizing: 'border-box',
        border: '1px solid var(--color-gray-border-light)',
        boxShadow: 'var(--shadow-popover-base)',

        display: 'none',
        flexDirection: 'column',
        gap: 4,
        zIndex: 1001,
        minHeight: 'auto',
        fontSize: '12px',
        fontWeight: 'normal',
        lineHeight: '20px',
        letterSpacing: 'normal',
        color: 'var(--color-gray-text-secondary)',
        padding: 4,

        // 伪元素填补 popup 与容器之间的空隙，防止鼠标移入时 hover 中断
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: '-10px',
          left: '0',
          right: '0',
          height: '10px',
          background: 'transparent',
          pointerEvents: 'auto',
        },
      },

      '&-container:hover &-popup': {
        display: 'flex',
      },

      '&-popup:hover': {
        display: 'flex',
      },

      '&-popup-content': {
        padding: '8px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: 70,
        overflowY: 'auto',
        lineHeight: '20px',
        boxSizing: 'border-box',
        letterSpacing: 'var(--letter-spacing-body-sm, normal)',
        borderRadius: 'var(--radius-card-base)',
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-border-base)',
      },

      '&-popup-header': {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        width: 'fit-content',
        maxWidth: '100%',
      },

      '&-popup-header:hover': {
        borderRadius: 'var(--radius-control-base)',
        background: 'var(--color-gray-control-fill-hover)',
      },

      '&-popup-title': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      '&-popup-range': {
        flex: 'none',
      },
    },
  };
};

const useGenStyle = genStyleHooks('Quote', genQuoteStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'quote');
  return { hashId };
}
