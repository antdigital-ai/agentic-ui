import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'VisualList'> = (token) => {
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
          outline: '2px solid var(--color-primary-control-fill-primary)',
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
        color: 'var(--color-gray-text-secondary)',
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
        color: 'var(--color-gray-text-disabled)',
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
      background: 'var(--color-gray-bg-card-white)',
      boxShadow: 'var(--shadow-control-base)',
    },

    // 描述文字样式
    [`${token.componentCls}-description`]: {
      fontSize: '13px',
      fontWeight: 'normal',
      lineHeight: '22px',
      letterSpacing: 'normal',
      color: 'var(--color-gray-text-secondary)',
    },
  };
};

const useGenStyle = genStyleHooks('VisualList', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'visual-list');
  return { hashId };
}
