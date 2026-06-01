import React from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { upLoadFileToServer } from '../AttachmentButton';
import type { AttachmentFile } from '../AttachmentButton/types';
import { getFileListFromDataTransferItems } from '../FilePaste';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UsePasteHandlerParams {
  props: Pick<MarkdownInputFieldProps, 'attachment' | 'markdownProps'>;
  fileMap?: Map<string, AttachmentFile>;
  setFileMap?: (fileMap?: Map<string, AttachmentFile>) => void;
}

/**
 * 粘贴上传处理 Hook。
 *
 * 由原 useMarkdownInputFieldHandlers 拆分而来。仅在 attachment.enable 且
 * 配置了 upload 或 uploadWithResponse 时生效，会从剪贴板提取图片并上传。
 * markdownProps.attachment 作为 props.attachment 缺省时的回退配置。
 */
export const usePasteHandler = ({
  props,
  fileMap,
  setFileMap,
}: UsePasteHandlerParams) => {
  const handlePaste = useRefFunction(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      const attachmentConfig =
        props.attachment || props.markdownProps?.attachment;
      if (!attachmentConfig?.enable) return;
      if (!attachmentConfig?.upload && !attachmentConfig?.uploadWithResponse) {
        return;
      }
      const imageFiles = (
        await getFileListFromDataTransferItems(e.clipboardData)
      ).filter((file) => file?.type?.startsWith('image/'));
      if (imageFiles.length === 0) return;

      await upLoadFileToServer(imageFiles, {
        ...attachmentConfig,
        fileMap,
        onFileMapChange: setFileMap,
      });
    },
  );

  return { handlePaste };
};
