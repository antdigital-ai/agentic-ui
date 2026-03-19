/**
 * 上传响应对象类型
 */
export type UploadResponse = {
  contentId?: string | null;
  errorMessage?: string | null;
  fileId: string;
  fileName: string;
  fileSize?: number | null;
  fileType: string;
  fileUrl: string;
  uploadStatus: 'SUCCESS' | 'FAIL' | string;
};

export type AttachmentFile = File & {
  url?: string;
  status?: 'error' | 'uploading' | 'pending' | 'done';
  uuid?: string;
  size?: number | null;
  previewUrl?: string;
  /** 上传响应数据（使用 uploadWithResponse 时会填充此字段） */
  uploadResponse?: UploadResponse;
};
