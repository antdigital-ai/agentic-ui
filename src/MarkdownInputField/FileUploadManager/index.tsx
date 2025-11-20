import { message } from 'antd';
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

  // 判断是否所有文件上传完成
  const fileUploadDone = fileMap?.size
    ? Array.from(fileMap?.values() || []).every(
        (file) => file.status === 'done',
      )
    : true;

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

    // 检查是否已达到最大文件数量限制
    const currentFileCount = fileMap?.size || 0;
    if (
      attachment?.maxFileCount &&
      currentFileCount >= attachment.maxFileCount
    ) {
      const errorMsg = locale?.['markdownInput.maxFileCountExceeded']
        ? locale['markdownInput.maxFileCountExceeded'].replace(
            '${maxFileCount}',
            String(attachment.maxFileCount),
          )
        : `最多只能上传 ${attachment.maxFileCount} 个文件`;
      message.error(errorMsg);
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
        await upLoadFileToServer(e.target.files, {
          ...attachment,
          fileMap,
          onFileMapChange: (newFileMap) => {
            updateAttachmentFiles(newFileMap);
          },
          locale,
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
      let errorMsg: string | null = null;

      // 优先使用 uploadWithResponse，然后使用 upload
      if (attachment?.uploadWithResponse) {
        const uploadResult = await attachment.uploadWithResponse(file, 0);
        url = uploadResult.fileUrl;
        isSuccess = uploadResult.uploadStatus === 'SUCCESS';
        errorMsg = uploadResult.errorMessage || null;
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
        message.success(locale?.uploadSuccess || 'Upload success');
      } else {
        file.status = 'error';
        map.set(file.uuid || '', file);
        updateAttachmentFiles(map);
        const failedMsg = errorMsg || locale?.uploadFailed || 'Upload failed';
        message.error(failedMsg);
      }
    } catch (error) {
      console.error('Error retrying file upload:', error);
      file.status = 'error';
      const map = new Map(fileMap);
      map.set(file.uuid || '', file);
      updateAttachmentFiles(map);
      const errorMessage =
        error instanceof Error
          ? error.message
          : locale?.uploadFailed || 'Upload failed';
      message.error(errorMessage);
    }
  });

  return {
    fileMap,
    fileUploadDone,
    supportedFormat,
    uploadImage,
    updateAttachmentFiles,
    handleFileRemoval,
    handleFileRetry,
  };
};
