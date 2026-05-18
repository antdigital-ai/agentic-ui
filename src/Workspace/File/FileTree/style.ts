import { genStyleHooks, type GenStyleFn } from '../../../Hooks/useStyle';

const genStyle: GenStyleFn<'WorkspaceFileTree'> = (token) => {
  const { componentCls, antCls, iconCls } = token;

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

        [`${componentCls}-leaf-title`]: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: token.marginXXS ?? 4,
          width: 'fit-content',
          maxWidth: '100%',
          minWidth: 0,
          overflow: 'hidden',
        },
        [`${componentCls}-leaf-title-text`]: {
          flex: 1,
          minWidth: 0,
          height: 32,
          lineHeight: '32px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
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
        [`${antCls}-tree-node-content-wrapper`]: {
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        },
        [`${antCls}-tree-title`]: {
          minWidth: 0,
          height: 32,
          lineHeight: '32px',
          overflow: 'hidden',
          [`&:not(:has(.${componentCls}-leaf-title))`]: {
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
        [`${componentCls}-leaf-actions`]: {
          display: 'flex',
          alignItems: 'center',
          alignSelf: 'center',
          gap: '4px',
          flexShrink: 0,
        },
        [`${componentCls}-leaf-action-btn`]: {
          [iconCls]: {
            color: 'var(--color-gray-text-light)',
          },
          [`&:hover ${iconCls}, &:focus ${iconCls}, &:active ${iconCls}`]: {
            color: 'var(--color-gray-text-light)',
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
