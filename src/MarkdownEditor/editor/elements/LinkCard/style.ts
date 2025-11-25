import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      cursor: 'pointer',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      '&-container': {
        padding: 12,
        border: '1px solid #f0f0f0',
        borderRadius: '0.5em',
        margin: '8px 0',
        width: '100%',
        maxHeight: '120px',
        minHeight: 72,
        backgroundImage:
          'linear-gradient(rgb(249, 251, 255) 0%, rgb(243, 248, 255) 100%)',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: '#262626',
        justifyContent: 'space-between',
        '&-content': {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#262626',
          fontSize: 16,
          flex: 1,
          minWidth: 0,
          '& &-title': {
            overflow: 'ellipsis',
            textOverflow: 'ellipsis',
            textWrap: 'nowrap',
            textDecoration: 'none',
            display: 'block',
            color: '#262626',
          },
          '& &-description': {
            flex: 1,
            minWidth: 0,
            marginTop: 4,
            lineHeight: '24px',
            display: 'flex',
            fontSize: 12,
            color: 'rgba(0,0,0,0.45)',
            justifyContent: 'space-between',
          },
          '& &-collaborators': {
            flex: 1,
            minWidth: 0,
            display: 'flex',
            justifyContent: 'space-between',
          },
          '& &-updateTime': {
            color: 'rgba(0,0,0,0.45)',
            fontSize: 12,
          },
        },
        '& [data-icon-box]': {
          padding: '0 18px',
          color: '#6b7280',
          cursor: 'pointer',
          '&:hover': {
            color: '#1667ff',
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
  return useEditorStyleRegister('editor-content-link-card', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
