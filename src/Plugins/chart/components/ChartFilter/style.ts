import { genStyleHooks, resetComponent, type GenStyleFn } from '../../../../Hooks/useStyle';

const genStyle: GenStyleFn<'ChartFilter'> = (token) => {
  return {
    [token.componentCls]: {
      padding: '12px 0',
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexWrap: 'wrap',

      [`${token.componentCls}-region-filter`]: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',

        [`${token.componentCls}-region-dropdown-btn`]: {
          border: '1px solid var(--color-gray-border-light)',
          borderRadius: '6px',
          backgroundColor: 'var(--color-gray-bg-card-white)',
          color: 'var(--color-gray-text-secondary)',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '80px',
          justifyContent: 'space-between',
          height: '32px',
          padding: '0 12px',

          '&:hover': {
            borderColor: 'var(--color-gray-text-light)',
            color: 'var(--color-gray-text-default)',
            backgroundColor: 'var(--color-gray-bg-page-light)',

            [`${token.componentCls}-dropdown-icon`]: {
              color: 'var(--color-gray-text-light)',
            },
          },

          [`${token.componentCls}-dropdown-icon`]: {
            fontSize: '12px',
            color: 'var(--color-gray-text-secondary)',
          },
        },
      },

      [`${token.componentCls}-segmented-filter`]: {
        backgroundColor: 'var(--color-gray-control-fill-hover)',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '8px',

        '&.custom-segmented': {
          '.ant-segmented-item': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '.ant-segmented-item-label': {
              fontFamily: 'PingFang SC',
              fontSize: '13px',
              fontWeight: 'normal',
              lineHeight: '22px',
              letterSpacing: '0em',
            },
          },
          '.ant-segmented-group': {
            height: '30px',
          },
          '.ant-segmented-item-selected': {
            borderRadius: '8px',
            backgroundColor: 'var(--color-gray-bg-card-white) !important',
            border: '1px solid var(--color-gray-border-light) !important',
            boxShadow:
              '0px 0px 1px 0px rgba(0, 19, 41, 0.2), 0px 1.5px 4px -1px rgba(0, 19, 41, 0.04)',
            '.ant-segmented-item-label': {
              fontFamily: 'PingFang SC',
              fontSize: '13px',
              fontWeight: 600,
              lineHeight: '20px',
              letterSpacing: '0em',
              fontVariationSettings: '"opsz" auto',
              /* gray/gray-文本-默认 */
              /* 样式描述：--gray-a12 */
              color: 'var(--color-gray-text-default) !important',
            },
          },
        },
      },

      // Dark theme styles
      '&-dark': {
        [`${token.componentCls}-region-filter`]: {
          [`${token.componentCls}-region-dropdown-btn`]: {
            border: '1px solid var(--color-gray-border-dark)',
            backgroundColor: 'var(--color-gray-bg-page-dark)',
            color: 'rgba(255, 255, 255, 0.85)',

            '&:hover': {
              borderColor: 'var(--color-gray-text-light)',
              color: 'var(--color-gray-bg-card-white)',
              backgroundColor: 'var(--color-gray-bg-page-dark)',

              [`${token.componentCls}-dropdown-icon`]: {
                color: 'rgba(255, 255, 255, 0.8)',
              },
            },

            [`${token.componentCls}-dropdown-icon`]: {
              color: 'rgba(255, 255, 255, 0.65)',
            },
          },
        },

        [`${token.componentCls}-segmented-filter`]: {
          backgroundColor: 'var(--color-gray-bg-page-dark)',

          '&.custom-segmented': {
            '.ant-segmented-item': {
              '.ant-segmented-item-label': {
                color: 'rgba(255, 255, 255, 0.65)',
              },
            },
            '.ant-segmented-item-selected': {
              backgroundColor: 'var(--color-gray-bg-card-white) !important',
              border: '1px solid var(--color-gray-border-dark) !important',

              '.ant-segmented-item-label': {
                color: 'var(--color-gray-text-default) !important',
              },
            },
            '.ant-segmented-thumb': {
              backgroundColor: 'var(--color-gray-bg-page-dark) !important',
            },
          },
        },
      },

      // Compact variant for toolbar integration
      '&-compact': {
        padding: '0',
        flexWrap: 'nowrap',
      },
    },
  };
};

/**
 * ChartFilter Style
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('ChartFilter', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'ChartFilter');
  return { wrapSSR, hashId };
}
