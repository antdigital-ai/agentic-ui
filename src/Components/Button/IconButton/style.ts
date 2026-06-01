import { genStyleHooks, type GenStyleFn } from '../../../Hooks/useStyle';
import { sharedButtonVariants } from '../sharedStyle';

const ICON_SIZE = 16;
const ICON_SIZE_SM = 14;
const ICON_SIZE_XS = 14;

const genStyle: GenStyleFn<'IconButton'> = (token) => {
  const { antCls } = token;
  const btn = `${antCls}-btn`;
  const btnIcon = `${antCls}-btn-icon`;
  const btnIconOnly = `${antCls}-btn-icon-only`;
  const btnVariantOutlined = `${antCls}-btn-variant-outlined`;
  const btnDisabled = `${antCls}-btn-disabled`;

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
      fontFamily:
        'var(--font-family-base, var(--font-family-text, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif))',
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
      [`&-button ${btnIcon}`]: {
        fontSize: ICON_SIZE,
        lineHeight: 1,
      },
      [`&-button ${btnIcon} > *`]: {
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
      [`&-button-sm ${btnIcon}`]: {
        fontSize: ICON_SIZE_SM,
      },
      [`&-button-sm ${btnIcon} > *`]: {
        width: ICON_SIZE_SM,
        height: ICON_SIZE_SM,
      },

      // 提升优先级以覆盖 antd 的 icon-only 尺寸（包括 outlined 变体）
      [`&-button&-button-sm${btn}${btnIconOnly}`]: {
        width: 'var(--height-control-sm)',
        height: 'var(--height-control-sm)',
        lineHeight: 'var(--height-control-sm)',
        borderRadius: 'var(--radius-control-sm)',
      },
      [`&-button&-button-sm${btn}${btnVariantOutlined}${btnIconOnly}`]: {
        width: 'var(--height-control-sm)',
        height: 'var(--height-control-sm)',
        lineHeight: 'var(--height-control-sm)',
        borderRadius: 'var(--radius-control-sm)',
      },
      [`&-button&-button-sm${btn}${btnIconOnly} ${btnIcon}`]: {
        fontSize: ICON_SIZE_SM,
      },
      [`&-button&-button-sm${btn}${btnIconOnly} ${btnIcon} > *`]: {
        width: ICON_SIZE_SM,
        height: ICON_SIZE_SM,
      },

      '&-button-xs': {
        width: 'var(--height-control-xs)',
        height: 'var(--height-control-xs)',
        lineHeight: 'var(--height-control-xs)',
        borderRadius: 'var(--radius-control-xs)',
      },
      [`&-button-xs ${btnIcon}`]: {
        fontSize: ICON_SIZE_XS,
      },
      [`&-button-xs ${btnIcon} > *`]: {
        width: ICON_SIZE_XS,
        height: ICON_SIZE_XS,
      },
      [`&-button&-button-xs${btn}${btnIconOnly}`]: {
        width: 'var(--height-control-xs)',
        height: 'var(--height-control-xs)',
        lineHeight: 'var(--height-control-xs)',
        borderRadius: 'var(--radius-control-xs)',
      },
      [`&-button&-button-xs${btn}${btnVariantOutlined}${btnIconOnly}`]: {
        width: 'var(--height-control-xs)',
        height: 'var(--height-control-xs)',
        lineHeight: 'var(--height-control-xs)',
        borderRadius: 'var(--radius-control-xs)',
      },
      [`&-button&-button-xs${btn}${btnIconOnly} ${btnIcon}`]: {
        fontSize: ICON_SIZE_XS,
      },
      [`&-button&-button-xs${btn}${btnIconOnly} ${btnIcon} > *`]: {
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
      [`&-button&-button-elevated${btn}${btnIconOnly}:not(${btnDisabled}):not([disabled]):hover`]:
        {
          background: 'var(--color-gray-bg-card-white)',
          boxShadow: 'var(--shadow-control-lg)',
        },
      [`&-button&-button-elevated${btn}${btnIconOnly}:not(${btnDisabled}):not([disabled]):active`]:
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

      // 共享变体（primary / secondary / ghost / no-border / float / cta / disabled）
      ...sharedButtonVariants,

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

const useGenStyle = genStyleHooks('IconButton', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'icon-button');
  return { hashId };
}
