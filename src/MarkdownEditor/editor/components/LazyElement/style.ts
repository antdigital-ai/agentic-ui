import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../../../../Hooks/useStyle';

/**
 * LazyElement 样式生成器
 */
const genLazyElementStyle: GenStyleFn<'LazyElement'> = (token) => {
  return {
    [`${token.componentCls}`]: {
      position: 'relative',
      width: '100%',
    },
  };
};

/**
 * LazyElement 组件样式 Hook
 */
const useGenStyle = genStyleHooks('LazyElement', (token, info) => [
  resetComponent(token),
  genLazyElementStyle(token, info),
]);

export const useStyle = (prefixCls?: string) => {
  const [, hashId] = useGenStyle(prefixCls ?? 'LazyElement');
  return { hashId };
};
