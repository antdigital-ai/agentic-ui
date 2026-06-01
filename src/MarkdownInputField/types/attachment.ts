import type { AttachmentButtonProps } from '../AttachmentButton';

/**
 * 上传响应对象类型
 *
 * 用于 `AttachmentButtonProps.uploadWithResponse` 等返回结构化数据的上传函数。
 */
export interface UploadResponse {
  contentId?: string | null;
  errorMessage?: string | null;
  fileId: string;
  fileName: string;
  fileSize?: number | null;
  fileType: string;
  fileUrl: string;
  uploadStatus: 'SUCCESS' | 'FAIL' | string;
}

/**
 * 单个附件文件对象。
 *
 * 在原生 `File` 之上扩展了上传过程相关字段（status / errorMessage / uploadResponse 等）。
 * 该类型同时被 `AttachmentButton`、`FileUploadManager`、`FileMapView`、`FilePaste` 等模块使用，
 * 集中在此以避免各处重复声明。
 */
export type AttachmentFile = File & {
  url?: string;
  status?: 'error' | 'uploading' | 'pending' | 'done';
  uuid?: string;
  size?: number | null;
  previewUrl?: string;
  /** 错误信息（如文件超限、上传失败等），在 status 为 error 时展示 */
  errorMessage?: string | null;
  /** 错误类型，如 FILE_SIZE_EXCEEDED 表示因大小超限不可重试 */
  errorCode?: string | null;
  /** 上传响应数据（使用 uploadWithResponse 时会填充此字段） */
  uploadResponse?: UploadResponse;
};

/**
 * 输入框 `attachment` 配置的命名类型。
 *
 * 等价于 `{ enable?: boolean } & AttachmentButtonProps`，集中命名后便于在
 * `actionsRender` / `toolsRender` / `quickActionRender` 等回调入参类型中复用，
 * 替代原先内联展开 `MarkdownInputFieldProps['attachment']` 的写法。
 */
export type AttachmentConfig = {
  /**
   * 是否启用文件上传（包含粘贴图片上传）
   * @default false
   */
  enable?: boolean;
} & AttachmentButtonProps;
