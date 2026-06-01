import type { FileNode, GroupNode } from '../types';
import { fileIdOrTreeKeyToRelativePath } from './workspaceFileId';

const walkFileNodes = (
  nodes: (FileNode | GroupNode)[],
  index: Map<string, FileNode>,
) => {
  for (const node of nodes) {
    if ('children' in node) {
      walkFileNodes(node.children, index);
      continue;
    }

    const file = node as FileNode;
    if (file.id) {
      const relativePath = fileIdOrTreeKeyToRelativePath(file.id);
      if (relativePath) {
        index.set(relativePath, file);
      }
    }
  }
};

/**
 * 按工作区相对路径索引平铺 {@link FileNode}
 * @description 供文件树叶子与 `Workspace.File` 的 `nodes` 对齐（如 `file:` 树 key 与 `workspace:` 列表 id）
 */
export const buildFileNodeRelativePathIndex = (
  nodes: (FileNode | GroupNode)[],
): Map<string, FileNode> => {
  const index = new Map<string, FileNode>();
  walkFileNodes(nodes, index);
  return index;
};
