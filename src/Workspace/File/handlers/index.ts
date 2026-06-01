import type { FileNode, GroupNode } from '../../types';
import { generateUniqueId } from '../utils';

/**
 * 通用键盘事件处理函数：响应 Enter / Space 触发回调
 */
export const handleKeyboardEvent = (
  e: React.KeyboardEvent,
  callback: (e: React.KeyboardEvent) => void,
) => {
  if (e.key === 'Enter' || e.key === ' ') {
    callback(e);
  }
};

/**
 * 浏览器端默认下载行为：根据 url / content / file 创建下载链接并触发点击
 * Blob URL 在结束后会被立即 revokeObjectURL 回收
 */
export const handleFileDownload = (file: FileNode) => {
  let blobUrl: string | null = null;

  try {
    const link = document.createElement('a');

    if (file.url) {
      link.href = file.url;
    } else if (file.content) {
      const blob = new Blob([file.content], { type: 'text/plain' });
      blobUrl = URL.createObjectURL(blob);
      link.href = blobUrl;
    } else if (file.file instanceof File || file.file instanceof Blob) {
      blobUrl = URL.createObjectURL(file.file);
      link.href = blobUrl;
    } else {
      return;
    }

    link.download =
      file.name || (file.file instanceof File ? file.file.name : '');

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }
};

/**
 * 默认分享行为：复制可分享的 URL 到剪贴板
 * 复制失败时静默处理，避免打断用户流程
 */
export const handleDefaultShare = async (file: FileNode) => {
  try {
    const shareUrl = file.url || file.previewUrl || window.location.href;
    await navigator.clipboard.writeText(shareUrl);
  } catch {
    // 复制失败时静默处理
  }
};

/**
 * 确保节点拥有唯一 ID（不可变更新）
 */
export const ensureNodeWithId = <T extends FileNode | GroupNode>(
  node: T,
): T => ({
  ...node,
  id: node.id || generateUniqueId(node),
});

/**
 * 获取文件预览源：优先 previewUrl，其次 url，否则空字符串
 */
export const getPreviewSource = (file: FileNode): string => {
  return file.previewUrl || file.url || '';
};
