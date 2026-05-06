import type { LocalKeys } from '../../I18n';
import { isImageFile } from '../AttachmentButton/utils';
import type { AttachmentFile, UploadResponse } from '../types/attachment';

/**
 * 文件上传业务函数集中位置。
 *
 * 历史背景：
 *   `upLoadFileToServer` 原先与 `AttachmentButton`（UI 按钮）共置于
 *   `src/MarkdownInputField/AttachmentButton/index.tsx`，导致：
 *     - `FileUploadManager`、`hooks/usePasteHandler`（基础设施 / 业务 hook）
 *       反向 import 一个 UI 模块，破坏「UI 模块只导出 UI」的边界；
 *     - 按钮文件超过 400 行，可读性差。
 *
 *   现在抽离为独立工具模块，`AttachmentButton/index.tsx` 仅保留 re-export
 *   兼容层（`export { upLoadFileToServer } from '../utils/uploadFile'`），
 *   维持公开 API（`@ant-design/agentic-ui` 已通过 `src/index.ts:408` 导出
 *   `upLoadFileToServer`）不变。
 */

/** 单文件上传配置 */
export type UploadProps = {
  /** 文件映射表 */
  fileMap?: Map<string, AttachmentFile>;
  /** 文件映射变更回调 */
  onFileMapChange?: (files?: Map<string, AttachmentFile>) => void;
  /** 上传函数，返回文件 URL */
  upload?: (file: AttachmentFile, index: number) => Promise<string>;
  /** 上传函数（返回完整响应） */
  uploadWithResponse?: (
    file: AttachmentFile,
    index: number,
  ) => Promise<UploadResponse>;
  /** 单文件最大大小（字节） */
  maxFileSize?: number;
  /** 最大文件数量 */
  maxFileCount?: number;
  /** 最小文件数量 */
  minFileCount?: number;
  /** 国际化文案 */
  locale?: Partial<LocalKeys>;
  /** 文件数量超出 maxFileCount 限制时的回调 */
  onExceedMaxCount?: (info: {
    maxCount: number;
    currentCount: number;
    selectedCount: number;
  }) => void;
  /** 文件超出 maxFileSize 大小限制时的回调 */
  onExceedMaxSize?: (info: { file: AttachmentFile; maxSize: number }) => void;
  /** 文件上传失败时的回调 */
  onUploadError?: (info: { file: AttachmentFile; error: unknown }) => void;
  /**
   * 上传失败时自动将文件从列表中移除（退回），不显示错误状态
   * @default false
   */
  removeFileOnUploadError?: boolean;
};

/**
 * `processFile` 中相邻两次文件上传之间的最小间隔。
 *
 * 16ms ≈ 1 帧；让 React 有机会 flush 上一次 setState（uploading）后再发起
 * 下一次同步上传，避免高频 update 在弱机型上掉帧。
 */
const WAIT_TIME_MS = 16;

const DEFAULT_MESSAGES = {
  uploading: 'Uploading...',
  uploadSuccess: 'Upload success',
  uploadFailed: 'Upload failed',
  maxFileCountExceeded: (count: number) => `最多只能上传 ${count} 个文件`,
  minFileCountRequired: (count: number) => `至少需要上传 ${count} 个文件`,
  fileSizeExceeded: (size: number) => `超过 ${size} KB`,
};

const waitTime = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const generateFileUUID = (fileName: string) => {
  return Date.now() + Math.random() * 1000 + fileName;
};

const prepareFile = (file: AttachmentFile) => {
  file.status = 'uploading';
  file.uuid = generateFileUUID(file.name);
  if (isImageFile(file)) {
    file.previewUrl = URL.createObjectURL(file);
  }
};

const getLocaleMessage = (
  locale: Partial<LocalKeys> | undefined,
  key: string,
  defaultMsg: string,
) => {
  return (locale as Record<string, string> | undefined)?.[key] || defaultMsg;
};

const validateFileSize = (
  file: AttachmentFile,
  props: UploadProps,
): boolean => {
  if (!props.maxFileSize || (file.size ?? 0) <= props.maxFileSize) return true;
  return false;
};

const updateFileMap = (
  map: Map<string, AttachmentFile>,
  file: AttachmentFile,
  onFileMapChange?: (files?: Map<string, AttachmentFile>) => void,
) => {
  if (file.uuid) {
    map.set(file.uuid, file);
    onFileMapChange?.(map);
  }
};

const uploadSingleFile = async (
  file: AttachmentFile,
  index: number,
  props: UploadProps,
): Promise<{ url?: string; isSuccess: boolean; errorMsg: string | null }> => {
  if (props.uploadWithResponse) {
    const result = await props.uploadWithResponse(file, index);
    file.uploadResponse = result;
    return {
      url: result.fileUrl,
      isSuccess: result.uploadStatus === 'SUCCESS',
      errorMsg: result.errorMessage || null,
    };
  }

  if (props.upload) {
    const url = await props.upload(file, index);
    return { url, isSuccess: !!url, errorMsg: null };
  }

  return { url: file.previewUrl, isSuccess: !!file.previewUrl, errorMsg: null };
};

const handleUploadSuccess = (
  file: AttachmentFile,
  url: string,
  map: Map<string, AttachmentFile>,
  props: UploadProps,
) => {
  file.status = 'done';
  file.url = url;
  updateFileMap(map, file, props.onFileMapChange);
};

const handleUploadError = (
  file: AttachmentFile,
  errorMsg: string | null,
  map: Map<string, AttachmentFile>,
  props: UploadProps,
  rawError?: unknown,
) => {
  if (props.removeFileOnUploadError) {
    if (file.uuid) map.delete(file.uuid);
    props.onFileMapChange?.(map);
  } else {
    file.status = 'error';
    if (errorMsg !== null) file.errorMessage = errorMsg;
    updateFileMap(map, file, props.onFileMapChange);
  }
  props.onUploadError?.({ file, error: rawError ?? errorMsg });
};

const processFile = async (
  file: AttachmentFile,
  index: number,
  map: Map<string, AttachmentFile>,
  props: UploadProps,
) => {
  await waitTime(WAIT_TIME_MS);

  if (!validateFileSize(file, props)) {
    const maxSizeKb = Math.round((props.maxFileSize || 0) / 1024);
    const raw = getLocaleMessage(
      props.locale,
      'markdownInput.fileSizeExceeded',
      DEFAULT_MESSAGES.fileSizeExceeded(maxSizeKb),
    );
    file.errorMessage = raw.includes('${maxSize}')
      ? raw.replace(/\$\{maxSize\}/g, String(maxSizeKb))
      : raw;
    file.errorCode = 'FILE_SIZE_EXCEEDED';
    file.status = 'error';
    updateFileMap(map, file, props.onFileMapChange);
    props.onExceedMaxSize?.({ file, maxSize: props.maxFileSize || 0 });
    return;
  }

  try {
    const { url, isSuccess, errorMsg } = await uploadSingleFile(
      file,
      index,
      props,
    );

    if (isSuccess && url) {
      handleUploadSuccess(file, url, map, props);
    } else {
      handleUploadError(file, errorMsg, map, props);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : getLocaleMessage(
            props.locale,
            'uploadFailed',
            DEFAULT_MESSAGES.uploadFailed,
          );
    handleUploadError(file, errorMessage, map, props, error);
  }
};

/**
 * 上传文件到服务器
 *
 * @param files - 要上传的文件列表
 * @param props - 上传配置项
 * @param props.upload - 上传函数，返回文件 URL
 * @param props.uploadWithResponse - 上传函数（返回完整响应）
 * @param props.fileMap - 文件映射表
 * @param props.onFileMapChange - 文件映射变更回调
 * @param props.maxFileSize - 单文件最大大小（字节）
 * @param props.maxFileCount - 最大文件数量
 * @param props.minFileCount - 最小文件数量
 * @param props.locale - 国际化文案
 */
export const upLoadFileToServer = async (
  files: ArrayLike<File>,
  props: UploadProps,
) => {
  const map = props.fileMap || new Map<string, AttachmentFile>();
  const existingFileCount = map.size;
  // Always notify with a new Map reference so React state setters always trigger re-renders,
  // regardless of whether the caller wraps the callback or passes a raw setState directly.
  const notifyChange = (m: Map<string, AttachmentFile>) =>
    props.onFileMapChange?.(new Map(m));

  const fileList = Array.from(files) as AttachmentFile[];
  fileList.forEach(prepareFile);

  const totalCount = fileList.length + existingFileCount;
  const isMaxExceeded =
    typeof props.maxFileCount === 'number' && totalCount > props.maxFileCount;
  const isMinNotMet =
    typeof props.minFileCount === 'number' && totalCount < props.minFileCount;

  // Wrap all internal change notifications to use notifyChange so every update
  // produces a new Map reference that React's state setter will always accept.
  const propsWithNotify: UploadProps = {
    ...props,
    onFileMapChange: notifyChange as UploadProps['onFileMapChange'],
  };

  if (isMaxExceeded || isMinNotMet) {
    if (isMaxExceeded) {
      const maxCount = props.maxFileCount!;
      const rawMessage = getLocaleMessage(
        props.locale,
        'markdownInput.maxFileCountExceeded',
        DEFAULT_MESSAGES.maxFileCountExceeded(maxCount),
      );
      const errorMessage = rawMessage.replace(
        /\$\{maxFileCount\}/g,
        String(maxCount),
      );
      fileList.forEach((file) => {
        file.status = 'error';
        file.errorCode = 'FILE_COUNT_EXCEEDED';
        file.errorMessage = errorMessage;
        if (file.uuid) map.set(file.uuid, file);
      });
      notifyChange(map);
      props.onExceedMaxCount?.({
        maxCount,
        currentCount: existingFileCount,
        selectedCount: fileList.length,
      });
    }
    return;
  }

  // 验证通过后再添加到 fileMap
  fileList.forEach((file) =>
    updateFileMap(map, file, notifyChange as UploadProps['onFileMapChange']),
  );

  try {
    for (let i = 0; i < fileList.length; i++) {
      await processFile(fileList[i], i, map, propsWithNotify);
    }
  } catch (error) {
    fileList.forEach((file) => {
      file.status = 'error';
      updateFileMap(map, file, notifyChange as UploadProps['onFileMapChange']);
    });
  }
};
