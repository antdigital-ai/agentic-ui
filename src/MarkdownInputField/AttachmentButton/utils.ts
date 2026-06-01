import type { AttachmentFile } from './types';

/**
 * 将KB转换为可读的文件大小格式
 * 支持从字节（B）到TB的所有单位，最小单位为B
 *
 * @param {number} kb - 文件大小（KB）
 * @returns {string} 格式化后的文件大小字符串
 *
 * @example
 * kbToSize(1073741824) // "1 TB"
 * kbToSize(1048576) // "1 GB"
 * kbToSize(1024) // "1 MB"
 * kbToSize(512) // "512 KB"
 * kbToSize(1) // "1 KB"
 * kbToSize(0.5) // "512 B"
 * kbToSize(0.1) // "102.4 B"
 * kbToSize(0.0001) // "0.1 B"
 * kbToSize(0) // "0 B"
 */
export const kbToSize = (kb: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const bytes = kb * 1024;

  // 处理边界情况：0或负数直接返回0 B
  if (bytes <= 0) {
    return '0 B';
  }

  // 如果小于1KB，直接返回字节
  if (bytes < 1024) {
    return parseFloat(bytes.toFixed(2)) + ' ' + sizes[0];
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 检查文件是否为图片类型
 * 通过 MIME 类型和文件扩展名双重判断
 *
 * @param {File} file - 要检查的文件
 * @returns {boolean} 是否为图片文件
 */
export const isImageFile = (file: File): boolean => {
  // 首先检查 MIME 类型
  if (file?.type?.startsWith('image/')) {
    return true;
  }

  // 如果 MIME 类型不可用或不准确，检查文件扩展名
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.ico',
    '.tiff',
    '.tif',
  ];

  const fileName = file.name.toLowerCase();
  return imageExtensions.some((ext) => fileName.endsWith(ext));
};

const VIDEO_EXTENSIONS = [
  '.mp4',
  '.webm',
  '.ogg',
  '.ogv',
  '.mov',
  '.avi',
  '.wmv',
  '.flv',
  '.m4v',
  '.mkv',
];

const hasVideoExtension = (pathOrName: string): boolean => {
  const lower = pathOrName?.toLowerCase() || '';
  const beforeQuery = lower.split('?')[0];
  return VIDEO_EXTENSIONS.some((ext) => beforeQuery.endsWith(ext));
};

/**
 * 检查文件是否为视频类型
 * 通过 MIME 类型和文件扩展名双重判断
 *
 * @param {File} file - 要检查的文件（含 AttachmentFile）
 * @returns {boolean} 是否为视频文件
 */
export const isVideoFile = (file: File): boolean => {
  if (file.type?.startsWith('video/')) {
    return true;
  }

  if (hasVideoExtension(file.name)) {
    return true;
  }

  const attachmentFile = file as File & { url?: string; previewUrl?: string };
  const url = attachmentFile.previewUrl || attachmentFile.url;
  return !!url && hasVideoExtension(url);
};

/**
 * 检查文件是否为可展示的媒体类型（图片或视频）
 */
export const isMediaFile = (file: File): boolean =>
  isImageFile(file) || isVideoFile(file);

/**
 * 是否为「仅元信息占位」状态：有 status 但无 url/previewUrl，内容未拿到时整行以 FileMetaPlaceholder 风格展示
 */
export const isAttachmentFileLoading = (
  status?: AttachmentFile['status'] | null,
): boolean => status === 'uploading' || status === 'pending';

/**
 * 是否应该展示 FileMetaPlaceholder：
 * - 有状态
 * - 非 loading（uploading/pending）
 * - 且没有可预览 URL
 */
export const isFileMetaPlaceholderState = (file: AttachmentFile): boolean =>
  file.status !== undefined &&
  file.status !== null &&
  !isAttachmentFileLoading(file.status) &&
  !file.url &&
  !file.previewUrl;

/**
 * 设备 / 环境检测函数已统一迁移到 `src/Utils/env.ts`。
 *
 * 此处保留 re-export 以维持模块外部既有的导入路径不变（包含
 * `src/index.ts` 与 `tests/AttachmentButtonPopover.branches.test.tsx` 等）。
 * 新代码请直接从 `src/Utils/env` 导入。
 */
export {
  getDeviceBrand,
  isMobileDevice,
  isOppoDevice,
  isVivoDevice,
  isVivoOrOppoDevice,
  isWeChat,
} from '../../Utils/env';
