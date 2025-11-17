import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}`]: {
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'auto',
      gap: 'var(--margin-2x)',
      maxHeight: '128px',
      height: 'max-content',
      marginRight: '40px',
      borderRadius: 'inherit',
      padding: 'var(--padding-3x)',
      flexWrap: 'wrap',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::-webkit-scrollbar': {
        width: 'var(--padding-1-5x)',
      },
      // 小屏幕模式下横向滑动
      '@media (max-width: 768px)': {
        flexWrap: 'nowrap',
        overflowX: 'auto',
        overflowY: 'hidden',
        maxHeight: 'none',
        marginRight: '0',
        padding: 'var(--padding-2x)',
        '&::-webkit-scrollbar': {
          height: 'var(--padding-1x)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'var(--color-gray-border-default)',
          borderRadius: 'var(--radius-base)',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
      },
      '&-close-icon': {
        width: 'var(--height-control-xs)',
        height: 'var(--height-control-xs)',
        fontSize: 'var(--font-size-lg)',
        position: 'absolute',
        top: 'var(--margin-3x)',
        right: 'var(--margin-3x)',
        color: 'var(--color-gray-text-light)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
      '&-item': {
        width: '168px',
        height: '48px',
        opacity: 1,
        borderRadius: 'var(--radius-card-base)',
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-control-base)',
        boxSizing: 'border-box',
        padding: 'var(--padding-1x)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
        gap: 'var(--margin-2x)',
        position: 'relative',
        // 小屏幕模式下固定宽度，防止收缩
        '@media (max-width: 768px)': {
          flexShrink: 0,
          minWidth: '168px',
        },
        '&:hover': {
          [`${token.componentCls}-item-close-icon`]: {
            display: 'flex',
          },
        },
        '&-file-icon': {
          width: '40px',
          height: '40px',
          minWidth: '40px',
          opacity: 1,
          '&-img': {
            width: '40px',
            height: '40px',
            opacity: 1,
            background: 'var(--color-gray-bg-card-white)',
            boxSizing: 'border-box',
            boxShadow: 'var(--shadow-control-base)',
            borderRadius: 'var(--radius-base)',
            border: 'none',
            overflow: 'hidden',
            img: {
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: 'inherit',
              transition: 'transform 0.3s',
            },
            '&:hover': {
              overflow: 'hidden',
              img: {
                transform: 'scale(1.1)',
                transition: 'transform 0.3s',
              },
            },
          },
          '>svg': {
            width: '40px',
            height: '40px',
          },
        },
        '&-file-info': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 'var(--margin-0-5x)',
          flex: 1,
          minWidth: 0,
        },
        '&-file-name': {
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          lineHeight: 'var(--line-height-xs)',
          fontFamily: token.fontFamily,
          '&-text': {
            font: 'var(--font-text-body-emphasized-sm)',
            letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
            color: 'var(--color-gray-text-default)',
            maxWidth: '112px',
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            display: '-webkit-box',
            '-webkit-line-clamp': '1',
            lineClamp: 1,
            '-webkit-box-orient': 'vertical',
            textOverflow: 'ellipsis',
          },
        },
        '&-file-size': {
          font: 'var(--font-text-body-sm)',
          letterSpacing: 'var(--letter-spacing-body-sm, normal)',
          color: 'var(--color-gray-text-light)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          '&-error': {
            color: 'var(--color-red-a10)',
          },
          '&-item:not(:last-child)': {
            lineHeight: '9px',
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            height: 12,
            '&:after': {
              content: '""',
              display: 'block',
              width: '1px',
              height: '12px',
              background: 'var(--color-gray-border-light)',
            },
          },
        },
        '&-close-icon': {
          width: 'var(--padding-4x)',
          height: 'var(--padding-4x)',
          backgroundColor: 'var(--color-gray-text-default)',
          fontSize: 'var(--font-size-sm)',
          position: 'absolute',
          top: 2,
          borderRadius: '50%',
          right: 2,
          color: 'var(--color-gray-contrast)',
          display: 'none',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          // 小屏幕模式下常驻展示
          '@media (max-width: 768px)': {
            display: 'flex',
          },
        },
        '&-uploading-icon': {
          width: '40px',
          height: '40px',
          fontSize: '40px',
          display: 'flex',
        },
        '&-error-icon': {
          width: '40px',
          height: '40px',
          fontSize: '40px',
          display: 'flex',
        },
      },
    },
    [`${token.componentCls}-container`]: {
      background: 'var(--color-gray-bg-page)',
      borderBottom: '1px solid rgba(0, 16, 64, 0.0627)',
      '&-empty': {
        border: 'none',
      },
    },
  };
};

/**
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('md-editor-attachment-file-list', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(proChatToken), genStyle(proChatToken)];
  });
}
