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
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'ChartAttr-');
  return { wrapSSR, hashId };
}
