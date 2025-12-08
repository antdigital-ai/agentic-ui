import { Paperclip } from '@sofa-design/icons';
import { ConfigProvider, message } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { compileTemplate } from '../../I18n';
import AttachmentButtonPopover, {
  AttachmentButtonPopoverProps,
  SupportedFileFormats,
} from './AttachmentButtonPopover';
import { useStyle } from './style';
import { AttachmentFile, UploadResponse } from './types';
import { isImageFile } from './utils';

export * from './AttachmentButtonPopover';
export type { AttachmentFile, UploadResponse } from './types';

/**
 * AttachmentButton 组件属性
 */
export type AttachmentButtonProps = {
  /** 文件上传处理函数，返回文件 URL */
  upload?: (file: AttachmentFile, index: number) => Promise<string>;
  /** 文件上传处理函数（返回完整响应），优先级高于 upload */
  uploadWithResponse?: (
    file: AttachmentFile,
    index: number,
  ) => Promise<UploadResponse>;
  /** 文件映射表，用于存储已上传的文件 */
  fileMap?: Map<string, AttachmentFile>;
  /** 文件映射表变更时的回调 */
  onFileMapChange?: (files?: Map<string, AttachmentFile>) => void;
  /** 支持的文件格式配置 */
  supportedFormat?: AttachmentButtonPopoverProps['supportedFormat'];
  /** 是否禁用按钮 */
  disabled?: boolean;
  /** 自定义渲染函数，用于替换默认的 Popover */
  render?: (props: {
    children: React.ReactNode;
    supportedFormat?: AttachmentButtonPopoverProps['supportedFormat'];
  }) => React.ReactElement;
  /** 删除文件回调 */
  onDelete?: (file: AttachmentFile) => Promise<void>;
  /** 预览文件回调 */
  onPreview?: (file: AttachmentFile) => Promise<void>;
  /** 下载文件回调 */
  onDownload?: (file: AttachmentFile) => Promise<void>;
  /** 单个文件最大大小（字节） */
  maxFileSize?: number;
  /** 最大文件数量 */
  maxFileCount?: number;
  /** 最小文件数量 */
  minFileCount?: number;
  /** 是否允许一次选择多个文件（默认：true） */
  allowMultiple?: boolean;
};

/**
 * 文件上传配置
 */
type UploadProps = {
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
  locale?: any;
};

const WAIT_TIME_MS = 16;
const KB_SIZE = 1024;
const DEFAULT_MESSAGES = {
  uploading: 'Uploading...',
  uploadSuccess: 'Upload success',
  uploadFailed: 'Upload failed',
  maxFileCountExceeded: (count: number) => `最多只能上传 ${count} 个文件`,
  minFileCountRequired: (count: number) => `至少需要上传 ${count} 个文件`,
  fileSizeExceeded: (size: number) => `文件大小超过 ${size} KB`,
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

const getLocaleMessage = (locale: any, key: string, defaultMsg: string) => {
  return locale?.[key] || defaultMsg;
};

const validateFileCount = (
  newFileCount: number,
  existingFileCount: number,
  props: UploadProps,
): boolean => {
  const totalFileCount = newFileCount + existingFileCount;

  if (props.maxFileCount && totalFileCount > props.maxFileCount) {
    const msg = props.locale?.['markdownInput.maxFileCountExceeded']
      ? compileTemplate(props.locale['markdownInput.maxFileCountExceeded'], {
          maxFileCount: String(props.maxFileCount),
        })
      : DEFAULT_MESSAGES.maxFileCountExceeded(props.maxFileCount);
    message.error(msg);
    return false;
  }

  if (props.minFileCount && totalFileCount < props.minFileCount) {
    const msg = props.locale?.['markdownInput.minFileCountRequired']
      ? compileTemplate(props.locale['markdownInput.minFileCountRequired'], {
          minFileCount: String(props.minFileCount),
        })
      : DEFAULT_MESSAGES.minFileCountRequired(props.minFileCount);
    message.error(msg);
    return false;
  }

  return true;
};

const validateFileSize = (
  file: AttachmentFile,
  props: UploadProps,
): boolean => {
  if (!props.maxFileSize || file.size <= props.maxFileSize) return true;

  const maxSizeKB = props.maxFileSize / KB_SIZE;
  const msg =
    props.locale?.['markdownInput.fileSizeExceeded']?.replace(
      '${maxSize}',
      `${maxSizeKB}`,
    ) || DEFAULT_MESSAGES.fileSizeExceeded(maxSizeKB);
  message.error(msg);
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
  message.success(
    getLocaleMessage(
      props.locale,
      'uploadSuccess',
      DEFAULT_MESSAGES.uploadSuccess,
    ),
  );
};

const handleUploadError = (
  file: AttachmentFile,
  errorMsg: string | null,
  map: Map<string, AttachmentFile>,
  props: UploadProps,
) => {
  file.status = 'error';
  updateFileMap(map, file, props.onFileMapChange);
  const msg =
    errorMsg ||
    getLocaleMessage(
      props.locale,
      'uploadFailed',
      DEFAULT_MESSAGES.uploadFailed,
    );
  message.error(msg);
};

const processFile = async (
  file: AttachmentFile,
  index: number,
  map: Map<string, AttachmentFile>,
  props: UploadProps,
) => {
  await waitTime(WAIT_TIME_MS);

  if (!validateFileSize(file, props)) {
    file.status = 'error';
    updateFileMap(map, file, props.onFileMapChange);
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
    handleUploadError(file, errorMessage, map, props);
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
  const hideLoading = message.loading(
    getLocaleMessage(props.locale, 'uploading', DEFAULT_MESSAGES.uploading),
  );

  const fileList = Array.from(files) as AttachmentFile[];
  fileList.forEach(prepareFile);

  // 在添加到 fileMap 之前先验证文件数量
  if (!validateFileCount(fileList.length, existingFileCount, props)) {
    hideLoading();
    return;
  }

  // 验证通过后再添加到 fileMap
  fileList.forEach((file) => updateFileMap(map, file, props.onFileMapChange));

  try {
    for (let i = 0; i < fileList.length; i++) {
      await processFile(fileList[i], i, map, props);
    }
  } catch (error) {
    fileList.forEach((file) => {
      file.status = 'error';
      updateFileMap(map, file, props.onFileMapChange);
    });
    message.error(
      getLocaleMessage(
        props.locale,
        'uploadFailed',
        DEFAULT_MESSAGES.uploadFailed,
      ),
    );
  } finally {
    hideLoading();
  }
};

const BUTTON_WITH_TITLE_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const BUTTON_TITLE_STYLE: React.CSSProperties = {
  font: 'var(--font-text-body-base)',
  letterSpacing: 'var(--letter-spacing-body-base, normal)',
  color: 'var(--color-gray-text-default)',
};

const ButtonContent: React.FC<{ title?: React.ReactNode }> = ({ title }) => {
  return (
    <>
      <Paperclip />
      {title !== null && title ? (
        <div style={BUTTON_TITLE_STYLE}>{title}</div>
      ) : null}
    </>
  );
};

/**
 * 附件上传按钮组件
 *
 * 提供文件附件上传功能，支持图片、文档、音频、视频等多种格式
 *
 * @example
 * ```tsx
 * <AttachmentButton
 *   supportedFormat={SupportedFileFormats.image}
 *   upload={uploadFile}
 *   fileMap={fileMap}
 *   onFileMapChange={setFileMap}
 *   uploadImage={handleUpload}
 * />
 * ```
 */
export const AttachmentButton: React.FC<
  AttachmentButtonProps & {
    /** 上传图片的处理函数 */
    uploadImage(forGallery?: boolean): Promise<void>;
    /** 按钮标题文本 */
    title?: React.ReactNode;
  }
> = ({ disabled, uploadImage, title, supportedFormat, render }) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const prefix = context?.getPrefixCls('agentic-md-editor-attachment-button');
  const { wrapSSR, hashId } = useStyle(prefix);

  const format = supportedFormat || SupportedFileFormats.image;

  const handleClick = () => {
    if (disabled) return;
    uploadImage?.();
  };

  const buttonWithStyle = (
    <div style={BUTTON_WITH_TITLE_STYLE}>
      <ButtonContent title={title} />
    </div>
  );

  const wrapper = render ? (
    render({
      children: buttonWithStyle,
      supportedFormat: format,
    })
  ) : (
    <AttachmentButtonPopover supportedFormat={format} uploadImage={uploadImage}>
      {buttonWithStyle}
    </AttachmentButtonPopover>
  );

  return wrapSSR(
    <div
      className={classNames(`${prefix}`, hashId, {
        [`${prefix}-disabled`]: disabled,
      })}
      onClick={handleClick}
      data-testid="attachment-button"
    >
      {wrapper}
    </div>,
  );
};
