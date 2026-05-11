import { genStyleHooks, resetComponent, type GenStyleFn } from '../../../Hooks/useStyle';

const genStyle: GenStyleFn<'ChartStatistic'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: '160px',

      [`${token.componentCls}-header`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',

        [`${token.componentCls}-header-left`]: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '2px',
          flex: 1,
        },

        [`${token.componentCls}-header-row`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        },

        [`${token.componentCls}-title`]: {
          fontFamily: 'PingFang SC',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--color-gray-text-default)',
          margin: 0,
        },

        [`${token.componentCls}-subtitle`]: {
          fontFamily: 'PingFang SC',
          fontSize: '12px',
          fontWeight: 400,
          color: 'var(--color-gray-text-light)',
          margin: 0,
          lineHeight: 1.4,
        },

        [`${token.componentCls}-question-icon`]: {
          fontSize: '14px',
          color: 'var(--color-gray-text-secondary)',
          fontWeight: 500,
        },
      },

      [`${token.componentCls}-value`]: {
        fontFamily: 'Rubik',
        fontSize: '24px',
        fontWeight: 500,
        lineHeight: 1,
        color: 'var(--color-gray-text-default)',

        [`${token.componentCls}-value-prefix`]: {
          fontFamily: 'PingFang SC',
          fontSize: '13px',
          fontWeight: 'normal',
          color: 'var(--color-gray-text-default)',
          marginRight: '4px',
        },

        [`${token.componentCls}-value-suffix`]: {
          fontFamily: 'PingFang SC',
          fontSize: '13px',
          fontWeight: 'normal',
          color: 'var(--color-gray-text-default)',
          marginLeft: '4px',
        },
      },

      // Dark theme styles
      '&-dark': {
        [`${token.componentCls}-header`]: {
          [`${token.componentCls}-title`]: {
            color: 'rgba(255, 255, 255, 0.65)',
          },

          [`${token.componentCls}-subtitle`]: {
            color: 'rgba(255, 255, 255, 0.45)',
          },

          [`${token.componentCls}-question-icon`]: {
            color: 'rgba(255, 255, 255, 0.45)',

            '&:hover': {
              color: 'rgba(255, 255, 255, 0.65)',
            },
          },
        },

        [`${token.componentCls}-value`]: {
          color: 'var(--color-gray-bg-card-white)',
          [`${token.componentCls}-value-prefix`]: {
            color: 'var(--color-gray-bg-card-white)',
          },
          [`${token.componentCls}-value-suffix`]: {
            color: 'var(--color-gray-bg-card-white)',
          },
        },
      },

      // Size variants
      '&-small': {
        [`${token.componentCls}-header`]: {
          [`${token.componentCls}-title`]: {
            fontSize: '12px',
          },

          [`${token.componentCls}-subtitle`]: {
            fontSize: '11px',
          },

          [`${token.componentCls}-question-icon`]: {
            fontSize: '14px',
          },
        },

        [`${token.componentCls}-value`]: {
          fontSize: '20px',
        },
      },

      '&-large': {
        gap: '12px',

        [`${token.componentCls}-header`]: {
          [`${token.componentCls}-title`]: {
            fontSize: '13px',
          },

          [`${token.componentCls}-subtitle`]: {
            fontSize: '13px',
          },

          [`${token.componentCls}-question-icon`]: {
            fontSize: '14px',
          },
        },

        [`${token.componentCls}-value`]: {
          fontSize: '30px',
        },
      },

      // Block mode - 占满整个区域，多个时平分父容器，左对齐
      '&-block': {
        flex: 1,
        minWidth: 0,
        textAlign: 'left',

        [`${token.componentCls}-header`]: {
          justifyContent: 'flex-start',
        },

        [`${token.componentCls}-value`]: {
          textAlign: 'left',
        },
      },
    },
  };
};

/**
 * Statistic Style
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('ChartStatistic', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'Statistic');
  return { wrapSSR, hashId };
}
