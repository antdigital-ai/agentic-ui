import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--padding-4x)',
      backgroundColor: 'var(--color-gray-bg-page-light)',
      minHeight: '48px',
      flexShrink: 0,
      zIndex: 10,
      borderTopLeftRadius: 'inherit',
      borderTopRightRadius: 'inherit',

      // 左侧区域样式
      [`${token.componentCls}-left`]: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--margin-2x)',

        '&-title': {
          fontSize: 'var(--font-size-lg)',
          fontWeight: 600,
          color: 'var(--color-gray-text-default)',
          margin: 0,
          lineHeight: '1.4',
        },

        '&-separator': {
          width: '1px',
          height: '24px',
          backgroundColor: 'var(--color-gray-border-light)',
        },
      },

      // 右侧区域样式
      [`${token.componentCls}-right`]: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--margin-2x)',
      },
    },
  };
};

export const useLayoutHeaderStyle = (prefixCls: string) => {
  return useEditorStyleRegister('layout-header', (token) => {
    const layoutHeaderToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(layoutHeaderToken)];
  });
};
