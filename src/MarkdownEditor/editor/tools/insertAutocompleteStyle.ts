import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      '&-item': {
        display: 'flex',
        alignItems: 'center',
        height: '24px',
        lineHeight: '24px',
        gap: '4px',
        padding: '4px',
        borderRadius: '12px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgb(209 213 219 / 0.4)',
        },
      },
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('InsertAutocomplete-' + prefixCls, (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(editorToken), genStyle(editorToken)];
  });
}
