import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const ICON_SIZE = 16;
const ICON_SIZE_SM = 14;
const ICON_SIZE_XS = 14;

const genStyle: GenerateStyle<ChatTokenType> = (token: ChatTokenType) => {
  return {
    [token.componentCls]: {
      // 基础按钮样式
      display: 'inline-flex',
      height: 'var(--height-control-base)',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      border: 'none',
      borderRadius: 'var(--radius-control-base, 6px)',
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

      // 统一 icon 尺寸（适配 antd Button 图标容器）- base
      '&-button .ant-btn-icon': {
        fontSize: ICON_SIZE,
        lineHeight: 1,
      },
      '&-button .ant-btn-icon > *': {
        width: ICON_SIZE,
        height: ICON_SIZE,
      },

      // 尺寸变体
      '&-button-sm': {
        width: 'var(--height-control-sm)',
        height: 'var(--height-control-sm)',
        lineHeight: 'var(--height-control-sm)',
        borderRadius: 'var(--radius-control-sm)',
      },
      '&-button-sm .ant-btn-icon': {
        fontSize: ICON_SIZE_SM,
      },
      '&-button-sm .ant-btn-icon > *': {
        width: ICON_SIZE_SM,
        height: ICON_SIZE_SM,
      },

      // 提升优先级以覆盖 antd 的 icon-only 尺寸（包括 outlined 变体）
      '&-button&-button-sm.ant-btn.ant-btn-icon-only': {
        width: 'var(--height-control-sm)',
        height: 'var(--height-control-sm)',
        lineHeight: 'var(--height-control-sm)',
        borderRadius: 'var(--radius-control-sm)',
      },
      '&-button&-button-sm.ant-btn.ant-btn-variant-outlined.ant-btn-icon-only':
        {
          width: 'var(--height-control-sm)',
          height: 'var(--height-control-sm)',
          lineHeight: 'var(--height-control-sm)',
          borderRadius: 'var(--radius-control-sm)',
        },
      '&-button&-button-sm.ant-btn.ant-btn-icon-only .ant-btn-icon': {
        fontSize: ICON_SIZE_SM,
      },
      '&-button&-button-sm.ant-btn.ant-btn-icon-only .ant-btn-icon > *': {
        width: ICON_SIZE_SM,
        height: ICON_SIZE_SM,
      },

      '&-button-xs': {
        width: 'var(--height-control-xs)',
        height: 'var(--height-control-xs)',
        lineHeight: 'var(--height-control-xs)',
        borderRadius: 'var(--radius-control-xs)',
      },
      '&-button-xs .ant-btn-icon': {
        fontSize: ICON_SIZE_XS,
      },
      '&-button-xs .ant-btn-icon > *': {
        width: ICON_SIZE_XS,
        height: ICON_SIZE_XS,
      },
      '&-button&-button-xs.ant-btn.ant-btn-icon-only': {
        width: 'var(--height-control-xs)',
        height: 'var(--height-control-xs)',
        lineHeight: 'var(--height-control-xs)',
        borderRadius: 'var(--radius-control-xs)',
      },
      '&-button&-button-xs.ant-btn.ant-btn-variant-outlined.ant-btn-icon-only':
        {
          width: 'var(--height-control-xs)',
          height: 'var(--height-control-xs)',
          lineHeight: 'var(--height-control-xs)',
          borderRadius: 'var(--radius-control-xs)',
        },
      '&-button&-button-xs.ant-btn.ant-btn-icon-only .ant-btn-icon': {
        fontSize: ICON_SIZE_XS,
      },
      '&-button&-button-xs.ant-btn.ant-btn-icon-only .ant-btn-icon > *': {
        width: ICON_SIZE_XS,
        height: ICON_SIZE_XS,
      },

      // Elevated 悬浮版本 - 默认/hover/active
      '&-button-elevated': {
        borderRadius: 'var(--radius-control-base)',
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-border-base)',
        color: 'var(--color-gray-text-secondary)',

        '&:hover:not(&-button-disabled):not(&-button-loading):not([disabled])':
          {
            background: 'var(--color-gray-bg-card-white)',
            boxShadow: 'var(--shadow-control-lg)',
          },

        '&:active:not(&-button-disabled):not(&-button-loading):not([disabled])':
          {
            background: 'var(--color-primary-control-fill-secondary)',
            boxShadow: 'var(--shadow-border-base)',
            color: 'var(--color-gray-text-secondary)',
          },
      },

      // 提升 hover/active 选择器优先级以覆盖 antd 的 icon-only 悬浮样式
      '&-button&-button-elevated.ant-btn.ant-btn-icon-only:not(.ant-btn-disabled):not([disabled]):hover':
        {
          background: 'var(--color-gray-bg-card-white)',
          boxShadow: 'var(--shadow-control-lg)',
        },
      '&-button&-button-elevated.ant-btn.ant-btn-icon-only:not(.ant-btn-disabled):not([disabled]):active':
        {
          background: 'var(--color-primary-control-fill-secondary)',
          boxShadow: 'var(--shadow-border-base)',
          color: 'var(--color-gray-text-secondary)',
        },

      // Elevated 悬浮版本 - disabled
      '&-button-elevated&-button-disabled, &-button-elevated[disabled]': {
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-control-base)',
        color: 'var(--color-gray-text-disabled)',
      },

      // Elevated 悬浮版本 - loading
      '&-button-elevated&-button-loading': {
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-control-base)',
        color: 'var(--color-gray-text-disabled)',
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

      // 加载状态
      '&-loading': {
        cursor: 'not-allowed',
        pointerEvents: 'none',

        '&:hover': {
          transform: 'none !important',
        },

        '&:active': {
          transform: 'none !important',
        },
      },

      // 图标样式
      '&-icon': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'inherit',
        lineHeight: 1,
      },

      // 文字样式
      '&-text': {
        display: 'inline-block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('icon-button', (token: any) => {
    const buttonToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    } as ChatTokenType;
    return [genStyle(buttonToken)];
  });
}
