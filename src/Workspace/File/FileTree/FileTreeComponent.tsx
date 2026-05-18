import { FileFolders } from '@sofa-design/icons';
import { ConfigProvider, Empty, Tree, Typography } from 'antd';
import type { DataNode, EventDataNode, TreeProps } from 'antd/es/tree';
import type { AntdTreeNodeAttribute } from 'antd/es/tree/Tree';
import classNames from 'clsx';
import React, {
  type FC,
  type Key,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRefFunction } from '../../../Hooks/useRefFunction';
import { I18nContext, compileTemplate } from '../../../I18n';
import type { FileNode, FileTreeNode, FileTreeProps } from '../../types';
import { getFileType } from '../../types';
import { ensureNodeWithId } from '../handlers';
import { getFileTypeIcon } from '../utils';
import { FileTreeLeafTitle } from './FileTreeLeafTitle';
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

const resolveTreeLeafFile = (node: FileTreeNode): FileNode | null => {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const resolvedIsLeaf = node.isLeaf ?? !hasChildren;
  if (!resolvedIsLeaf) {
    return null;
  }

  if (node.file !== undefined && node.file !== null) {
    return ensureNodeWithId({
      ...node.file,
      name: node.file.name ?? node.name,
      id: node.file.id ?? node.id ?? node.key,
    });
  }

  return ensureNodeWithId({
    name: node.name,
    id: node.id ?? node.key,
  });
};

const mapTreeToDataNodes = (
  nodes: FileTreeNode[],
  ctx: {
    prefixCls: string;
    hashId: string;
    locale?: Record<string, any>;
    onDownload?: (file: FileNode) => void;
    onPreview?: FileTreeProps['onPreview'];
    onShare?: FileTreeProps['onShare'];
    onLocate?: (file: FileNode) => void;
  },
): DataNode[] =>
  nodes.map((node) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const resolvedIsLeaf = node.isLeaf ?? !hasChildren;

    if (resolvedIsLeaf) {
      const leafFile = resolveTreeLeafFile(node);
      const title =
        leafFile !== null ? (
          <FileTreeLeafTitle
            node={
              { ...node, file: leafFile } as FileTreeNode & {
                file: FileNode;
              }
            }
            prefixCls={ctx.prefixCls}
            hashId={ctx.hashId}
            locale={ctx.locale}
            onDownload={ctx.onDownload}
            onPreview={ctx.onPreview}
            onShare={ctx.onShare}
            onLocate={ctx.onLocate}
          />
        ) : (
          node.name
        );

      return {
        key: node.key,
        title,
        isLeaf: true,
        disabled: node.disabled,
      } as DataNode;
    }

    return {
      key: node.key,
      title: node.name,
      isLeaf: false,
      disabled: node.disabled,
      children: hasChildren
        ? mapTreeToDataNodes(node.children as FileTreeNode[], ctx)
        : [],
    } as DataNode;
  });

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

/**
 * 仅对已展开目录下的已加载子树做名称匹配；未展开目录内的节点不参与匹配
 */
const filterFileTreeByExpandedKeyword = (
  nodes: FileTreeNode[],
  expandedSet: Set<string>,
  rawKeyword: string,
): FileTreeNode[] => {
  const q = rawKeyword.trim().toLowerCase();
  if (!q) return nodes;

  const visit = (node: FileTreeNode): FileTreeNode | null => {
    const selfMatch = node.name.toLowerCase().includes(q);
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const resolvedIsLeaf = node.isLeaf ?? !hasChildren;

    if (resolvedIsLeaf) {
      return selfMatch ? node : null;
    }

    if (!expandedSet.has(node.key)) {
      return { ...node, children: node.children ?? [] };
    }

    const rawChildren = node.children ?? [];
    if (rawChildren.length === 0 && node.isLeaf === false) {
      return { ...node, children: [] };
    }

    const filteredChildren = rawChildren
      .map(visit)
      .filter((n): n is FileTreeNode => Boolean(n));

    if (selfMatch || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  };

  return nodes.map(visit).filter((n): n is FileTreeNode => Boolean(n));
};

const collectSubtreeKeys = (nodes: FileTreeNode[]): Set<string> => {
  const keys = new Set<string>();
  const walk = (ns: FileTreeNode[]) => {
    for (const n of ns) {
      keys.add(n.key);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return keys;
};

const FileTreeComponent: FC<FileTreeProps> = ({
  tab: _tab,
  className,
  style,
  treeData,
  onLoadChildren,
  onSelect,
  onFileClick,
  onDownload,
  onPreview,
  onShare,
  onLocate,
  showLine = true,
  resetKey: _resetKey,
  emptyRender,
  blockNode = true,
  filterKeyword,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const prefixCls = getPrefixCls('workspace-file-tree');
  const { wrapSSR, hashId } = useFileTreeStyle(prefixCls);

  const [innerTree, setInnerTree] = useState<FileTreeNode[]>(treeData);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

  const nodeMap = useMemo(() => buildMap(innerTree), [innerTree]);

  const onLoadChildrenRef = useRefFunction(onLoadChildren);

  useEffect(() => {
    setInnerTree(treeData);
  }, [treeData]);

  useEffect(() => {
    if (_resetKey === undefined) return;
    setExpandedKeys([]);
  }, [_resetKey]);

  const expandedSet = useMemo(
    () => new Set(expandedKeys.map((k) => String(k))),
    [expandedKeys],
  );

  const displayTree = useMemo(() => {
    if (!filterKeyword?.trim()) return innerTree;
    return filterFileTreeByExpandedKeyword(
      innerTree,
      expandedSet,
      filterKeyword,
    );
  }, [innerTree, expandedSet, filterKeyword]);

  const keysInDisplayTree = useMemo(
    () => collectSubtreeKeys(displayTree),
    [displayTree],
  );

  const safeExpandedKeys = useMemo(
    () => expandedKeys.filter((k) => keysInDisplayTree.has(String(k))),
    [expandedKeys, keysInDisplayTree],
  );

  const dataNodes = useMemo(
    () =>
      mapTreeToDataNodes(displayTree, {
        prefixCls,
        hashId,
        locale,
        onDownload,
        onPreview,
        onShare,
        onLocate,
      }) as NonNullable<TreeProps['treeData']>,
    [
      displayTree,
      prefixCls,
      hashId,
      locale,
      onDownload,
      onPreview,
      onShare,
      onLocate,
    ],
  );

  const handleLoadData = useRefFunction((treeNode: EventDataNode<DataNode>) => {
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
  });

  const handleSelect: NonNullable<TreeProps['onSelect']> = useRefFunction(
    (_keys, info) => {
      if (!info.selected) return;
      const k = String(info.node.key);
      const n = nodeMap.get(k);
      if (!n) return;
      onSelect?.(n);
      const file = resolveTreeLeafFile(n);
      if (!file || n.disabled === true) return;
      if (onFileClick) {
        onFileClick(file);
      } else if (onPreview) {
        void onPreview(file);
      }
    },
  );

  const handleExpand: NonNullable<TreeProps['onExpand']> = useRefFunction(
    (keys) => {
      setExpandedKeys(keys);
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

  const showEmpty = innerTree.length === 0;
  const showFilterNoMatch =
    innerTree.length > 0 &&
    Boolean(filterKeyword?.trim()) &&
    displayTree.length === 0;

  const filterEmptyState: 'rootsNoMatch' | 'expandedNoMatch' | null =
    showFilterNoMatch
      ? expandedSet.size > 0
        ? 'expandedNoMatch'
        : 'rootsNoMatch'
      : null;

  const filterNoMatchNode =
    filterEmptyState === null ? null : (
      <Typography.Text
        type="secondary"
        data-testid="file-tree-filter-empty"
        data-state={filterEmptyState}
      >
        {compileTemplate(
          filterEmptyState === 'expandedNoMatch'
            ? (locale?.['workspace.treeFilterNoMatchInExpanded'] ??
                '已在展开目录的已加载内容中查找，未找到与「${keyword}」匹配的结果')
            : (locale?.['workspace.treeFilterNoMatchVisibleRoots'] ??
                '当前可见列表中未找到与「${keyword}」匹配的文件'),
          { keyword: String(filterKeyword ?? '').trim() },
        )}
      </Typography.Text>
    );

  return wrapSSR(
    <div
      className={classNames(prefixCls, hashId, className)}
      style={style}
      data-testid="workspace-file-tree"
    >
      {showEmpty ? (
        (emptyNode ?? defaultEmpty)
      ) : showFilterNoMatch ? (
        filterNoMatchNode
      ) : (
        <Tree
          className={classNames(`${prefixCls}-tree`, hashId)}
          showLine={showLine}
          showIcon
          blockNode={blockNode}
          expandedKeys={safeExpandedKeys}
          onExpand={handleExpand}
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
