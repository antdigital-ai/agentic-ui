import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      textAlign: 'center',
      marginBottom: 24,

      '&-main': {
        fontSize: 30,
        fontWeight: 600,
        lineHeight: '38px',
        marginBottom: 8,
        color: 'var(--color-gray-text-default)',
      },

      '&-subtitle': {
        fontSize: 15,
        lineHeight: '24px',
        color: 'var(--color-gray-text-default)',
      },
    },
  };
};

/**
 * Title 组件样式
 * @param prefixCls
 * @returns
 */
export const useStyle = (prefixCls?: string) => {
  return useEditorStyleRegister('ChatBootTitle', (token) => {
    const titleToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(titleToken)];
  });
};
