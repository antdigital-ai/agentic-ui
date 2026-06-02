import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genStyle: GenStyleFn<'ChatBootButtonTab'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '8px 20px',
      borderRadius: '200px',
      boxShadow: 'var(--shadow-border-base)',
      border: 'none',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '32px',
      height: '32px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: 'var(--color-gray-bg-card-white)',
      color: 'var(--color-gray-text-secondary)',
      outline: 'none',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      flexShrink: 0,

      // P1-4：删除遗留的注释式占位 hover 块；'&:active' / '&:focus-visible' 仍然有效保留
      '&:active': {
        transform: 'scale(0.98)',
      },

      '&:focus-visible': {
        boxShadow: 'var(--shadow-border-base)',
      },

      '&-selected': {
        backgroundColor: 'var(--color-gray-control-fill-primary)',
        color: 'var(--color-gray-contrast)',

        [`${token.componentCls}-icon`]: {
          borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
        },
      },

      // P0-3 配套：disabled 视觉态（避免只在 group 上加 .item-disabled，单用 ButtonTab 也能呈现）
      '&-disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },

      '&-icon': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        lineHeight: 1,
        marginLeft: '6px',
        paddingLeft: '8px',
        borderLeft: '1px solid var(--color-gray-border-light)',

        '&-clickable': {
          cursor: 'pointer',

          '&:hover': {
            opacity: 0.7,
          },

          '&:active': {
            opacity: 0.9,
          },
        },
      },

      '&-text': {
        display: 'inline-flex',
        alignItems: 'center',
      },
    },
  };
};

const useGenStyle = genStyleHooks('ChatBootButtonTab', genStyle);

/**
 * ButtonTab 组件样式
 */
export const useStyle = (prefixCls?: string) => {
  const [, hashId] = useGenStyle(prefixCls ?? 'ChatBootButtonTab');
  return { hashId };
};
