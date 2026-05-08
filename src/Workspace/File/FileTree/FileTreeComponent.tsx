import { FileFolders } from '@sofa-design/icons';
import { ConfigProvider, Empty, Tree } from 'antd';
import type { DataNode, EventDataNode, TreeProps } from 'antd/es/tree';
import type { AntdTreeNodeAttribute } from 'antd/es/tree/Tree';
import classNames from 'clsx';
import React, {
  type FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRefFunction } from '../../../Hooks/useRefFunction';
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
  const hasChildren = Boolean(children && children.length > 0);
  // `isLeaf: false` = 目录；未传时：有子节点 = 目录，无子节点 = 视为文件（与懒加载目录需显式 `isLeaf: false` 一致）
  const resolvedIsLeaf = isLeaf ?? !hasChildren;

  if (resolvedIsLeaf) {
    return {
      key,
      title: name,
      isLeaf: true,
      disabled,
    } as DataNode;
  }

  return {
    key,
    title: name,
    isLeaf: false,
    disabled,
    children: hasChildren ? (children as FileTreeNode[]).map(toDataNode) : [],
  } as DataNode;
};

const replaceNodeChildren = (
  nodes: FileTreeNode[],
  key: string,
  newChildren: FileTreeNode[],
): FileTreeNode[] => {
  return nodes.map((n) => {
    if (n.key === key) {
      return {
        ...n,
        children: newChildren,
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
  resetKey: _resetKey,
  emptyRender,
  blockNode = true,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const prefixCls = getPrefixCls('workspace-file-tree');
  const { wrapSSR, hashId } = useFileTreeStyle(prefixCls);

  const [innerTree, setInnerTree] = useState<FileTreeNode[]>(treeData);

  const nodeMap = useMemo(() => buildMap(innerTree), [innerTree]);

  const onLoadChildrenRef = useRefFunction(onLoadChildren);

  useEffect(() => {
    setInnerTree(treeData);
  }, [treeData]);

  const dataNodes = useMemo(
    () => innerTree.map(toDataNode) as NonNullable<TreeProps['treeData']>,
    [innerTree],
  );

  const handleLoadData = useRefFunction(
    (treeNode: EventDataNode<DataNode>) => {
      const k = String(treeNode.key);
      const source = nodeMap.get(k);
      if (!source) {
        return Promise.resolve();
      }
      if (source.isLeaf === true) {
        return Promise.resolve();
      }
      if (
        source.isLeaf === undefined &&
        (!source.children || source.children.length === 0)
      ) {
        return Promise.resolve();
      }
      if (source.children && source.children.length > 0) {
        return Promise.resolve();
      }

      // 须让 `Promise` 在失败时 reject，以便 rc-tree 不将 key 记为已加载，从而可再次展开重试
      return Promise.resolve(onLoadChildrenRef(source))
        .then((loaded) => {
          const children = loaded ?? [];
          setInnerTree((prev) => replaceNodeChildren(prev, k, children));
        })
        .catch((error) => {
          console.error('Failed to load tree children:', error);
          // 返回 reject 以便 rc-tree 不将 key 记为已加载，允许重试
          throw error;
        });
    },
  );

  const handleSelect: NonNullable<TreeProps['onSelect']> = useRefFunction(
    (_keys, info) => {
      if (!onSelect) return;
      if (!info.selected) return;
      const k = String(info.node.key);
      const n = nodeMap.get(k);
      if (n) onSelect(n);
    },
  );

  const handleTreeIcon: TreeProps['icon'] = useRefFunction(
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
            `${prefixCls}-icon--folder`,
            hashId,
          )}
          aria-hidden
        >
          <FileFolders />
        </span>
      );
    },
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
