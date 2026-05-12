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
 *
 * 注意：旧实现 styleFn 返回 `[genStyle, resetComponent]`，即 resetComponent
 * 后写，其 `padding: 0` 会在 CSS 级联里覆盖 genStyle 的 `padding: var(--padding-6x)`，
 * 实际渲染时容器是 `padding: 0`。这里必须保留同样的顺序，避免迁移后默认内边距
 * 变成 24px，破坏既有视觉。
 */
const useGenStyle = genStyleHooks('BubbleList', (token, info) => [
  genStyle(token, info),
  resetComponent(token),
]);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'BubbleItem');
  return { wrapSSR, hashId };
}
