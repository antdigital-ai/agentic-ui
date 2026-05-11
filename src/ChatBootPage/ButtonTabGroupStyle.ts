import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genStyle: GenStyleFn<'ChatBootButtonTabGroup'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0',
      // disabled 样式统一由 ButtonTab 自身的 &-disabled 规则负责，此处不重复定义
    },
  };
};

const useGenStyle = genStyleHooks('ChatBootButtonTabGroup', genStyle);

/**
 * ButtonTabGroup 组件样式
 */
export const useStyle = (prefixCls?: string) => {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'ChatBootButtonTabGroup');
  return { wrapSSR, hashId };
};
