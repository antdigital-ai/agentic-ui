import type { CSSObject } from '@ant-design/cssinjs';

/**
 * Button 体系共享样式 - 在 IconButton / ToggleButton 之间复用，
 * 避免 200+ 行重复 CSS 漂移。
 *
 * 用法：在各自的 style.ts 中通过对象 spread 合并到 token.componentCls 下。
 */

/**
 * Primary / Secondary / Ghost / No-border / Float / CTA / Disabled
 * 这 7 段是历史上完全相同的样式，统一沉淀于此。
 */
export const sharedButtonVariants: Record<string, CSSObject> = {
  // Primary 变体 - 主要按钮
  '&-primary': {
    backgroundColor: 'var(--color-primary-control-fill-primary)',
    color: 'var(--color-gray-bg-card-white)',
    boxShadow: 'var(--shadow-control-base, 0 1px 2px rgba(0, 0, 0, 0.1))',

    '&:hover:not(&-disabled)': {
      backgroundColor: 'var(--color-primary-control-fill-primary-hover)',
      boxShadow: 'var(--shadow-control-hover, 0 2px 4px rgba(0, 0, 0, 0.15))',
      transform: 'translateY(-1px)',
    },

    '&:active:not(&-disabled)': {
      backgroundColor: 'var(--color-primary-control-fill-primary-active)',
      boxShadow: 'var(--shadow-control-active, 0 1px 2px rgba(0, 0, 0, 0.2))',
      transform: 'translateY(0)',
    },

    '&:focus-visible': {
      boxShadow: '0 0 0 2px var(--color-primary-bg-page-light)',
    },
  },

  // Secondary 变体 - 次要按钮
  '&-secondary': {
    backgroundColor: 'var(--color-gray-bg-card-white)',
    color: 'var(--color-gray-text-default, #343a45)',
    border: '1px solid var(--color-gray-border-light)',
    boxShadow: 'var(--shadow-control-base, 0 1px 2px rgba(0, 0, 0, 0.1))',

    '&:hover:not(&-disabled)': {
      backgroundColor: 'var(--color-gray-bg-card-light, #fbfcfd)',
      borderColor: 'var(--color-primary-control-fill-primary)',
      color: 'var(--color-primary-control-fill-primary)',
      boxShadow: 'var(--shadow-control-hover, 0 2px 4px rgba(0, 0, 0, 0.15))',
    },

    '&:active:not(&-disabled)': {
      backgroundColor: 'var(--color-gray-control-fill-active)',
      borderColor: 'var(--color-primary-control-fill-primary-active)',
      color: 'var(--color-primary-control-fill-primary-active)',
    },

    '&:focus-visible': {
      boxShadow: '0 0 0 2px var(--color-primary-bg-page-light)',
    },
  },

  // Ghost 变体 - 幽灵按钮
  '&-ghost': {
    backgroundColor: 'transparent',
    color: 'var(--color-gray-text-default, #343a45)',
    border: '1px solid transparent',

    '&:hover:not(&-disabled)': {
      backgroundColor: 'var(--color-gray-control-fill-hover)',
      color: 'var(--color-primary-control-fill-primary)',
    },

    '&:active:not(&-disabled)': {
      backgroundColor: 'var(--color-gray-control-fill-active, #e6f7ff)',
      color: 'var(--color-primary-control-fill-primary-active)',
    },

    '&:focus-visible': {
      backgroundColor: 'var(--color-gray-control-fill-hover)',
      boxShadow: '0 0 0 2px var(--color-primary-bg-page-light)',
    },
  },

  // No-border 变体 - 无边框按钮
  '&-no-border': {
    backgroundColor: 'transparent',
    color: 'var(--color-gray-text-default, #343a45)',
    border: 'none',
    boxShadow: 'none',

    '&:hover:not(&-disabled)': {
      backgroundColor: 'var(--color-gray-control-fill-hover)',
      color: 'var(--color-primary-control-fill-primary)',
    },

    '&:active:not(&-disabled)': {
      backgroundColor: 'var(--color-gray-control-fill-active, #e6f7ff)',
      color: 'var(--color-primary-control-fill-primary-active)',
    },

    '&:focus-visible': {
      backgroundColor: 'var(--color-gray-control-fill-hover)',
      boxShadow: '0 0 0 2px var(--color-primary-bg-page-light)',
    },
  },

  // Float 变体 - 浮动按钮
  '&-float': {
    backgroundColor: 'var(--color-primary-control-fill-primary)',
    color: 'var(--color-gray-bg-card-white)',
    borderRadius: '50%',
    width: 'var(--height-control-large, 40px)',
    height: 'var(--height-control-large, 40px)',
    padding: 0,
    minWidth: 'auto',
    boxShadow: 'var(--shadow-float, 0 4px 12px rgba(22, 119, 255, 0.4))',

    '&:hover:not(&-disabled)': {
      backgroundColor: 'var(--color-primary-control-fill-primary-hover)',
      boxShadow:
        'var(--shadow-float-hover, 0 6px 16px rgba(22, 119, 255, 0.5))',
      transform: 'translateY(-2px) scale(1.05)',
    },

    '&:active:not(&-disabled)': {
      backgroundColor: 'var(--color-primary-control-fill-primary-active)',
      boxShadow:
        'var(--shadow-float-active, 0 2px 8px rgba(22, 119, 255, 0.3))',
      transform: 'translateY(0) scale(1)',
    },

    '&:focus-visible': {
      boxShadow: '0 0 0 2px var(--color-primary-bg-page-light)',
    },
  },

  // CTA 变体 - 行动号召按钮
  '&-cta': {
    backgroundColor: 'var(--color-green-control-fill-primary)',
    color: 'var(--color-gray-bg-card-white)',
    fontWeight: 'var(--font-weight-semibold, 600)',
    boxShadow: 'var(--shadow-cta, 0 2px 8px rgba(82, 196, 26, 0.3))',
    position: 'relative' as const,
    overflow: 'hidden' as const,

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
      backgroundColor: 'var(--color-green-control-fill-primary-hover)',
      boxShadow: 'var(--shadow-cta-hover, 0 4px 12px rgba(82, 196, 26, 0.4))',
      transform: 'translateY(-1px)',

      '&::before': {
        left: '100%',
      },
    },

    '&:active:not(&-disabled)': {
      backgroundColor: 'var(--color-green-control-fill-primary-active)',
      boxShadow: 'var(--shadow-cta-active, 0 1px 4px rgba(82, 196, 26, 0.2))',
      transform: 'translateY(0)',
    },

    '&:focus-visible': {
      boxShadow: '0 0 0 2px var(--color-green-bg-page-light)',
    },
  },

  // 禁用状态
  '&-disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none' as const,
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
};
