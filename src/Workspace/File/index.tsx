export { FileComponent as File } from './FileComponent';
export { PreviewComponent } from './PreviewComponent';
export type { PreviewComponentProps } from './PreviewComponent';

// 导出类型和工具函数
export type {
  FileActionRef,
  FileBuiltinActions,
  FileNode,
  FileProps,
  FileRenderContext,
  FileType,
  GroupNode,
} from '../types';
export { getFileTypeIcon, getGroupIcon } from './utils';
