import React, { useMemo } from 'react';
import { AttachmentFileList } from '../AttachmentButton/AttachmentFileList';
import type { AttachmentFile } from '../AttachmentButton/types';
import { MARKDOWN_INPUT_FIELD_TEST_IDS } from '../testIds';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';
import type { FileUploadStatus, FileUploadSummary } from '../types/shared';

interface UseAttachmentListParams {
  attachment?: MarkdownInputFieldProps['attachment'];
  fileMap?: Map<string, AttachmentFile>;
  handleFileRemoval: (file: AttachmentFile) => Promise<void>;
  handleFileRetry: (file: AttachmentFile) => Promise<void>;
  updateAttachmentFiles: (fileMap?: Map<string, AttachmentFile>) => void;
}

/**
 * 附件列表渲染 Hook
 */
export const useAttachmentList = ({
  attachment,
  fileMap,
  handleFileRemoval,
  handleFileRetry,
  updateAttachmentFiles,
}: UseAttachmentListParams): React.ReactNode => {
  return useMemo(() => {
    if (!attachment?.enable) return null;
    return React.createElement(AttachmentFileList, {
      fileMap,
      onDelete: handleFileRemoval,
      onRetry: handleFileRetry,
      onPreview: attachment?.onPreview
        ? (file: AttachmentFile) => {
            void Promise.resolve(attachment.onPreview?.(file)).catch(() => {});
          }
        : undefined,
      onClearFileMap: () => {
        updateAttachmentFiles(undefined);
      },
      dataTestId: MARKDOWN_INPUT_FIELD_TEST_IDS.ATTACHMENT_LIST,
    });
  }, [
    attachment?.enable,
    attachment?.onPreview,
    fileMap,
    handleFileRemoval,
    handleFileRetry,
    updateAttachmentFiles,
  ]);
};

interface UseBeforeToolsParams {
  beforeToolsRender?: MarkdownInputFieldProps['beforeToolsRender'];
  /** 当前 attachment 配置（透传到 SlotRenderState.attachment） */
  attachment?: MarkdownInputFieldProps['attachment'];
  /** 当前编辑器值 */
  value?: string;
  /** 当前附件文件映射 */
  fileMap?: Map<string, AttachmentFile>;
  /** 修改附件文件映射的回调 */
  onFileMapChange?: (fileMap?: Map<string, AttachmentFile>) => void;
  /** 文件上传状态 */
  fileUploadStatus: FileUploadStatus;
  /** 文件上传统计 */
  fileUploadSummary?: FileUploadSummary;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否 typing 中 */
  typing?: boolean;
  /** 鼠标悬停状态 */
  isHover: boolean;
  /** 发送加载状态 */
  isLoading: boolean;
}

/**
 * BeforeTools 渲染 Hook
 *
 * 行为契约：依赖列表中任何字段变化都会触发重新渲染。`beforeToolsRender` 入参
 * 类型已收敛为 `SlotRenderState`，不再需要 ref 透传完整 `props` 对象。
 */
export const useBeforeTools = ({
  beforeToolsRender,
  attachment,
  value,
  fileMap,
  onFileMapChange,
  fileUploadStatus,
  fileUploadSummary,
  disabled,
  typing,
  isHover,
  isLoading,
}: UseBeforeToolsParams): React.ReactNode => {
  return useMemo(() => {
    if (!beforeToolsRender) return null;
    return beforeToolsRender({
      attachment,
      value,
      fileMap,
      onFileMapChange,
      fileUploadStatus,
      fileUploadSummary,
      disabled,
      typing,
      isHover,
      isLoading,
    });
  }, [
    beforeToolsRender,
    attachment,
    value,
    fileMap,
    onFileMapChange,
    fileUploadStatus,
    fileUploadSummary,
    disabled,
    typing,
    isHover,
    isLoading,
  ]);
};
