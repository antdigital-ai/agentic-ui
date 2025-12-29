import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token: ChatTokenType) => {
  return {
    [token.componentCls]: {
      // 基础按钮样式
      borderRadius: '200px',
      boxSizing: 'border-box',
      border: '1px solid var(--color-gray-border-light)',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      padding: '5px 12px',
      cursor: 'pointer',
      fontFamily: 'var(--font-family-base)',
      fontSize: 'var(--font-size-base, 14px)',
      fontWeight: 'var(--font-weight-medium, 500)',
      lineHeight: 'var(--line-height-base, 1.5)',
      textAlign: 'center',
      textDecoration: 'none',
      transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
      userSelect: 'none',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'transparent',

      // Hover 状态
      '&:hover:not(&-disabled)': {
        background: 'var(--color-gray-control-fill-hover)',
        boxSizing: 'border-box',
        border: '1px solid var(--color-gray-border-light)',
      },

      // Active 状态
      '&:active:not(&-disabled)': {
        background: 'var(--color-primary-bg-card-light)',
        boxSizing: 'border-box',
        border: '1px solid var(--color-primary-border-light)',
      },

      // Active 属性状态
      '&-active': {
        background: 'var(--color-primary-bg-card-light)',
        boxSizing: 'border-box',
        border: '1px solid var(--color-primary-border-light)',

        // Active 状态下的文字颜色
        [`${token.componentCls}-text`]: {
          color: 'var(--color-blue-text-secondary)',
        },
      },

      // 尺寸变体
      '&-small': {
        height: 'var(--height-control-small, 28px)',
        padding: '0 var(--padding-control-small, 12px)',
        fontSize: 'var(--font-size-small, 12px)',
        minWidth: 'var(--min-width-control-small, 60px)',
      },

      '&-large': {
        height: 'var(--height-control-large, 40px)',
        padding: '0 var(--padding-control-large, 16px)',
        fontSize: 'var(--font-size-base, 14px)',
        minWidth: 'var(--min-width-control-large, 80px)',
      },

      // Primary 变体 - 主要按钮
      '&-primary': {
        backgroundColor: 'var(--color-blue-primary, #1677ff)',
        color: 'var(--color-white, #ffffff)',
        boxShadow: 'var(--shadow-control-base, 0 1px 2px rgba(0, 0, 0, 0.1))',

        '&:hover:not(&-disabled)': {
          backgroundColor: 'var(--color-blue-primary-hover, #4096ff)',
          boxShadow:
            'var(--shadow-control-hover, 0 2px 4px rgba(0, 0, 0, 0.15))',
          transform: 'translateY(-1px)',
        },

        '&:active:not(&-disabled)': {
          backgroundColor: 'var(--color-blue-primary-active, #0958d9)',
          boxShadow:
            'var(--shadow-control-active, 0 1px 2px rgba(0, 0, 0, 0.2))',
          transform: 'translateY(0)',
        },

        '&:focus-visible': {
          boxShadow: '0 0 0 2px var(--color-blue-primary-light, #d6eeff)',
        },
      },

      // Secondary 变体 - 次要按钮
      '&-secondary': {
        backgroundColor: 'var(--color-gray-bg-card-white, #ffffff)',
        color: 'var(--color-gray-text-default, #343a45)',
        border: '1px solid var(--color-gray-border, #e6ecf4)',
        boxShadow: 'var(--shadow-control-base, 0 1px 2px rgba(0, 0, 0, 0.1))',

        '&:hover:not(&-disabled)': {
          backgroundColor: 'var(--color-gray-bg-card-light, #fbfcfd)',
          borderColor: 'var(--color-blue-primary, #1677ff)',
          color: 'var(--color-blue-primary, #1677ff)',
          boxShadow:
            'var(--shadow-control-hover, 0 2px 4px rgba(0, 0, 0, 0.15))',
        },

        '&:active:not(&-disabled)': {
          backgroundColor: 'var(--color-gray-control-fill-active, #f0f0f0)',
          borderColor: 'var(--color-blue-primary-active, #0958d9)',
          color: 'var(--color-blue-primary-active, #0958d9)',
        },

        '&:focus-visible': {
          boxShadow: '0 0 0 2px var(--color-blue-primary-light, #d6eeff)',
        },
      },

      // Ghost 变体 - 幽灵按钮
      '&-ghost': {
        backgroundColor: 'transparent',
        color: 'var(--color-gray-text-default, #343a45)',
        border: '1px solid transparent',

        '&:hover:not(&-disabled)': {
          backgroundColor: 'var(--color-gray-control-fill-hover, #f5f5f5)',
          color: 'var(--color-blue-primary, #1677ff)',
        },

        '&:active:not(&-disabled)': {
          backgroundColor: 'var(--color-gray-control-fill-active, #e6f7ff)',
          color: 'var(--color-blue-primary-active, #0958d9)',
        },

        '&:focus-visible': {
          backgroundColor: 'var(--color-gray-control-fill-hover, #f5f5f5)',
          boxShadow: '0 0 0 2px var(--color-blue-primary-light, #d6eeff)',
        },
      },

      // No-border 变体 - 无边框按钮
      '&-no-border': {
        backgroundColor: 'transparent',
        color: 'var(--color-gray-text-default, #343a45)',
        border: 'none',
        boxShadow: 'none',

        '&:hover:not(&-disabled)': {
          backgroundColor: 'var(--color-gray-control-fill-hover, #f5f5f5)',
          color: 'var(--color-blue-primary, #1677ff)',
        },

        '&:active:not(&-disabled)': {
          backgroundColor: 'var(--color-gray-control-fill-active, #e6f7ff)',
          color: 'var(--color-blue-primary-active, #0958d9)',
        },

        '&:focus-visible': {
          backgroundColor: 'var(--color-gray-control-fill-hover, #f5f5f5)',
          boxShadow: '0 0 0 2px var(--color-blue-primary-light, #d6eeff)',
        },
      },

      // Float 变体 - 浮动按钮
      '&-float': {
        backgroundColor: 'var(--color-blue-primary, #1677ff)',
        color: 'var(--color-white, #ffffff)',
        borderRadius: '50%',
        width: 'var(--height-control-large, 40px)',
        height: 'var(--height-control-large, 40px)',
        padding: 0,
        minWidth: 'auto',
        boxShadow: 'var(--shadow-float, 0 4px 12px rgba(22, 119, 255, 0.4))',

        '&:hover:not(&-disabled)': {
          backgroundColor: 'var(--color-blue-primary-hover, #4096ff)',
          boxShadow:
            'var(--shadow-float-hover, 0 6px 16px rgba(22, 119, 255, 0.5))',
          transform: 'translateY(-2px) scale(1.05)',
        },

        '&:active:not(&-disabled)': {
          backgroundColor: 'var(--color-blue-primary-active, #0958d9)',
          boxShadow:
            'var(--shadow-float-active, 0 2px 8px rgba(22, 119, 255, 0.3))',
          transform: 'translateY(0) scale(1)',
        },

        '&:focus-visible': {
          boxShadow: '0 0 0 2px var(--color-blue-primary-light, #d6eeff)',
        },
      },

      // CTA 变体 - 行动号召按钮
      '&-cta': {
        backgroundColor: 'var(--color-green-success, #52c41a)',
        color: 'var(--color-white, #ffffff)',
        fontWeight: 'var(--font-weight-semibold, 600)',
        boxShadow: 'var(--shadow-cta, 0 2px 8px rgba(82, 196, 26, 0.3))',
        position: 'relative',
        overflow: 'hidden',

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transition: 'left 0.5s cubic-bezier(0.645, 0.045, 0.355, 1)',
        },

        '&:hover:not(&-disabled)': {
          backgroundColor: 'var(--color-green-success-hover, #73d13d)',
          boxShadow:
            'var(--shadow-cta-hover, 0 4px 12px rgba(82, 196, 26, 0.4))',
          transform: 'translateY(-1px)',

          '&::before': {
            left: '100%',
          },
        },

        '&:active:not(&-disabled)': {
          backgroundColor: 'var(--color-green-success-active, #389e0d)',
          boxShadow:
            'var(--shadow-cta-active, 0 1px 4px rgba(82, 196, 26, 0.2))',
          transform: 'translateY(0)',
        },

        '&:focus-visible': {
          boxShadow: '0 0 0 2px var(--color-green-success-light, #f6ffed)',
        },
      },

      // 禁用状态
      '&-disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
        transform: 'none !important',
        boxShadow: 'none !important',

        '&:hover': {
          transform: 'none !important',
          boxShadow: 'none !important',
        },

        '&:active': {
          transform: 'none !important',
          boxShadow: 'none !important',
        },
      },

      // 图标样式
      '&-icon': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'inherit',
        lineHeight: 1,
        marginRight: '4px',
      },

      // 文字样式
      '&-text': {
        display: 'inline-block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        font: 'var(--font-text-body-base)',
        letterSpacing: 'var(--letter-spacing-body-base, normal)',
        color: 'var(--color-gray-text-default)',
      },

      // 触发图标样式
      '&-trigger-icon': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-gray-text-light)',
        fontSize: 'inherit',
        lineHeight: 1,
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('toggle-button', (token: any) => {
    const buttonToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    } as ChatTokenType;
    return [genStyle(buttonToken)];
  });
}
