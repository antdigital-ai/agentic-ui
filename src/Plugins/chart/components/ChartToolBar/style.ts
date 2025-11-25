import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '12px',

      [`${token.componentCls}-header-title`]: {
        fontFamily: 'PingFang SC',
        fontSize: '15px',
        fontWeight: 600,
        lineHeight: '24px',
        letterSpacing: '0em',
        fontVariationSettings: '"opsz" auto',
        color: '#343a45',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginRight: '16px',
        minWidth: 0, // 确保 flex 项可以缩小到小于内容宽度
        display: 'flex',
        alignItems: 'center',
      },

      [`${token.componentCls}-header-actions`]: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',

        [`${token.componentCls}-time-icon`]: {
          fontSize: '14px',
          color: '#00183d',
          marginRight: '2px',
        },

        [`${token.componentCls}-data-time`]: {
          fontFamily: 'PingFang SC',
          fontSize: '12px',
          fontWeight: 'normal',
          lineHeight: '20px',
          letterSpacing: '0em',
          fontVariationSettings: '"opsz" auto',
          /* gray/gray-文本-浅色注释 */
          /* 样式描述：--gray-a9 */
          color: 'rgba(0, 25, 61, 0.3255)',
          marginRight: '8px',
        },

        [`${token.componentCls}-download-btn`]: {
          color: 'rgba(0, 25, 61, 0.3255)',
          padding: '3px',
          height: 'auto',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '6px',
          transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',

          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },

          '&:focus': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            outline: 'none',
          },
        },
      },

      // Dark theme styles
      '&-dark': {
        [`${token.componentCls}-header-title`]: {
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },

        [`${token.componentCls}-header-actions`]: {
          [`${token.componentCls}-time-icon`]: {
            color: '#fff',
          },

          [`${token.componentCls}-data-time`]: {
            color: 'rgba(255, 255, 255, 0.65)',
          },

          [`${token.componentCls}-download-btn`]: {
            color: 'rgba(255, 255, 255, 0.65)',
            backgroundColor: 'transparent',

            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },

            '&:focus': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              outline: 'none',
            },
          },
        },
      },
    },
  };
};

/**
 * ChartToolBar Style
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('ChartToolBar', (token) => {
    const chartToolBarToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(chartToolBarToken), genStyle(chartToolBarToken)];
  });
}
