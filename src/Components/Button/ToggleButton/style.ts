import { genStyleHooks, type GenStyleFn } from '../../../Hooks/useStyle';
import { sharedButtonVariants } from '../sharedStyle';

const genStyle: GenStyleFn<'ToggleButton'> = (token) => {
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
      fontFamily:
        'var(--font-family-base, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif)',
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

      // 共享变体（primary / secondary / ghost / no-border / float / cta / disabled）
      ...sharedButtonVariants,

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

const useGenStyle = genStyleHooks('ToggleButton', genStyle);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'toggle-button');
  return { wrapSSR, hashId };
}
