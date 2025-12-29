import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
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
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          backgroundColor: '#fff',
          color: '#666',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '80px',
          justifyContent: 'space-between',
          height: '32px',
          padding: '0 12px',

          '&:hover': {
            borderColor: '#8c8c8c',
            color: '#343a45',
            backgroundColor: '#f9f9f9',

            [`${token.componentCls}-dropdown-icon`]: {
              color: '#8c8c8c',
            },
          },

          [`${token.componentCls}-dropdown-icon`]: {
            fontSize: '12px',
            color: '#666',
          },
        },
      },

      [`${token.componentCls}-segmented-filter`]: {
        backgroundColor: '#f5f5f5',
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
            backgroundColor: '#fff !important',
            border: '1px solid #d9d9d9 !important',
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
              color: '#343a45 !important',
            },
          },
        },
      },

      // Dark theme styles
      '&-dark': {
        [`${token.componentCls}-region-filter`]: {
          [`${token.componentCls}-region-dropdown-btn`]: {
            border: '1px solid #434343',
            backgroundColor: '#1a1a1a',
            color: 'rgba(255, 255, 255, 0.85)',

            '&:hover': {
              borderColor: '#595959',
              color: '#fff',
              backgroundColor: '#262626',

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
          backgroundColor: '#262626',

          '&.custom-segmented': {
            '.ant-segmented-item': {
              '.ant-segmented-item-label': {
                color: 'rgba(255, 255, 255, 0.65)',
              },
            },
            '.ant-segmented-item-selected': {
              backgroundColor: '#fff !important',
              border: '1px solid #434343 !important',

              '.ant-segmented-item-label': {
                color: '#343a45 !important',
              },
            },
            '.ant-segmented-thumb': {
              backgroundColor: '#343a45 !important',
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
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('ChartFilter', (token) => {
    const chartFilterToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(chartFilterToken), genStyle(chartFilterToken)];
  });
}
