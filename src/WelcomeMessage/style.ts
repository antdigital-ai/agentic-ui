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
      alignItems: 'center',
      gap: 4,

      [`${token.componentCls}-title`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        color: 'var(--color-gray-text-default)',
        font: 'var(--font-text-h2-base)',
        letterSpacing: 'var(--letter-spacing-h2-base, normal)',
      },

      [`${token.componentCls}-description`]: {
        color: 'var(--color-gray-text-default)',
        font: 'var(--font-text-body-lg)',
        letterSpacing: 'var(--letter-spacing-body-lg, normal)',
        textAlign: 'center',
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('welcome', (token) => {
    const welcomeToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(welcomeToken)];
  });
}
