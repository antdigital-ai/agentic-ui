import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}`]: {
      maxWidth: '100%',
      display: 'flex',
      minWidth: '0px',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      overflow: 'auto',
      gap: '8px',
      borderRadius: 'inherit',
      padding: 8,
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&-left': {
        flexDirection: 'row',
      },
      '&-right': {
        flexDirection: 'row-reverse',
      },
      '&-vertical': {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 4,
        maxWidth: 'calc(285px * 3 + 4px * 2)', // 3列：每列285px，间距4px
      },
      '&::-webkit-scrollbar': {
        width: 6,
      },
      '&-collapse-button': {
        width: '68px',
        height: '32px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '4px 8px',
        cursor: 'pointer',
        gap: 4,
        float: 'right',
        borderRadius: '18px',
        opacity: 1,
        boxSizing: 'border-box',
        color: 'var(--color-gray-a9)',
        fontSize: 'var(--font-size-base)',
        boxShadow: 'var(--shadow-control-base)',
        border: 'var(--color-gray-border-light)',

        '&:hover': {
          background: '#F7F8FA',
          transform: 'scale(1.05)',
        },
        '&-icon': {
          transform: 'rotate(-90deg)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          color: 'var(--color-gray-a9)',
          '&-collapse': {
            transform: 'rotate(90deg)',
          },
        },
      },
      [`${token.antCls}-image-mask`]: {
        borderRadius: 'var(--radius-card-base)',
      },
      img: {
        objectFit: 'cover',
      },
      '&-image': {
        opacity: 1,
        background: 'var(--color-gray-bg-card-white)',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-control-base)',
        borderRadius: 'var(--radius-card-base)',
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
      '&-video-row': {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        width: 'fit-content',
        '&-right': {
          alignSelf: 'flex-end',
        },
      },
      '&-video-thumb': {
        position: 'relative',
        cursor: 'pointer',
        opacity: 1,
        background: 'var(--color-gray-bg-card-white)',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-control-base)',
        borderRadius: 'var(--radius-card-base)',
        border: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
          boxShadow: 'var(--shadow-control-lg)',
          '& video': {
            transform: 'scale(1.05)',
          },
        },
        '& video': {
          transition: 'transform 0.3s',
        },
      },
      '&-video-play-overlay': {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.35)',
        borderRadius: 'inherit',
        pointerEvents: 'none',
        opacity: 0.9,
        '& svg': {
          width: 48,
          height: 48,
          color: '#fff',
        },
      },
      '&-image-list-view': {
        background: 'var(--color-gray-bg-tip)',
        padding: '4px',
        borderRadius: 'var(--radius-card-base)',
      },
      '&-more-file-container': {
        width: '285px',
        height: '56px',
        borderRadius: 'var(--radius-card-base)',
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-control-base)',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        justifyContent: 'center',
        '&:hover': {
          boxShadow: 'var(--shadow-control-lg)',
        },
      },
      '&-more-file-icon': {
        width: '16px',
        height: '16px',
      },
      '&-more-file-name': {
        font: 'var(--font-size-h6)',
        color: 'var(--color-gray-text-secondary)',
      },
      '&-item': {
        width: '285px',
        height: '56px',
        borderRadius: 'var(--radius-card-base)',
        opacity: 1,
        background: 'var(--color-gray-bg-card-white)',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-control-base)',
        padding: '8px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
        gap: '4px',
        position: 'relative',
        '&:hover': {
          boxShadow: 'var(--shadow-control-lg)',
        },
        '&-action-bar': {
          position: 'absolute',
          right: 8,
          top: 8,
          display: 'flex',
          gap: 2,
        },
        '&-action-btn': {
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: 'var(--radius-control-base)',
          background: 'var(--color-gray-control-fill-secondary)',
          backdropFilter: 'blur(40px)',
          cursor: 'pointer',

          '&:hover': {
            background: 'var(--color-gray-a4)',
          },
        },
        '&-more-custom': {
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        },
        '&-file-icon': {
          width: '40px',
          height: '40px',
          opacity: 1,
          overflow: 'hidden',
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
          '> svg': {
            width: '40px',
            height: '40px',
          },
        },
        '&-file-info': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2,
        },
        '&-file-name': {
          color: 'var(--color-gray-text-default)',
          fontSize: 'var(--font-text-h6-base)',
          width: '150px',
          alignItems: 'center',
          lineHeight: '18px',
          fontFamily: token.fontFamily,
          gap: -1,
          display: 'flex',
          overflow: 'hidden',
          '&-text': {
            maxWidth: '150px',
            whiteSpace: 'nowrap !important',
            wordWrap: 'normal',
            wordBreak: 'keep-all',
            width: '100%',
            overflow: 'hidden',
            display: 'inline-block',
            textOverflow: 'ellipsis',
            height: 18,
            lineHeight: 1,
            verticalAlign: 'top',
          },
        },
        '&-file-name-extension-container': {
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          color: 'var(--color-gray-text-light)',
          fontSize: '12px',
        },
        '&-separator': {
          margin: '0 4px',
        },
        '&-file-size': {
          color: 'var(--color-gray-text-light)',
          fontSize: '12px',
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
  return useEditorStyleRegister('md-md-editor-file-view', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(proChatToken), genStyle(proChatToken)];
  });
}
