import type { FileNode, FileTreeNode } from '../types';
import { ensureNodeWithId } from './handlers';
import { fileIdOrTreeKeyToRelativePath } from './workspaceFileId';

const TREE_LEAF_FILE_FIELD_KEYS = [
  'url',
  'content',
  'canPreview',
  'canDownload',
  'type',
  'size',
] as const;

export interface HasTreeLeafFileBindingOptions {
  /** 为 true 时，无显式 file 的叶子也可合成 FileNode（如树行下载/预览） */
  allowSyntheticLeaf?: boolean;
}

/** 叶子是否应绑定为可预览/下载/点击的 {@link FileNode} */
export const hasTreeLeafFileBinding = (
  node: FileTreeNode,
  options?: HasTreeLeafFileBindingOptions,
): boolean => {
  if (node.file === null) {
    return false;
  }
  if (node.file && typeof node.file === 'object') {
    return true;
  }
  const nodeRecord = node as FileTreeNode & Partial<FileNode>;
  const hasTopLevelFileFields = TREE_LEAF_FILE_FIELD_KEYS.some(
    (key) => nodeRecord[key] !== undefined,
  );
  if (hasTopLevelFileFields) {
    return true;
  }
  return options?.allowSyntheticLeaf === true;
};

export interface ResolveTreeLeafFileOptions {
  /**
   * 按相对路径索引的平铺文件节点
   * @description `Workspace.File` 在同时提供 `nodes` 与 `fileTreeSwitch` 时会自动注入，使树视图回调与列表一致
   */
  fileNodeByRelativePath?: Map<string, FileNode>;
}

const lookupFlatFileNode = (
  node: FileTreeNode,
  rawId: string,
  index: Map<string, FileNode>,
): FileNode | undefined => {
  const candidates = [
    fileIdOrTreeKeyToRelativePath(rawId),
    fileIdOrTreeKeyToRelativePath(node.key),
    node.file?.id ? fileIdOrTreeKeyToRelativePath(node.file.id) : null,
    node.id ? fileIdOrTreeKeyToRelativePath(String(node.id)) : null,
  ];

  for (const relativePath of candidates) {
    if (!relativePath) {
      continue;
    }
    const matched = index.get(relativePath);
    if (matched) {
      return matched;
    }
  }

  return undefined;
};

/**
 * 将文件树叶子节点解析为与平铺列表一致的 {@link FileNode}
 * @description 合并 `file` 与节点顶层的 url/content 等字段；若提供 {@link ResolveTreeLeafFileOptions.fileNodeByRelativePath}，则按相对路径对齐列表节点（统一 `workspace:` / `file:` 等 id 前缀）
 */
export const resolveTreeLeafFile = (
  node: FileTreeNode,
  options?: ResolveTreeLeafFileOptions,
): FileNode | null => {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const resolvedIsLeaf = node.isLeaf ?? !hasChildren;
  if (!resolvedIsLeaf) {
    return null;
  }

  if (node.file === null) {
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

  const rawId = file?.id ?? (id !== undefined ? String(id) : undefined) ?? key;

  const base = ensureNodeWithId({
    ...nodeFileFields,
    ...(file ?? {}),
    name: file?.name ?? name,
    id: rawId,
  });

  const index = options?.fileNodeByRelativePath;
  if (!index?.size) {
    return base;
  }

  const matched = lookupFlatFileNode(node, rawId, index);
  if (!matched) {
    return base;
  }

  return ensureNodeWithId({
    ...matched,
    ...base,
    id: matched.id,
    name: base.name,
  });
};
