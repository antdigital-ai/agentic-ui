import { genStyleHooks, resetComponent, type GenStyleFn } from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'BubbleList'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      overflowY: 'auto',
      overflowX: 'hidden',
      minHeight: 200,
      padding: 'var(--padding-6x)',
      [`${token.componentCls}-content-list`]: {
        paddingTop: 'var(--padding-3x)',
        paddingBottom: 'var(--padding-3x)',
      },
      '&-loading': {
        padding: '0 var(--padding-6x)',
      },
    },
  };
};

/**
 * BubbleItem
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('BubbleList', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'BubbleItem');
  return { wrapSSR, hashId };
}
