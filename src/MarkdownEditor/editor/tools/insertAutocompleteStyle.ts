import { genStyleHooks, resetComponent, type GenStyleFn } from '../../../Hooks/useStyle';

const genStyle: GenStyleFn<'InsertAutocomplete'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      '&-item': {
        display: 'flex',
        alignItems: 'center',
        height: '24px',
        lineHeight: '24px',
        gap: '4px',
        padding: '4px',
        borderRadius: '12px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgb(209 213 219 / 0.4)',
        },
      },
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('InsertAutocomplete', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  // 与 InsertAutocomplete 组件内
  // `getPrefixCls('agentic-md-editor-insert-autocomplete')` 对齐
  const [wrapSSR, hashId] = useGenStyle(
    prefixCls ?? 'agentic-md-editor-insert-autocomplete',
  );
  return { wrapSSR, hashId };
}
