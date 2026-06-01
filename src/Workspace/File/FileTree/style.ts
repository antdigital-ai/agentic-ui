import { genStyleHooks, type GenStyleFn } from '../../../Hooks/useStyle';

/** Workspace 文件树每级缩进（px）；antd Tree 通过 indent-unit 宽度控制 */
const FILE_TREE_INDENT_SIZE = 12;

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
        [`${antCls}-tree-indent-unit`]: {
          width: FILE_TREE_INDENT_SIZE,
        },
        [`${antCls}-tree-list-holder-inner ${antCls}-tree-node-content-wrapper`]:
          {
            display: 'flex',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
          },
        [`${antCls}-tree-title`]: {
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          minWidth: 0,
          maxWidth: '100%',
          height: 32,
          lineHeight: '32px',
          overflow: 'hidden',
        },
        [`${componentCls}-node-title`]: {
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        },
      },
    },
  };
};

const useGenStyle = genStyleHooks('WorkspaceFileTree', genStyle);

export function useFileTreeStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'WorkspaceFileTree');
  return { hashId };
}
