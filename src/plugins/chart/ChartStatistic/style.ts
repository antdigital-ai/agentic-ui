import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
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
          alignItems: 'center',
          gap: '4px',
          flex: 1,
        },

        [`${token.componentCls}-title`]: {
          fontFamily: 'PingFang SC',
          fontSize: '13px',
          fontWeight: 500,
          color: '#2C3E5D',
          margin: 0,
        },

        [`${token.componentCls}-question-icon`]: {
          fontSize: '14px',
          color: '#B3B9C4',
          fontWeight: 500,
        },
      },

      [`${token.componentCls}-value`]: {
        fontFamily: 'Rubik',
        fontSize: '24px',
        fontWeight: 500,
        lineHeight: 1,
        color: '#2C3E5D',

        [`${token.componentCls}-value-prefix`]: {
          fontFamily: 'PingFang SC',
          fontSize: '13px',
          fontWeight: 'normal',
          color: '#2C3E5D',
          marginRight: '4px',
        },

        [`${token.componentCls}-value-suffix`]: {
          fontFamily: 'PingFang SC',
          fontSize: '13px',
          fontWeight: 'normal',
          color: '#2C3E5D',
          marginLeft: '4px',
        },
      },

      // Dark theme styles
      '&-dark': {
        [`${token.componentCls}-header`]: {
          [`${token.componentCls}-title`]: {
            color: 'rgba(255, 255, 255, 0.65)',
          },

          [`${token.componentCls}-question-icon`]: {
            color: 'rgba(255, 255, 255, 0.45)',

            '&:hover': {
              color: 'rgba(255, 255, 255, 0.65)',
            },
          },
        },

        [`${token.componentCls}-value`]: {
          color: '#fff',
          [`${token.componentCls}-value-prefix`]: {
            color: '#fff',
          },
          [`${token.componentCls}-value-suffix`]: {
            color: '#fff',
          },
        },
      },

      // Size variants
      '&-small': {
        [`${token.componentCls}-header`]: {
          [`${token.componentCls}-title`]: {
            fontSize: '12px',
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
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('Statistic', (token) => {
    const statisticToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(statisticToken), genStyle(statisticToken)];
  });
}
