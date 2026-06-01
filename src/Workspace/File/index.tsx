export { FileComponent as File } from './FileComponent';
export { FileTree } from './FileTree';
export { PreviewComponent } from './PreviewComponent';
export type { PreviewComponentProps } from './PreviewComponent';

// 导出类型和工具函数
export { getFileType, getFileTypeName } from '../types';
export type {
  FileActionRef,
  FileBuiltinActions,
  FileNode,
  FilePanelViewMode,
  FileProps,
  FileRenderContext,
  FileTreeNode,
  FileTreeProps,
  FileTreeSwitchConfig,
  FileType,
  GroupNode,
} from '../types';
export { buildFileNodeRelativePathIndex } from './buildFileNodeRelativePathIndex';
export { resolveTreeLeafFile } from './resolveTreeLeafFile';
export type { ResolveTreeLeafFileOptions } from './resolveTreeLeafFile';
export { getFileTypeIcon, getGroupIcon } from './utils';
export {
  FILE_TREE_DIR_KEY_PREFIX,
  FILE_TREE_LEAF_KEY_PREFIX,
  WORKSPACE_FILE_NODE_ID_PREFIX,
  fileIdOrTreeKeyToRelativePath,
} from './workspaceFileId';
