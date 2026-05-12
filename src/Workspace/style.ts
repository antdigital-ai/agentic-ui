import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genStyle: GenStyleFn<'Workspace'> = (token) => {
  return {
    [token.componentCls]: {
      height: '100%',
      borderRadius: 'var(--radius-modal-base)',
      background: 'var(--color-gray-bg-card-white)',
      border: '1px solid rgba(140, 171, 255, 0.12)',
      boxShadow: 'var(--shadow-card-base)',
      'svg.sofa-icons-icon > g': {
        clipPath: 'none!important',
      },

      // 纯净模式样式
      [`&${token.componentCls}-pure`]: {
        borderRadius: '0',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        height: '100%',
      },

      [`${token.componentCls}-header`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 'var(--margin-3x) var(--margin-4x)',
      },

      [`${token.componentCls}-title`]: {
        font: 'var(--font-text-h5-base)',
        color: 'var(--color-gray-text-default)',
        letterSpacing: 'var(--letter-spacing-h5-base, normal)',
      },
      [`${token.componentCls}-header-right`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 'var(--gap-2x, var(--margin-2x))',
        [`${token.componentCls}-close`]: {
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        },
      },

      [`${token.componentCls}-tabs`]: {
        margin: 'var(--margin-3x)',
      },

      // 分割线样式
      [`${token.componentCls}-segmented`]: {
        [`${token.antCls}-segmented-group`]: {
          height: '32px',
        },

        [`&${token.antCls}-segmented:not(.chaos-segmented) ${token.antCls}-segmented-item ${token.antCls}-segmented-item-label`]:
          {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },

        [`${token.antCls}-segmented-item`]: {
          [`&:has(${token.antCls}-segmented-item-label:empty)`]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto !important',
            height: '100%',
            width: '8px',
            padding: '4px 0',
            margin: '0 2px',
            cursor: 'default',
            pointerEvents: 'none',
            backgroundColor: 'transparent !important',

            [`${token.antCls}-segmented-item-label`]: {
              padding: '0',
              height: '100%',
              width: '1px',
              backgroundColor: 'var(--color-gray-border-light)',
            },

            '&:hover': {
              backgroundColor: 'transparent !important',
            },
          },
        },

        [`${token.antCls}-segmented-item-disabled`]: {
          [`&:has(${token.antCls}-segmented-item-label:empty)`]: {
            opacity: '1 !important',
          },
        },
      },

      [`${token.componentCls}-tab-item`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      },

      [`${token.componentCls}-tab-title`]: {
        fontSize: 'var(--font-size-base)',
        fontWeight: 500,
      },

      [`${token.componentCls}-tab-count`]: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '20px',
        height: '20px',
        padding: '4px 6px',
        marginLeft: '4px',
        color: 'var(--color-gray-text-secondary)',
        font: 'var(--font-text-number-xs)',
        letterSpacing: 'var(--letter-spacing-number-xs, normal)',
        backgroundColor: 'var(--color-gray-control-fill-active)',
        borderRadius: '200px',
        boxSizing: 'border-box',
        '--workspace-tab-count-digit-distance': '8px',
        '--workspace-tab-count-digit-blur': '2px',
        '--workspace-tab-count-digit-dur': '500ms',
        '--workspace-tab-count-digit-stagger': '70ms',
        '--workspace-tab-count-digit-ease': 'cubic-bezier(0.34, 1.45, 0.64, 1)',
      },

      [`${token.componentCls}-tab-count-digits`]: {
        display: 'inline-flex',
        alignItems: 'baseline',
      },

      [`${token.componentCls}-tab-count-digit`]: {
        display: 'inline-block',
        willChange: 'transform, opacity, filter',
      },

      [`${token.componentCls}-tab-count-digits--animating ${token.componentCls}-tab-count-digit`]:
        {
          animationName: `${token.componentCls}-tabCountDigitPopIn`,
          animationDuration: 'var(--workspace-tab-count-digit-dur)',
          animationTimingFunction: 'var(--workspace-tab-count-digit-ease)',
          animationFillMode: 'both',
        },

      [`@keyframes ${token.componentCls}-tabCountDigitPopIn`]: {
        '0%': {
          transform: 'translate(0, var(--workspace-tab-count-digit-distance))',
          opacity: 0,
          filter: 'blur(var(--workspace-tab-count-digit-blur))',
        },
        '100%': {
          transform: 'translate(0, 0)',
          opacity: 1,
          filter: 'blur(0)',
        },
      },

      '@media (prefers-reduced-motion: reduce)': {
        [`${token.componentCls}-tab-count-digit`]: {
          animation: 'none !important',
          animationDelay: '0ms !important',
        },
      },

      [`${token.componentCls}-content`]: {
        height: 'calc(100% - 95px)',
        padding: '0 12px 16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        borderRadius: 'var(--radius-card-base)',
      },
    },
  };
};

const useGenStyle = genStyleHooks('Workspace', genStyle);

export function useWorkspaceStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'Workspace');
  return { wrapSSR, hashId };
}
