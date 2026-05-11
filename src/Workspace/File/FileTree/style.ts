import { genStyleHooks, type GenStyleFn } from '../../../Hooks/useStyle';

const genStyle: GenStyleFn<'WorkspaceFileTree'> = (token) => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: 'var(--margin-2x) var(--margin-3x)',

      [`${componentCls}-tree`]: {
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        background: 'transparent',
      },
    },
  };
};

const useGenStyle = genStyleHooks('WorkspaceFileTree', genStyle);

export function useFileTreeStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'WorkspaceFileTree');
  return { wrapSSR, hashId };
}
