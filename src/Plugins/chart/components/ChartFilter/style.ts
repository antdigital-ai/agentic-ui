import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../../../../Hooks/useStyle';

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
  const [, hashId] = useGenStyle(prefixCls ?? 'ChartFilter');
  return { hashId };
}
