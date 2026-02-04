import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      '*': {
        boxSizing: 'border-box',
      },
      '&-tool': {
        position: 'relative',
        cursor: 'pointer',
        borderRadius: '24px',
        background: 'var(--color-gray-bg-card-light)',
        boxSizing: 'border-box',
        border: 'var(--color-gray-border-light)',
        boxShadow: 'var(--shadow-border-base)',
        minHeight: '20px',
        backdropFilter: 'blur(8px)',
        width: 'max-content',
        transition: 'border-radius 0.4s ease',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 0,
        zIndex: 1,
        maxWidth: 'min(800px,100%)',
        padding: '2px',
        paddingRight: '4px',
        '&:hover': {
          background: 'var(--color-gray-control-fill-active)',
          boxSizing: 'border-box',
          boxShadow: 'var(--shadow-card-base)',
        },
        '&-active': {
          background: 'var(--color-gray-bg-card-white)',
          boxSizing: 'border-box',
          outline: '1px solid var(--color-primary-control-fill-border-active)',
          boxShadow: 'var(--shadow-control-base)',
        },
        '&-expanded': {
          borderRadius: '14px',
          gap: 8,
          outline: 'none',
          '&:hover': {
            background: 'var(--color-gray-bg-card-light)',
            boxShadow: 'var(--shadow-border-base)',
          },
        },
        '&-light': {
          boxShadow: 'none',
          border: 'none',
          borderRadius: '14px',
          padding: 4,
          width: 'fit-content',
          background: 'transparent',
          '&:hover': {
            background: 'none',
            boxShadow: 'none',
          },
        },
        '&-loading': {
          background: 'var(--color-gray-bg-card-white)',
          boxSizing: 'border-box',
          boxShadow:
            '0px 0px 1px 0px rgba(0, 19, 41, 0.05),0px 2px 7px 0px rgba(0, 19, 41, 0.05),0px 2px 5px -2px rgba(0, 19, 41, 0.06)',
          '&:hover': {
            background: 'var(--color-gray-bg-card-white)',
            boxSizing: 'border-box',
            boxShadow: 'var(--shadow-card-base)',
          },
          '&-light': {
            boxShadow: 'none',
            '&:hover': {
              background: 'var(--color-gray-bg-card-white)',
              boxShadow: 'none',
              boxSizing: 'border-box',
            },
          },
        },
      },

      '&-tool-bar': {
        borderRadius: '12px',
        minHeight: '20px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        zIndex: 1,
      },

      '&-tool-arrow': {
        color: 'rgba(0, 4, 15, 27%)',
        transition: 'transform 0.3s ease',
      },

      '&-tool-header': {
        height: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'space-between',
      },

      '&-tool-header-right': {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        marginRight: 4,
        '&-light': {
          flex: 'unset',
          width: 'max-content',
        },
      },

      '&-tool-expand': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        borderRadius: 'var(--radius-card-base)',
        color: 'var(--color-gray-text-disabled)',
        fontSize: 'var(--font-size-base)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        '&:hover': {
          color: '#959DA8',
        },
      },

      '&-tool-name': {
        font: 'var(--font-text-body-emphasized-sm)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
        color: 'var(--color-gray-text-secondary)',
        lineHeight: '20px',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
        lineClamp: 1,
        '&-loading': {
          position: 'relative',
          color: '#000',
        },
      },

      '&-tool-image-wrapper': {
        width: '24px',
        height: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px',
        gap: '0px 8px',
        flexWrap: 'wrap',
        alignContent: 'center',
        borderRadius: '200px',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-border-base)',
        background: 'var(--color-gray-bg-card-white)',
        zIndex: 0,
        '&-loading': {
          borderRadius: '50%',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            borderRadius: '50%',
            background:
              'conic-gradient(from var(--rotate, 0deg),transparent 0deg 0deg, #5EF050 35deg 55deg, #37ABFF 105deg 115deg,  #D7B9FF 135deg 135deg, transparent 165deg 360deg)',
            WebkitMask:
              'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0) 65%, #FF0000 100%)',
            mask: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0) 80%, #FF0000 80%, #FF0000 100%)',
          },
        },
      },

      '&-tool-image': {
        position: 'absolute',
        zIndex: 999,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        font: 'var(--font-text-body-emphasized-sm)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
        color: 'var(--color-gray-text-secondary)',
      },

      '&-tool-light': {
        '&-tool-image-wrapper': {
          boxShadow: 'none',
          background: 'transparent',
        },
        '&-tool-name': {
          color: 'var(--color-gray-text-light)',
        },
        '&-tool-target': {
          color: 'var(--color-gray-text-light)',
        },
        '&-tool-time': {
          background: 'transparent',
          color: 'var(--color-gray-text-light)',
        },
        '&-tool-expand': {
          color: 'var(--color-gray-text-light)',
          '&:hover': {
            background: 'rgba(20, 22, 28, 0.06)',
            color: 'var(--color-gray-text-secondary)',
          },
        },
      },

      '&-tool-target': {
        fontWeight: 'normal',
        lineHeight: '20px',
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
        lineClamp: 1,
        overflow: 'hidden',
        textWrap: 'nowrap ',
        font: 'var(--font-text-body-sm)',
        letterSpacing: 'var(--letter-spacing-body-sm, normal)',
        color: 'var(--color-gray-text-light)',
        '&-light': {
          marginRight: 0,
        },
        '&-loading': {
          position: 'relative',
          color: '#000',
        },
      },
      '&-tool-time-expand': {
        display: 'flex',
        alignItems: 'center',
      },
      '&-tool-time': {
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'normal',
        lineHeight: '12px',
        letterSpacing: '0.04em',
        height: '20px',
        minWidth: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '12px',
        background: 'var(--color-gray-control-fill-active)',
        padding: '4px 6px',
        color: '#767E8B',
        gap: '8px',
        zIndex: 1,
      },
      '&-tool-container': {
        display: 'flex',
        width: '100%',
        paddingInline: 4,
        paddingBottom: 4,
        '&-light': {
          borderLeft: '1px solid var(--color-gray-border-light)',
          paddingLeft: 12,
          marginLeft: 16,
          marginTop: -10,
        },
      },
      '&-tool-content': {
        flex: 1,
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'normal',
        lineHeight: '160%',
        letterSpacing: 'normal',
        color: '#767E8B',
      },
      '&-tool-content-error': {
        display: 'flex',
        width: '100%',
        borderRadius: 'var(--radius-control-base)',
        background: 'var(--color-yellow-bg-tip)',
        color: '#A56900',
        padding: '8px',
        fontSize: 'var(--font-size-base)',
        alignItems: 'center',
        gap: 8,
      },
      '&-tool-content-error-icon': {
        alignItems: 'center',
        font: 'var(--font-text-body-emphasized-base)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-base, normal)',
        color: 'var(--color-yellow-text-secondary)',
      },
      '&-tool-error': {
        '&-tool-image-wrapper': {
          '& .anticon': {
            color: '#F15B50',
          },
        },
      },
    },
  } as any;
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('tool-use-bar', (token) => {
    const toolBarToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(toolBarToken)];
  });
}
