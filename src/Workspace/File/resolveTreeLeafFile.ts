import type { FileNode, FileTreeNode } from '../types';
import { ensureNodeWithId } from './handlers';

/**
 * 将文件树叶子节点解析为与平铺列表一致的 {@link FileNode}
 * @description 合并 `file` 与节点顶层的 url/content 等字段（兼容未包在 file 内的入参）
 */
export const resolveTreeLeafFile = (node: FileTreeNode): FileNode | null => {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const resolvedIsLeaf = node.isLeaf ?? !hasChildren;
  if (!resolvedIsLeaf) {
    return null;
  }

  const {
    key,
    name,
    children: _children,
    isLeaf: _isLeaf,
    icon: _icon,
    disabled: _treeDisabled,
    id,
    file,
    ...nodeFileFields
  } = node as FileTreeNode & Partial<FileNode>;

  return ensureNodeWithId({
    ...nodeFileFields,
    ...(file ?? {}),
    name: file?.name ?? name,
    id: file?.id ?? id ?? key,
  });
};
