import { Paperclip } from '@sofa-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext } from 'react';
import type { LocalKeys } from '../../I18n';
import AttachmentButtonPopover, {
  AttachmentButtonPopoverProps,
  SupportedFileFormats,
} from './AttachmentButtonPopover';
import { useStyle } from './style';
import { AttachmentFile, UploadResponse } from './types';

export * from './AttachmentButtonPopover';
export type { AttachmentFile, UploadResponse } from './types';
/**
 * `upLoadFileToServer` 已迁移至 `src/MarkdownInputField/utils/uploadFile.ts`，
 * 此处保留 re-export 兼容层，确保 `src/index.ts` 的公开 API 与下游调用方
 * （`FileUploadManager`、`hooks/usePasteHandler` 等）的导入路径不发生破坏性变更。
 */
export { upLoadFileToServer } from '../utils/uploadFile';

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
  /** 国际化文案，会传递给 AttachmentButtonPopover。支持 `input.supportedFormatMessage` 等 */
  locale?: Partial<LocalKeys>;
  /** 自定义渲染函数，用于替换默认的 Popover */
  render?: (props: {
    children: React.ReactNode;
    supportedFormat?: AttachmentButtonPopoverProps['supportedFormat'];
    locale?: Partial<LocalKeys>;
  }) => React.ReactElement;
  /** 删除文件回调 */
  onDelete?: (file: AttachmentFile) => Promise<void>;
  /** 预览文件回调 */
  onPreview?: (file: AttachmentFile) => void | Promise<void>;
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

const ButtonContent: React.FC<{
  title?: React.ReactNode;
  prefixCls: string;
}> = ({ title, prefixCls }) => {
  return (
    <>
      <Paperclip />
      {title !== null && title ? (
        <span className={`${prefixCls}-title`}>{title}</span>
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
> = ({ disabled, uploadImage, title, supportedFormat, locale, render }) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const prefix = context?.getPrefixCls('agentic-md-editor-attachment-button');
  const { hashId } = useStyle(prefix);

  const format = supportedFormat || SupportedFileFormats.image;

  const buttonContent = (
    <div className={`${prefix}-inner`}>
      <ButtonContent title={title} prefixCls={prefix} />
    </div>
  );

  const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      // disabled 时拦截所有点击，阻止冒泡至 Popover 内部触发上传
      e.stopPropagation();
      e.preventDefault();
    }
    if (!disabled) {
      uploadImage();
    }
  };

  const wrapper = render ? (
    render({
      children: buttonContent,
      supportedFormat: format,
      locale,
    })
  ) : (
    <AttachmentButtonPopover supportedFormat={format} locale={locale}>
      {buttonContent}
    </AttachmentButtonPopover>
  );

  return (
    <div
      className={classNames(`${prefix}`, hashId, {
        [`${prefix}-disabled`]: disabled,
      })}
      onClick={handleWrapperClick}
      data-testid="attachment-button"
    >
      {wrapper}
    </div>
  );
};
