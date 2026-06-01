/** 文件树叶子节点 key 前缀（与 Ant Design Tree 约定，常见于懒加载场景） */
export const FILE_TREE_LEAF_KEY_PREFIX = 'file:';

/** 文件树目录节点 key 前缀 */
export const FILE_TREE_DIR_KEY_PREFIX = 'dir:';

/**
 * 工作区平铺列表 FileNode.id 常用前缀（业务侧约定，用于下载/预览/定位）
 * @description 与 {@link FILE_TREE_LEAF_KEY_PREFIX} 可通过相对路径互相关联
 */
export const WORKSPACE_FILE_NODE_ID_PREFIX = 'workspace:';

/**
 * 将树 key 或 FileNode.id 解析为工作区相对路径
 * @returns 相对路径；目录 key（`dir:`）或空串时返回 `null`
 */
export const fileIdOrTreeKeyToRelativePath = (
  idOrKey: string,
): string | null => {
  if (!idOrKey) {
    return null;
  }
  if (idOrKey.startsWith(FILE_TREE_DIR_KEY_PREFIX)) {
    return null;
  }
  if (idOrKey.startsWith(WORKSPACE_FILE_NODE_ID_PREFIX)) {
    const path = idOrKey.slice(WORKSPACE_FILE_NODE_ID_PREFIX.length);
    return path || null;
  }
  if (idOrKey.startsWith(FILE_TREE_LEAF_KEY_PREFIX)) {
    const path = idOrKey.slice(FILE_TREE_LEAF_KEY_PREFIX.length);
    return path || null;
  }
  return idOrKey;
};
