import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'inline-flex',
      flexDirection: 'column',
      padding: '3px 4px 3px 8px',
      color: 'var(--color-gray-text-default)',
      background: 'var(--color-gray-bg-card-white)',
      borderRadius: 'var(--radius-control-base)',
      boxShadow: 'var(--shadow-control-base)',

      '&-content': {
        display: 'flex',
        alignItems: 'center',
      },

      '&-icon': {
        width: 14,
        height: 14,
        fontSize: 14,
      },

      '&-message': {
        flex: 1,
        paddingLeft: 8,
        paddingRight: 8,
        font: 'var(--font-text-body-emphasized-base)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-base, normal)',
      },

      '&-description': {
        font: 'var(--font-text-paragraph-base)',
        letterSpacing: 'var(--letter-spacing-paragraph-base, normal)',
      },

      '&-close-icon': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        padding: 0,
        backgroundColor: 'transparent',
        color: 'var(--color-gray-text-disabled)',
        borderRadius: 'var(--radius-control-sm)',
        fontSize: 14,
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',

        '&:hover': {
          backgroundColor: 'var(--color-gray-control-fill-active)',
        },
      },
    },

    // ================== With description ================
    [`${token.componentCls}-with-description`]: {
      display: 'flex',
      padding: '12px',
      borderRadius: 'var(--radius-card-base)',

      [`${token.componentCls}-content`]: {
        marginBottom: 8,
      },

      [`${token.componentCls}-icon`]: {
        width: 18,
        height: 18,
        fontSize: 18,
      },

      [`${token.componentCls}-message`]: {
        font: 'var(--font-text-h5-base)',
        letterSpacing: 'var(--letter-spacing-h5-base, normal)',
      },
    },

    // ================== Types ==================

    [`${token.componentCls}-success`]: {
      color: 'var(--color-green-text-secondary)',
      backgroundColor: 'var(--color-green-bg-tip)',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'rgba(0, 176, 102, 0.81)',

        '&:hover': {
          backgroundColor: 'var(--color-green-control-fill-active)',
        },
      },
    },

    [`${token.componentCls}-warning`]: {
      color: 'var(--color-yellow-text-secondary)',
      backgroundColor: 'var(--color-yellow-bg-tip)',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'rgba(235, 159, 0, 1)',

        '&:hover': {
          backgroundColor: 'var(--color-yellow-control-fill-active)',
        },
      },
    },

    [`${token.componentCls}-error`]: {
      color: 'var(--color-red-text-secondary)',
      backgroundColor: 'var(--color-red-bg-tip)',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'rgba(212, 23, 1, 0.48)',

        '&:hover': {
          backgroundColor: 'var(--color-red-control-fill-active)',
        },
      },
    },

    [`${token.componentCls}-info`]: {
      color: 'var(--color-blue-text-secondary)',
      backgroundColor: 'var(--color-blue-bg-tip)',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'rgba(0, 101, 250, 0.55)',

        '&:hover': {
          backgroundColor: 'var(--color-blue-control-fill-active)',
        },
      },
    },

    [`${token.componentCls}-gray`]: {
      color: 'var(--color-gray-text-secondary)',
      backgroundColor: 'var(--color-gray-bg-tip)',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'rgba(80, 94, 119, 0.32)',

        '&:hover': {
          backgroundColor: 'var(--color-gray-control-fill-active)',
        },
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('answer-alert', (token) => {
    const answerAlertToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(answerAlertToken)];
  });
}
