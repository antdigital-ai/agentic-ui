import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}-container`]: {
      // overflow: 'hidden', // 会把Quote的弹框遮挡
      borderTopLeftRadius: 'inherit',
      borderTopRightRadius: 'inherit',
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
        backgroundColor: 'var(--color-gray-control-fill-pressed)',
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
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('SkillModeBar', (token) => {
    const skillModeToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(skillModeToken), genStyle(skillModeToken)];
  });
}
