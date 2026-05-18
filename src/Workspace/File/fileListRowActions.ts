import type { FileNode, FileProps } from '../types';
import { fileTypeProcessor, isImageFile } from './FileTypeProcessor';

/**
 * 平铺列表与文件树叶子共用：是否展示下载操作（与 {@link FileItem} 行为一致）
 */
export const shouldShowFileDownloadAction = (
  file: FileNode,
  onDownload?: (f: FileNode) => void,
): boolean => {
  if (file.canDownload !== undefined) {
    return file.canDownload;
  }
  return Boolean(onDownload || file.url || file.content || file.file);
};

/**
 * 平铺列表与文件树叶子共用：是否展示预览操作（与 {@link FileItem} 行为一致）
 */
export const shouldShowFilePreviewAction = (
  file: FileNode,
  onPreview?: FileProps['onPreview'],
): boolean => {
  if (file.canPreview !== undefined) {
    return file.canPreview;
  }
  return Boolean(
    onPreview &&
    (isImageFile(file)
      ? !!(file.url || file.previewUrl)
      : fileTypeProcessor.processFile(file).canPreview),
  );
};
