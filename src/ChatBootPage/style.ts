import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genStyle: GenStyleFn<'ChatBootTitle'> = (token) => {
  return {
    [token.componentCls]: {
      textAlign: 'center',
      marginBottom: 24,

      '&-main': {
        fontSize: 30,
        fontWeight: 600,
        lineHeight: '38px',
        marginBottom: 8,
        color: 'var(--color-gray-text-default)',
      },

      '&-subtitle': {
        fontSize: 15,
        lineHeight: '24px',
        color: 'var(--color-gray-text-default)',
      },
    },
  };
};

const useGenStyle = genStyleHooks('ChatBootTitle', genStyle);

/**
 * Title 组件样式
 * @param prefixCls
 * @returns
 */
export const useStyle = (prefixCls?: string) => {
  const [, hashId] = useGenStyle(prefixCls ?? 'ChatBootTitle');
  return { hashId };
};
