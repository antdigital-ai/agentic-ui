import { useContext } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { I18nContext } from '../../I18n';
import type { AttachmentButtonProps } from '../AttachmentButton';
import { upLoadFileToServer } from '../AttachmentButton';
import type { AttachmentButtonPopoverProps } from '../AttachmentButton/AttachmentButtonPopover';
import { SupportedFileFormats } from '../AttachmentButton/AttachmentButtonPopover';
import type { AttachmentFile } from '../AttachmentButton/types';
import {
  isMobileDevice,
  isVivoOrOppoDevice,
  isWeChat,
} from '../AttachmentButton/utils';

type SupportedFileFormatsType = AttachmentButtonPopoverProps['supportedFormat'];

export interface FileUploadManagerProps {
  /** 附件配置 */
  attachment?: {
    enable?: boolean;
    supportedFormat?: SupportedFileFormatsType;
  } & AttachmentButtonProps;

  /** 文件映射表 */
  fileMap?: Map<string, AttachmentFile>;

  /** 文件映射表变化回调 */
  onFileMapChange?: (fileMap?: Map<string, AttachmentFile>) => void;
}

export interface FileUploadManagerReturn {
  /** 文件映射表 */
  fileMap?: Map<string, AttachmentFile>;

  /** 文件上传是否完成 */
  fileUploadDone: boolean;

  /** 文件上传状态 */
  fileUploadStatus: 'uploading' | 'done' | 'error';

  /** 文件上传状态统计 */
  fileUploadSummary: {
    totalCount: number;
    doneCount: number;
    uploadingCount: number;
    errorCount: number;
  };

  /** 支持的文件格式 */
  supportedFormat: SupportedFileFormatsType;

  /** 上传图片 */
  uploadImage: (forGallery?: boolean) => Promise<void>;

  /** 更新附件文件列表 */
  updateAttachmentFiles: (newFileMap?: Map<string, AttachmentFile>) => void;

  /** 处理文件删除 */
  handleFileRemoval: (file: AttachmentFile) => Promise<void>;

  /** 处理文件重试 */
  handleFileRetry: (file: AttachmentFile) => Promise<void>;
}

/**
 * 文件上传管理器
 *
 * @description 封装文件上传相关的逻辑，包括上传、删除、重试等操作
 */
export const useFileUploadManager = ({
  attachment,
  fileMap,
  onFileMapChange,
}: FileUploadManagerProps): FileUploadManagerReturn => {
  const { locale } = useContext(I18nContext);

  const fileList = Array.from(fileMap?.values() || []);
  const uploadingCount = fileList.filter(
    (file) => file.status === 'uploading',
  ).length;
  const errorCount = fileList.filter((file) => file.status === 'error').length;
  const totalCount = fileList.length;
  const fileUploadSummary = {
    totalCount,
    uploadingCount,
    errorCount,
    // 兜底把未知状态也按完成态处理，避免统计缺口
    doneCount: Math.max(0, totalCount - uploadingCount - errorCount),
  };
  const fileUploadStatus: 'uploading' | 'done' | 'error' =
    fileUploadSummary.errorCount > 0
      ? 'error'
      : fileUploadSummary.uploadingCount > 0
        ? 'uploading'
        : 'done';
  // 向后兼容：无文件时视为已完成
  const fileUploadDone =
    fileUploadSummary.totalCount > 0 ? fileUploadStatus === 'done' : true;

  // 默认支持的文件格式
  const supportedFormat =
    attachment?.supportedFormat || SupportedFileFormats.image;

  /**
   * 更新附件文件列表
   */
  const updateAttachmentFiles = useRefFunction(
    (newFileMap?: Map<string, AttachmentFile>) => {
      onFileMapChange?.(new Map(newFileMap));
    },
  );

  /**
   * 移动设备默认的文件类型 accept 值
   */
  const MOBILE_DEFAULT_ACCEPT =
    'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.csv,text/plain,application/x-zip-compressed';

  /**
   * 根据支持的格式获取 accept 属性值
   * 优先级：微信 > 手机品牌（oppo/vivo）> 移动设备 > 相册模式 > 默认
   */
  const getAcceptValue = useRefFunction((forGallery: boolean): string => {
    // 相册模式
    if (forGallery) {
      return 'image/*';
    }

    const isMobile = isMobileDevice();
    const isVivoOrOppo = isVivoOrOppoDevice();
    const isWeChatEnv = isWeChat();
    const extensions = supportedFormat?.extensions || [];

    // 1. 微信环境最优先：设置为空字符串以打开文件浏览器
    if (isWeChatEnv) {
      return '*';
    }

    // 2. 手机品牌其次（oppo/vivo）：设置为空字符串以打开文件浏览器
    if (isVivoOrOppo) {
      return '*';
    }

    // 3. 移动设备其次：设置为空字符串以打开文件浏览器
    if (isMobile) {
      return '*';
    }

    // 4. 默认情况：使用具体扩展名列表
    return extensions.length > 0
      ? extensions.map((ext) => `.${ext}`).join(',')
      : MOBILE_DEFAULT_ACCEPT;
  });

  /**
   * 上传图片
   */
  const uploadImage = useRefFunction(async (forGallery?: boolean) => {
    // 检查是否有文件正在上传中
    let isUploading = false;
    for (const file of fileMap?.values() || []) {
      if (file.status === 'uploading') {
        isUploading = true;
        break;
      }
    }
    if (isUploading) {
      return;
    }

    const accept = getAcceptValue(forGallery || false);
    const input = document.createElement('input');
    input.id = 'uploadImage' + '_' + Math.random();
    input.type = 'file';
    input.accept = accept;
    input.multiple = attachment?.allowMultiple ?? true;
    input.style.display = 'none';

    input.onchange = async (e: any) => {
      if (input.dataset.readonly) {
        return;
      }
      input.dataset.readonly = 'true';
      try {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) {
          return;
        }

        // 检查选择的文件数量是否超过限制——超限时交由 upLoadFileToServer 统一处理
        // （upLoadFileToServer 内 validateFileCount 失败时会把文件以 error 状态入 map 并触发 onExceedMaxCount）
        await upLoadFileToServer(selectedFiles, {
          ...attachment,
          fileMap,
          onFileMapChange: (newFileMap) => {
            updateAttachmentFiles(newFileMap);
          },
          locale,
          onExceedMaxCount: attachment?.onExceedMaxCount,
        });
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        input.value = '';
        delete input.dataset.readonly;
      }
    };

    if (input.dataset.readonly) {
      return;
    }
    document.body.appendChild(input);
    input.click();
    input.remove();
  });

  /**
   * 处理文件删除
   */
  const handleFileRemoval = useRefFunction(async (file: AttachmentFile) => {
    try {
      await attachment?.onDelete?.(file);
      const map = new Map(fileMap);
      map.delete(file.uuid!);
      updateAttachmentFiles(map);
    } catch (error) {
      console.error('Error removing file:', error);
    }
  });

  /**
   * 处理文件重试
   */
  const handleFileRetry = useRefFunction(async (file: AttachmentFile) => {
    try {
      file.status = 'uploading';
      const map = new Map(fileMap);
      map.set(file.uuid || '', file);
      updateAttachmentFiles(map);

      let url: string | undefined;
      let isSuccess = false;

      // 优先使用 uploadWithResponse，然后使用 upload
      if (attachment?.uploadWithResponse) {
        const uploadResult = await attachment.uploadWithResponse(file, 0);
        url = uploadResult.fileUrl;
        isSuccess = uploadResult.uploadStatus === 'SUCCESS';
        // 将完整的响应数据存储到 file 对象中
        file.uploadResponse = uploadResult;
      } else if (attachment?.upload) {
        url = await attachment.upload(file, 0);
        isSuccess = !!url;
      }

      if (isSuccess && url) {
        file.status = 'done';
        file.url = url;
        map.set(file.uuid || '', file);
        updateAttachmentFiles(map);
      } else {
        file.status = 'error';
        map.set(file.uuid || '', file);
        updateAttachmentFiles(map);
      }
    } catch (error) {
      file.status = 'error';
      const map = new Map(fileMap);
      map.set(file.uuid || '', file);
      updateAttachmentFiles(map);
      console.error('Error retrying file upload:', error);
    }
  });

  return {
    fileMap,
    fileUploadDone,
    fileUploadStatus,
    fileUploadSummary,
    supportedFormat,
    uploadImage,
    updateAttachmentFiles,
    handleFileRemoval,
    handleFileRetry,
  };
};
