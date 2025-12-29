import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      padding: 0,
      background: 'transparent',
      borderRadius: 0,
      boxShadow: 'none',
      width: '100%',

      '&-suggestions': {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: '100%',
        // 横向布局
        '&-horizontal': {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        },
      },

      // 搜索更多
      '&-more': {
        alignSelf: 'flex-start',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
        cursor: 'default',
        [`${token.componentCls}-more-text`]: {
          color: 'var(--color-gray-text-light)',
          font: 'var(--font-text-body-emphasized-base)',
          letterSpacing: 'var(--letter-spacing-body-emphasized-base, normal)',
        },
        [`${token.componentCls}-more-icon`]: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          fontSize: 14,
          color: 'var(--color-gray-text-light)',
          borderRadius: 'var(--radius-control-base)',
          cursor: 'pointer',
          transition:
            'background-color .2s cubic-bezier(0.645, 0.045, 0.355, 1)',
          '&:hover': {
            background: 'var(--color-gray-control-fill-hover)',
          },
          '&:active': {
            background: 'var(--color-gray-control-fill-active)',
          },
        },
      },

      '&-suggestion': {
        width: 'max-content',
        maxWidth: '100%',
        alignSelf: 'flex-start',
        height: 37,
        padding: 8,
        boxSizing: 'border-box',
        borderRadius: 'var(--radius-card-base)',
        background: 'var(--color-gray-bg-card-white)',
        border: 'none',
        boxShadow: 'var(--shadow-control-base)',
        color: 'var(--color-gray-text-secondary)',
        cursor: 'pointer',
        fontSize: 13,
        lineHeight: '21px',
        textAlign: 'left',
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        transition:
          'background-color .2s ease, box-shadow .2s ease, transform .08s ease',

        // hover 态（非禁用）
        '&:hover:not(&-disabled)': {
          background:
            'var(--color-gray-bg-card-light, var(--color-gray-bg-card-white))',
          boxShadow: 'var(--shadow-control-base)',
        },

        // active 态（非禁用）
        '&:active:not(&-disabled)': {
          transform: 'scale(0.99)',
        },

        // 禁用态
        '&-disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
          boxShadow: 'none',
        },

        // hover 时箭头位移动画
        [`&:hover:not(&-disabled) ${token.componentCls}-arrow:not(${token.componentCls}-arrow-action)`]:
          {
            transform: 'translateX(2px)',
          },
      },
      // 类型：基础版
      '&-basic': {
        [`${token.componentCls}-suggestion`]: {
          background: 'var(--color-gray-bg-card-light)',
          boxShadow: 'none',
          '&:hover:not(&-disabled)': {
            background: 'var(--color-gray-control-fill-active)',
            boxShadow: 'none',
          },
        },
      },
      // 类型：透明版
      '&-transparent': {
        [`${token.componentCls}-suggestion`]: {
          background: 'var(--color-gray-bg-transparent)',
          boxShadow: 'none',
          '&:hover:not(&-disabled)': {
            background: 'var(--color-gray-control-fill-hover)',
            boxShadow: 'none',
          },
        },
      },
      // 类型：白色版
      '&-white': {
        [`${token.componentCls}-suggestion`]: {
          background: 'var(--color-gray-bg-card-white)',
          boxShadow: 'var(--shadow-control-base)',
          '&:hover:not(&-disabled)': {
            background: 'var(--color-gray-bg-card-white)',
            boxShadow: 'var(--shadow-control-lg)',
          },
        },
      },

      '&-icon': {
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        color: 'var(--color-gray-text-secondary)',
        marginRight: 8,
      },

      '&-label': {
        display: 'inline-block',
        minWidth: 0,
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: 'var(--color-gray-text-default)',
        fontSize: 13,
      },

      '&-arrow': {
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-gray-text-light)',
        fontSize: 16,
        marginLeft: 12,
        transition: 'transform .2s cubic-bezier(0.645, 0.045, 0.355, 1)',
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('follow-up', (token) => {
    const followToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    } as ChatTokenType;
    return [genStyle(followToken)];
  });
}
