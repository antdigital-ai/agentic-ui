import { FileFolders } from '@sofa-design/icons';
import { ConfigProvider, Empty, Tree } from 'antd';
import type { DataNode, EventDataNode, TreeProps } from 'antd/es/tree';
import type { AntdTreeNodeAttribute } from 'antd/es/tree/Tree';
import classNames from 'clsx';
import React, {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { I18nContext } from '../../../I18n';
import type { FileTreeNode, FileTreeProps } from '../../types';
import { getFileType } from '../../types';
import { getFileTypeIcon } from '../utils';
import { useFileTreeStyle } from './style';

const walkAndIndex = (
  nodes: FileTreeNode[],
  map: Map<string, FileTreeNode>,
) => {
  for (const n of nodes) {
    map.set(n.key, n);
    if (n.children?.length) {
      walkAndIndex(n.children, map);
    }
  }
};

const toDataNode = (node: FileTreeNode): DataNode => {
  const { key, name, isLeaf, disabled, children } = node;
  return {
    key,
    title: name,
    isLeaf,
    disabled,
    children:
      children && children.length > 0
        ? children.map(toDataNode)
        : isLeaf
          ? undefined
          : [],
  } as DataNode;
};

const replaceNodeChildren = (
  nodes: FileTreeNode[],
  key: string,
  newChildren: FileTreeNode[],
): FileTreeNode[] => {
  return nodes.map((n) => {
    if (n.key === key) {
      const isDirEmpty = newChildren.length === 0;
      return {
        ...n,
        children: isDirEmpty ? [] : newChildren,
        isLeaf: isDirEmpty,
      };
    }
    if (n.children?.length) {
      return {
        ...n,
        children: replaceNodeChildren(n.children, key, newChildren),
      };
    }
    return n;
  });
};

const buildMap = (nodes: FileTreeNode[]) => {
  const m = new Map<string, FileTreeNode>();
  walkAndIndex(nodes, m);
  return m;
};

const FileTreeComponent: FC<FileTreeProps> = ({
  tab: _tab,
  className,
  style,
  treeData,
  onLoadChildren,
  onSelect,
  showLine = true,
  resetKey,
  emptyRender,
  blockNode = true,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const prefixCls = getPrefixCls('workspace-file-tree');
  const { wrapSSR, hashId } = useFileTreeStyle(prefixCls);

  const [innerTree, setInnerTree] = useState<FileTreeNode[]>(treeData);
  const nodeMap = useMemo(() => buildMap(innerTree), [innerTree]);

  useEffect(() => {
    setInnerTree(treeData);
  }, [treeData, resetKey]);

  const dataNodes = useMemo(
    () => innerTree.map(toDataNode) as NonNullable<TreeProps['treeData']>,
    [innerTree],
  );

  const handleLoadData = useCallback(
    (treeNode: EventDataNode<DataNode>) => {
      const k = String(treeNode.key);
      const source = nodeMap.get(k);
      if (!source) {
        return Promise.resolve();
      }
      if (source.isLeaf) {
        return Promise.resolve();
      }
      if (source.children && source.children.length > 0) {
        return Promise.resolve();
      }

      return Promise.resolve(onLoadChildren(source))
        .then((loaded) => {
          setInnerTree((prev) => replaceNodeChildren(prev, k, loaded));
        })
        .catch(() => {
          setInnerTree((prev) => replaceNodeChildren(prev, k, []));
        });
    },
    [onLoadChildren, nodeMap],
  );

  const handleSelect: NonNullable<TreeProps['onSelect']> = useCallback(
    (_keys, info) => {
      if (!onSelect) return;
      if (!info.selected) return;
      const k = String(info.node.key);
      const n = nodeMap.get(k);
      if (n) onSelect(n);
    },
    [nodeMap, onSelect],
  );

  const handleTreeIcon: TreeProps['icon'] = useCallback(
    (iconProps: AntdTreeNodeAttribute) => {
      const k = String(iconProps.eventKey);
      const n = nodeMap.get(k);

      if (n?.icon) {
        return (
          <span className={classNames(`${prefixCls}-icon`, hashId)}>
            {n.icon}
          </span>
        );
      }

      if (iconProps.isLeaf) {
        const fileName = n?.name ?? '';
        const fileType = getFileType(fileName);
        return (
          <span className={classNames(`${prefixCls}-icon`, hashId)} aria-hidden>
            {getFileTypeIcon(fileType, undefined, fileName)}
          </span>
        );
      }

      return (
        <span
          className={classNames(
            `${prefixCls}-icon`,
            hashId,
            `${prefixCls}-icon--folder`,
            hashId,
          )}
          aria-hidden
        >
          <FileFolders />
        </span>
      );
    },
    [hashId, nodeMap, prefixCls],
  );

  const showEmpty = innerTree.length === 0;
  const emptyNode =
    typeof emptyRender === 'function'
      ? (emptyRender as () => React.ReactNode)()
      : emptyRender;
  const defaultEmpty = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={locale?.['workspace.empty'] ?? '暂无数据'}
    />
  );

  return wrapSSR(
    <div
      className={classNames(prefixCls, hashId, className)}
      style={style}
      data-testid="workspace-file-tree"
    >
      {showEmpty ? (
        (emptyNode ?? defaultEmpty)
      ) : (
        <Tree
          className={classNames(`${prefixCls}-tree`, hashId)}
          showLine={showLine}
          showIcon
          blockNode={blockNode}
          loadData={handleLoadData}
          onSelect={handleSelect}
          treeData={dataNodes}
          icon={handleTreeIcon}
        />
      )}
    </div>,
  );
};

FileTreeComponent.displayName = 'FileTree';

export { FileTreeComponent as FileTree };
