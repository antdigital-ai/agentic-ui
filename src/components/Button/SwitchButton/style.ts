import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token: ChatTokenType) => {
  return {
    [token.componentCls]: {
      padding: '5px 12px',
      height: 'var(--height-control-base)',
      borderRadius: '200px',
      border: '1px solid var(--color-gray-border-light)',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      background: 'transparent',
      font: 'var(--font-text-body-base)',
      letterSpacing: 'var(--letter-spacing-body-base, normal)',
      color: 'var(--color-gray-text-default)',

      '&.ant-btn': {
        borderRadius: '200px',
        gap: 0,
      },

      // hover
      '&:hover:not(&-disabled)': {
        background: 'var(--color-gray-control-fill-hover)',
        border: '1px solid var(--color-gray-border-light)',
      },

      // active
      '&:active:not(&-disabled)': {
        background: 'var(--color-primary-bg-card-light)',
        border: '1px solid var(--color-primary-border-light)',
        font: 'var(--font-text-h6-base)',

        color: 'var(--color-blue-text-secondary)',
        // 文本与图标颜色显式同步
        [`${token.componentCls}-text, ${token.componentCls}-icon`]: {
          color: 'var(--color-blue-text-secondary)',
        },
        [`${token.componentCls}-icon svg`]: {
          fill: 'currentColor',
          color: 'currentColor',
        },
      },

      // 受控 active（类名）
      '&-active': {
        background: 'var(--color-primary-bg-card-light)',
        border: '1px solid var(--color-primary-border-light)',
        font: 'var(--font-text-h6-base)',

        color: 'var(--color-blue-text-secondary)',
        [`${token.componentCls}-text, ${token.componentCls}-icon`]: {
          color: 'var(--color-blue-text-secondary)',
        },
        [`${token.componentCls}-icon svg`]: {
          fill: 'currentColor',
          color: 'currentColor',
        },
      },

      // 与 antd 变体类（outlined）组合时的 active 覆盖（按下）
      '&.ant-btn-variant-outlined:not(:disabled):not(.ant-btn-disabled):active':
        {
          background: 'var(--color-primary-bg-card-light)',
          borderColor: 'var(--color-primary-border-light)',
          color: 'var(--color-blue-text-secondary)',
          [`${token.componentCls}-text, ${token.componentCls}-icon`]: {
            color: 'var(--color-blue-text-secondary)',
          },
          [`${token.componentCls}-icon svg`]: {
            fill: 'currentColor',
            color: 'currentColor',
          },
        },
      // 与 antd 变体类（outlined）组合时的受控 active 常驻覆盖
      '&.ant-btn-variant-outlined&-active': {
        background: 'var(--color-primary-bg-card-light)',
        borderColor: 'var(--color-primary-border-light)',
        color: 'var(--color-blue-text-secondary)',
        [`${token.componentCls}-text, ${token.componentCls}-icon`]: {
          color: 'var(--color-blue-text-secondary)',
        },
        [`${token.componentCls}-icon svg`]: {
          fill: 'currentColor',
          color: 'currentColor',
        },
      },

      // disabled
      '&-disabled': {
        border: '1px solid var(--color-gray-border-light)',
        color: 'var(--color-gray-text-disabled)',
        cursor: 'not-allowed',
        [`${token.componentCls}-text, ${token.componentCls}-icon`]: {
          color: 'var(--color-gray-text-disabled)',
        },
        [`${token.componentCls}-icon svg`]: {
          fill: 'currentColor',
          color: 'currentColor',
        },
      },

      [`${token.componentCls}-icon`]: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'inherit',
        lineHeight: 1,
        marginRight: 4,
        color: 'inherit',
      },
      [`${token.componentCls}-text`]: {
        display: 'inline-block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginRight: 8,
        color: 'inherit',
        font: 'inherit',
        letterSpacing: 'inherit',
        lineHeight: '19px',
      },
      [`${token.componentCls}-trigger-icon`]: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'inherit',
        lineHeight: 1,
        color: 'inherit',
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('switch-button', (token: any) => {
    const buttonToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    } as ChatTokenType;
    return [genStyle(buttonToken)];
  });
}
