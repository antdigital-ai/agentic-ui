import { genStyleHooks, type GenStyleFn } from '../../../Hooks/useStyle';

const genStyle: GenStyleFn<'WorkspaceFileTree'> = (token) => {
  const { componentCls, antCls } = token;

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
        minWidth: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        background: 'transparent',

        [`${componentCls}-icon`]: {
          height: 32,
          lineHeight: '32px',
        },
        [`${antCls}-tree-treenode`]: {
          alignItems: 'center',
        },
        [`${antCls}-tree-switcher`]: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          height: 32,
          lineHeight: '32px',
        },
        [`&${antCls}-tree-block-node ${antCls}-tree-list-holder-inner ${antCls}-tree-node-content-wrapper`]:
          {
            display: 'flex',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
          },
        [`${antCls}-tree-title`]: {
          display: 'inline-flex',
          alignItems: 'center',
          flex: 1,
          minWidth: 0,
          height: 32,
          lineHeight: '32px',
          overflow: 'hidden',
          [`&:not(:has(.${componentCls}-leaf-title))`]: {
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
  };
};

const useGenStyle = genStyleHooks('WorkspaceFileTree', genStyle);

export function useFileTreeStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'WorkspaceFileTree');
  return { wrapSSR, hashId };
}
