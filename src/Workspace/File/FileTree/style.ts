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
        minWidth: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        background: 'transparent',

        [`${componentCls}-leaf-title`]: {
          display: 'inline-flex',
          alignItems: 'flex-start',
          gap: token.marginXXS ?? 4,
          width: 'fit-content',
          minWidth: 0,
        },
        [`${componentCls}-leaf-title-text`]: {
          flex: 1,
          minWidth: 0,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        },
        [`.ant-tree-treenode`]: {
          alignItems: 'flex-start',
        },
        [`.ant-tree-node-content-wrapper`]: {
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        },
        [`.ant-tree-title`]: {
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        },
        [`${componentCls}-leaf-actions`]: {
          display: 'flex',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: '4px',
          flexShrink: 0,
          paddingTop: 2,
        },
        [`${componentCls}-leaf-action-btn`]: {
          [`.anticon`]: {
            color: 'var(--color-gray-text-light)',
          },
          ['&:hover .anticon, &:focus .anticon, &:active .anticon']: {
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
