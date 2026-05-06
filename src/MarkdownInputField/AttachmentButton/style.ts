import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '2em',
      height: '2em',
      fontSize: '16px',
      padding: '0.5em',
      borderRadius: '8px',
      transition: 'background-color 0.3s ease',
      cursor: 'pointer',
      color: 'var(--color-gray-text-secondary)',
      gap: 4,
      '&:hover': {
        backgroundColor: 'var(--color-gray-control-fill-hover)',
      },
      [`${token.componentCls}-inner`]: {
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXXS,
      },
      [`${token.componentCls}-title`]: {
        font: 'var(--font-text-body-base)',
        letterSpacing: 'var(--letter-spacing-body-base, normal)',
        color: 'var(--color-gray-text-default)',
      },
      [`&${token.componentCls}-disabled`]: {
        cursor: 'not-allowed',
        opacity: token.opacityLoading,
      },
    },
  };
};

/**
 * Probubble
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('md-editor-attachment-button', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(proChatToken), genStyle(proChatToken)];
  });
}
