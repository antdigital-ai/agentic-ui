import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
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

      '&:hover': {
        // borderColor: 'rgba(0, 0, 0, 0.3)',
        // color: 'rgba(0, 0, 0, 0.85)',
      },

      '&:active': {
        transform: 'scale(0.98)',
      },

      '&:focus-visible': {
        boxShadow: 'var(--shadow-border-base)',
      },

      '&-selected': {
        backgroundColor: 'var(--color-gray-control-fill-primary)',
        color: 'var(--color-gray-contrast)',

        '&:hover': {
          // backgroundColor: 'rgba(0, 0, 0, 0.85)',
          // borderColor: 'rgba(0, 0, 0, 0.85)',
        },

        [`${token.componentCls}-icon`]: {
          borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
        },
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

/**
 * ButtonTab 组件样式
 */
export const useStyle = (prefixCls?: string) => {
  return useEditorStyleRegister('ChatBootButtonTab', (token) => {
    const buttonTabToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(buttonTabToken)];
  });
};
