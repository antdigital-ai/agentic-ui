export { FileComponent as File } from './FileComponent';
export { FileTree } from './FileTree';
export { PreviewComponent } from './PreviewComponent';
export type { PreviewComponentProps } from './PreviewComponent';

// 导出类型和工具函数
export { getFileTypeName } from '../types';
export type {
  FileActionRef,
  FileBuiltinActions,
  FileNode,
  FileProps,
  FileRenderContext,
  FileTreeNode,
  FileTreeProps,
  FileType,
  GroupNode,
} from '../types';
export { getFileTypeIcon, getGroupIcon } from './utils';
