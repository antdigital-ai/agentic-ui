import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      position: 'fixed',
      bottom: 48,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 32,
      height: 32,
      insetInlineEnd: 24,
      color: 'var(--color-gray-text-secondary)',
      fontSize: 16,
      background: 'var(--color-gray-bg-card-white)',
      border: 'none',
      boxShadow: 'var(--shadow-control-base)',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',

      ['&-content']: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      },

      ['&:hover']: {
        boxShadow: 'var(--shadow-control-lg)',
      },

      ['&:active']: {
        boxShadow: 'var(--shadow-control-base)',
        transform: 'scale(0.95)',
      },
    },
  };
};

export const prefixCls = 'back-to';

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('back-to', (token) => {
    const backToToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(backToToken)];
  });
}
