import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

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
      [`${token.componentCls}-file-list`]: {
        '&-item': {
          width: '178px',
          height: '56px',
          borderRadius: '12px',
          opacity: 1,
          background: '#FFFFFF',
          boxSizing: 'border-box',
          border: '1px solid #E6ECF4',
          padding: '8px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          cursor: 'pointer',
          gap: '8px',
          position: 'relative',
          '&-file-icon': {
            width: '40px',
            height: '40px',
          },
          '&-file-info': {
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            '&-file-name': {
              display: 'flex',
              width: '112px',
              '&-text': {
                maxWidth: '98px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                WebkitLineClamp: 1,
                height: 22,
                WebkitBoxOrient: 'vertical',
              },
              '&-extension': {
                color: 'rgba(0, 0, 0, 0.45)',
              },
            },
            '&-file-size': {
              color: '#B0B7C3',
              fontSize: '12px',
            },
          },
          '&-close-icon': {
            width: '16px',
            height: '16px',
            opacity: 1,
            background: '#353E5C',
            fontSize: 12,
            position: 'absolute',
            top: 2,
            borderRadius: '50%',
            right: 2,
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '&:hover': {
              color: token.colorPrimary,
            },
          },
        },
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
