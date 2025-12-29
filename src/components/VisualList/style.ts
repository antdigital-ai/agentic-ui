import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      boxSizing: 'border-box',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      flexFlow: 'wrap',
      gap: '4px',
      // 容器样式

      [`${token.componentCls}-item`]: {
        marginBottom: '0px',
        marginRight: '-8px',
        boxSizing: 'border-box',
        display: 'flex',
        position: 'relative',
        zIndex: 1,
        cursor: 'pointer',
        'img,[data-type="image"]': {
          borderRadius: '8px',
          transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        },
        '&:hover': {
          'img,[data-type="image"]': {
            boxShadow: '0 2px 8px rgba(0, 122, 204, 0.15)',
            transform: 'translateY(-16px) scale(1.5)',
          },
        },
      },

      [`${token.componentCls}-link`]: {
        display: 'flex',
        textDecoration: 'none',
        color: 'inherit',

        '&:focus': {
          outline: '2px solid #007acc',
          outlineOffset: '2px',
        },
      },

      [`${token.componentCls}-image`]: {
        objectFit: 'cover',
        display: 'block',
        width: '18px',
        height: '18px',
      },

      [`${token.componentCls}-loading`]: {
        display: 'flex',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40px',
        color: '#666',
        fontSize: '14px',
      },

      [`${token.componentCls}-empty`]: {
        display: 'flex',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40px',
        color: '#999',
        fontSize: '14px',
        fontStyle: 'italic',
      },

      // 圆形头像样式
      [`${token.componentCls}-item-circle`]: {
        borderRadius: '50%',
      },

      [`${token.componentCls}-borderless`]: {
        border: 'none',
        padding: 0,
        backgroundColor: 'transparent',
      },

      [`${token.componentCls}-default`]: {
        // 默认样式，无特殊边框处理
      },
    },
    [`${token.componentCls}-container`]: {
      position: 'relative',
      borderRadius: '200px',
      height: 28,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      width: 'max-content',
      padding: '0 8px',
      background: '#FFFFFF',
      boxShadow: 'var(--shadow-control-base)',
    },

    // 描述文字样式
    [`${token.componentCls}-description`]: {
      fontSize: '13px',
      fontWeight: 'normal',
      lineHeight: '22px',
      letterSpacing: 'normal',
      color: '#767E8B',
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('visual-list', (token) => {
    const visualListToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(visualListToken)];
  });
}
