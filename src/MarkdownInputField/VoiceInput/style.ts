import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      height: '32px',
      minWidth: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      cursor: 'pointer',
      borderRadius: '8px',
      backdropFilter: 'blur(20px)',
      fontSize: '16px',
      gap: '4px',
      color: 'var(--color-gray-text-secondary)',
      '&:hover': {
        background: 'var(--color-gray-control-fill-hover)',
      },
      '&&-disabled': {
        cursor: 'not-allowed',
        opacity: 0.5,
      },
      '&&-recording': {
        background: 'rgba(0, 116, 255, 0.09)',
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('VoiceInputButton', (token) => {
    const componentToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [resetComponent(componentToken), genStyle(componentToken)];
  });
}
