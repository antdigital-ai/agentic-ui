import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      flexFlow: 'wrap',
      '&-item': {
        display: 'inline-block',
        marginRight: '-8px',
        transition: 'all 0.3s',
      },
      '&:hover &-item': {
        display: 'inline-block',
        marginRight: '0px',
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
  return useEditorStyleRegister('editor-content-contributorAvatar', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
