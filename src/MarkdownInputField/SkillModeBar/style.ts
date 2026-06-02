import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'SkillModeBar'> = (token) => {
  return {
    [`${token.componentCls}-container`]: {
      // overflow: 'hidden', // 会把Quote的弹框遮挡
      borderTopLeftRadius: 'inherit',
      borderTopRightRadius: 'inherit',
      // 替代 framer-motion 的 height:0↔auto + opacity 入场/退出动画。
      // 使用 grid-template-rows 0fr↔1fr 实现"任意高度"过渡。
      display: 'grid',
      gridTemplateRows: '1fr',
      opacity: 1,
      transition:
        'grid-template-rows 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
      '&[data-state="exit"]': {
        gridTemplateRows: '0fr',
        opacity: 0,
        pointerEvents: 'none',
      },
    },

    [`${token.componentCls}`]: {
      borderWidth: '0px 0px 1px 0px',
      width: '100%',
      height: 'fit-content',
      borderTopLeftRadius: 'inherit',
      borderTopRightRadius: 'inherit',
      minHeight: '48px',
      alignSelf: 'stretch',
      borderStyle: 'solid',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      // 替代 framer-motion 的 padding/backgroundColor/borderColor 关键帧动画
      padding: '12px',
      backgroundColor: 'var(--color-gray-bg-page)',
      borderColor: 'rgba(0, 16, 64, 0.0627)',
      overflow: 'hidden',
      // 内层 padding/bg/border 同步过渡
      transition:
        'padding 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), background-color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), border-color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), min-height 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
      '&[data-state="exit"]': {
        padding: '0px',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        minHeight: 0,
      },
    },

    [`${token.componentCls}-title`]: {
      flex: 1,
      font: 'var(--font-text-h5-base)',
      letterSpacing: 'var(--letter-spacing-h5-base, normal)',
      color: 'var(--color-primary-control-fill-primary)',
      minHeight: '28px',
    },

    [`${token.componentCls}-right`]: {
      font: 'var(--font-text-body-sm)',
      letterSpacing: 'var(--letter-spacing-body-sm, normal)',
      color: 'var(--color-gray-text-secondary)',
    },

    [`${token.componentCls}-divider`]: {
      margin: '0',
    },

    [`${token.componentCls}-close`]: {
      cursor: 'pointer',
      outline: 'none',
      border: 'none',
      background: 'transparent',
      padding: '4px',
      borderRadius: '4px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
      color: 'var(--color-gray-text-light)',

      '&:hover': {
        backgroundColor: 'var(--color-gray-control-fill-active)',
        color: 'var(--color-gray-text-light)',
        borderRadius: 'var(--radius-control-sm)',
      },

      '&:active': {
        backgroundColor:
          'var(--color-gray-control-fill-pressed, var(--color-gray-control-fill-secondary-active))',
        outline: 'none',
        border: 'none',
      },

      '&:focus': {
        outline: `2px solid ${token.colorPrimary}`,
        outlineOffset: '2px',
      },

      '&:focus:not(:focus-visible)': {
        outline: 'none',
      },
    },
  };
};

/**
 * SkillModeBar 样式 Hook
 * @param prefixCls 类名前缀
 * @returns 样式相关函数和变量
 */
const useGenStyle = genStyleHooks('SkillModeBar', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'SkillModeBar');
  return { hashId };
}
