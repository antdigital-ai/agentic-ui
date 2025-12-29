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
      gap: '8px',
      padding: '0',

      '&-item-disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
  };
};

/**
 * ButtonTabGroup 组件样式
 */
export const useStyle = (prefixCls?: string) => {
  return useEditorStyleRegister('ChatBootButtonTabGroup', (token) => {
    const buttonTabGroupToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(buttonTabGroupToken)];
  });
};
