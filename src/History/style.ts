import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}-load-more`]: {
      height: '48px',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      font: 'var(--font-text-body-base)',
      letterSpacing: 'var(--letter-spacing-body-base, normal)',
      color: 'var(--color-gray-text-default)',
      cursor: 'pointer',
      gap: '4px',
      padding: '0px 12px',
      marginTop: '4px',
      '&.chat': {
        color: 'var(--color-gray-text-light)',
        height: '32px',
        justifyContent: 'center',
        padding: '0',
      },
      '& > div:first-child': {
        width: '32px',
        height: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '50%',
        background: 'var(--color-gray-bg-card-light)',
        marginRight: '8px',
        fontSize: '16px',
        color: 'var(--color-gray-text-secondary)',
      },
      '&:hover': {
        borderRadius: '8px',
        background: 'var(--color-gray-control-fill-hover)',
        boxSizing: 'border-box',
      },
    },

    [token.componentCls]: {
      width: '100%',
      backgroundColor: 'transparent',
      outline: 'none',
      padding: '0',

      '&-item': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        borderRadius: 'var(--radius-control-base)',
        padding: '5px 6px 5px 12px',
        backgroundColor: 'transparent',
        color: token.colorText || 'var(--color-gray-text-default)',
        font: 'var(--font-text-body-base)',
        position: 'relative',
        userSelect: 'none',
        lineHeight: '20px',
        transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        [`${token.componentCls}-task-icon`]: {
          width: '32px',
          height: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8px',
          gap: '10px',
          borderRadius: '50%',
          background: 'var(--color-gray-bg-page-dark)',
          color: 'var(--color-gray-text-secondary)',
        },

        [`${token.componentCls}-task-icon`]: {
          width: '32px',
          height: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          fontSize: '16px',
          borderRadius: '50%',
          background: 'var(--color-gray-bg-page-dark)',
          color: 'var(--color-gray-text-secondary)',
        },

        '&:hover:not(&-disabled)': {
          backgroundColor: 'var(--color-gray-control-fill-hover)',
          [`${token.componentCls}-extra-actions`]: {
            opacity: 1,
          },
        },

        [`${token.componentCls}-extra-actions`]: {
          opacity: 0,
          transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        },

        '&-selected': {
          font: 'var(--font-text-h6-base)',
          backgroundColor: 'var(--color-gray-control-fill-active)',
        },

        '&-disabled': {
          cursor: 'not-allowed',
          color: token.colorTextDisabled || 'var(--color-gray-text-default)',
          opacity: 0.6,

          '&:hover': {
            backgroundColor: 'transparent',
          },
        },

        '&-content': {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
          minWidth: 0,
          font: 'var(--font-text-body-emphasized-sm)',
          letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
          color: 'var(--color-gray-text-light)',
        },

        '&-icon': {
          fontSize: 'var(--font-size-base)',
          width: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'inherit',
        },

        '&-group': {
          cursor: 'default',
          backgroundColor: 'transparent',
          height: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'var(--font-size-base)',
          padding: '6px 6px 6px 12px',
          lineHeight: '20px',
          letterSpacing: 'normal',
          color: 'var(--color-gray-text-default)',
          zIndex: 0,
        },
        '&:active:not(&-disabled)': {
          backgroundColor: 'transparent',
        },
      },

      '&-submenu': {
        gap: 4,
        display: 'flex',
        flexDirection: 'column',

        [`${token.componentCls}-item`]: {
          fontSize: 'var(--font-size-base)',
        },

        [`${token.componentCls}-submenu`]: {
          marginLeft: '16px',
          [`${token.componentCls}-item`]: {
            paddingLeft: '28px',
            fontSize: 'var(--font-size-base)',
          },
        },
      },

      '&-submenu-title': {
        fontSize: 'var(--font-size-base)',
        color: token.colorTextSecondary || 'var(--color-gray-text-default)',
        fontWeight: 500,
        padding: '5px 6px 5px 12px',
      },

      // Container focus styles
      '&:focus-within': {
        outline: 'none',
      },

      // Scrollbar styles
      '&::-webkit-scrollbar': {
        width: '6px',
      },

      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },

      '&::-webkit-scrollbar-thumb': {
        backgroundColor: token.colorBorder || 'var(--color-gray-border-light)',
        borderRadius: '3px',

        '&:hover': {
          backgroundColor:
            token.colorTextSecondary || 'var(--color-gray-text-default)',
        },
      },

      // Animation for menu items
      [`${token.componentCls}-item`]: {
        animationName: 'fadeIn',
        animationDuration: '0.2s',
        animationTimingFunction: 'ease-in-out',
      },

      '@keyframes fadeIn': {
        '0%': {
          opacity: 0,
          transform: 'translateY(-2px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },

      // 文本滚动动画
      '@keyframes scrollText': {
        '0%': {
          transform: 'translateX(0)',
        },
        '5%': {
          transform: 'translateX(0)',
        },
        '95%': {
          transform: 'translateX(var(--scroll-width))',
        },
        '100%': {
          transform: 'translateX(var(--scroll-width))',
        },
      },

      // 为超长文本添加滚动效果
      '[data-overflow="true"]': {
        '&:hover': {
          // 支持直接在元素上的属性
          '&[aria-describedby]': {
            animationName: 'scrollText',
            animationDuration: '2s',
            animationTimingFunction: 'linear',
            animationDelay: '0.5s',
            animationFillMode: 'forwards',
            animationPlayState: 'running',
          },
          // 支持子元素上的属性
          '& > div[aria-describedby]': {
            animationName: 'scrollText',
            animationDuration: '2s',
            animationTimingFunction: 'linear',
            animationDelay: '0.5s',
            animationFillMode: 'forwards',
            animationPlayState: 'running',
          },
          // 渐变遮罩层
          '& > div[style*="linear-gradient"], & + div[style*="linear-gradient"]':
            {
              opacity: '0 !important',
              transition: 'opacity 0.2s',
            },
        },
      },

      // 基础样式和重置
      // 同时支持元素自身和子元素的情况
      '[data-overflow="true"][aria-describedby], [data-overflow="true"] > div[aria-describedby]':
        {
          transition: 'transform 0.3s ease-out',
          transform: 'translateX(0)',
          animation: 'none',
        },

      '&-scroll-container': {
        '&::-webkit-scrollbar': {
          width: '4px',
        },

        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },

        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'var(--color-gray-border-light)',
          borderRadius: '4px',
        },
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('history-group-menu', (token) => {
    const groupMenuToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(groupMenuToken)];
  });
}
