import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../../hooks/useStyle';
const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      right: 0,
      top: 0,
      width: 300,
      padding: 16,
      paddingRight: 24,
      boxSizing: 'border-box',
      gap: 8,
      borderLeft: '1px solid rgba(0,0,0,0.04)',
      maxWidth: '300px',
      backgroundColor: '#fff',
      height: '100vh',
      '&-item': {
        padding: '12px',
        border: '1px solid rgba(0,0,0,0.04)',
        borderRadius: 8,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        '&:hover': {
          backgroundColor: '#f9f9f9',
        },
        '&-header': {
          display: 'flex',
          gap: 8,
          justifyContent: 'space-between',
          '&-title': {
            display: 'flex',
            gap: 8,
            flex: 1,
            alignItems: 'flex-end',
          },
          '&-name': {
            display: 'flex',
            gap: 4,
            alignItems: 'center',
          },
          '&-time': {
            color: '#bfbfbf',
            fontSize: '12px',
          },
          '&-action': {
            display: 'flex',
            gap: 8,
            '& &-item': {
              cursor: 'pointer',
              '&:hover': {
                color: token.colorPrimary,
              },
            },
          },
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
  return useEditorStyleRegister('editor-content-column', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
