import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      whiteSpace: 'pre-wrap',

      ['&-item']: {
        display: 'inline-block',
        whiteSpace: 'pre-wrap',
      },

      ['&-item-character']: {
        whiteSpace: 'pre-wrap',
      },

      ['&-item-line']: {
        display: 'block',
        whiteSpace: 'normal',
      },
    },
  };
};

export const useTextAnimateStyle = (prefixCls: string) => {
  return useEditorStyleRegister('text-animate', (token) => {
    const textAnimateToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(textAnimateToken)];
  });
};
