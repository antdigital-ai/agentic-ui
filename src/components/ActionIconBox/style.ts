import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      minWidth: 28,
      minHeight: 28,
      lineHeight: 1,
      display: 'flex',
      cursor: 'pointer',
      boxSizing: 'border-box',
      padding: 4,
      alignItems: 'center',
      gap: 8,
      justifyContent: 'center',
      borderRadius: 'var(--radius-control-sm)',
      fontSize: '1em',
      color: 'var(--color-gray-text-secondary)',
      transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&-title': {
        font: 'var(--font-text-body-base)',
        letterSpacing: 'var(--letter-spacing-body-base, normal)',
        color: 'var(--color-gray-text-default)',
      },
      '&-light': {
        '&:hover': {
          borderRadius: 'var(--radius-control-base)',
          background: 'var(--color-gray-control-fill-hover)',
          backdropFilter: 'blur(20px)',
          boxSizing: 'border-box',
        },
      },
      '&-dark': {
        color: '#fff',
        '&:hover': {
          background: '#444',
          boxSizing: 'border-box',
        },
      },
      '&-active': {
        color: 'var(--color-gray-a9)',
      },
      '&-noPadding': {
        padding: 0,
      },

      '&-standalone': {
        minWidth: 'inherit',
        minHeight: 'inherit',
        maxHeight: 'inherit',
        padding: '8px 12px',
        color: '#000000',
        borderRadius: 18,
        border: '1px solid var(--color-gray-border-light)',
        background: `radial-gradient(22% 66% at 96% 113%, rgba(255, 255, 245, 0.52) 0%, rgba(230, 238, 255, 0) 100%),radial-gradient(14% 234% at 100% 50%, rgba(162, 255, 255, 0.28) 0%, rgba(153, 202, 255, 0.1193) 13%, rgba(229, 189, 255, 0.0826) 38%, rgba(231, 211, 252, 0.0544) 59%, rgba(235, 255, 245, 0) 100%)`,
      },
      '&-danger': {
        '&:hover': {
          color: token.colorError,
          background: token.colorErrorBgHover,
        },
      },
      '&-primary': {
        '&:hover': {
          color: token.colorPrimary,
          background: token.colorPrimaryBgHover,
        },
      },
      '&-border-less': {
        height: 'auto',
        lineHeight: 1,
        background: 'none!important',
        '&:hover': {
          color: token.colorPrimary,
          background: 'none!important',
        },
      },
      '&-transform': {
        '&:hover': {
          color: token.colorPrimary,
          transform: 'translateX(8px) scale(1.1)',
          background: 'none',
        },
      },
    },
  };
};

/**
 * Probubble
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls: string) {
  return useEditorStyleRegister('ActionIconBox', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(proChatToken)];
  });
}
