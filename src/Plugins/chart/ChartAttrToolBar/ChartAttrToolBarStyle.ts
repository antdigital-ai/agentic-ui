import { genStyleHooks, type GenStyleFn } from '../../../Hooks/useStyle';

const genStyle: GenStyleFn<'ChartAttrToolBar'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '6px 8px',
      width: '100%',
      borderBottom: '1px solid rgba(77, 77, 77, 0.03)',
      zIndex: 10,
      gap: '4px',
      '&-item': {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        borderRadius: '12px',
        cursor: 'pointer',
      },
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('ChartAttrToolBar', genStyle);

export function useStyle(prefixCls?: string) {
  // 与 ChartAttrToolBar 组件内 `getPrefixCls('chart-attr-toolbar')` 对齐，
  // 即使 prefixCls 缺省也保证选择器仍能命中组件 DOM
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'chart-attr-toolbar');
  return { wrapSSR, hashId };
}
