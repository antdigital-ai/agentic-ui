import React from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { upLoadFileToServer } from '../AttachmentButton';
import type { AttachmentFile } from '../AttachmentButton/types';
import { getFileListFromDataTransferItems } from '../FilePaste';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseDropZoneParams {
  props: Pick<MarkdownInputFieldProps, 'attachment' | 'disabled' | 'typing'>;
  fileMap?: Map<string, AttachmentFile>;
  setFileMap?: (fileMap?: Map<string, AttachmentFile>) => void;
}

/**
 * 判定拖拽事件中是否携带文件（区别于拖拽文本 / 内部元素）。
 * - 真实浏览器 dragover 阶段无法读 files，只能查 types（'Files' / uri-list）
 * - jsdom 的 DataTransfer.types 只回显 MIME，需 files.length 兜底
 */
const dragEventHasFiles = (e: React.DragEvent): boolean => {
  const types = Array.from(e.dataTransfer?.types ?? []);
  const hasFileType =
    types.includes('Files') ||
    types.includes('application/x-moz-file') ||
    // Safari 兼容：uri-list 拖拽也可能对应文件
    types.includes('string/uri-list');
  if (hasFileType) return true;
  // jsdom / 部分环境的 types 不含 'Files'，直接看 files
  return (e.dataTransfer?.files?.length ?? 0) > 0;
};

/**
 * 拖拽文件上传 Hook（对齐 dtcoder-ide 的 ChatDragAndDrop 能力）。
 *
 * 仅在 `attachment.enable` 且配置了 upload / uploadWithResponse 时生效，
 * 拖拽悬停时由组件渲染覆盖层（提示"拖放以上传文件"），落点后复用
 * upLoadFileToServer 走统一上传链路（含格式 / 大小 / 数量校验）。
 */
export const useDropZone = ({
  props,
  fileMap,
  setFileMap,
}: UseDropZoneParams) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const enabled =
    !!props.attachment?.enable &&
    !!(props.attachment?.upload || props.attachment?.uploadWithResponse) &&
    !props.disabled &&
    !props.typing;

  const handleDrop = useRefFunction(async (e: React.DragEvent) => {
    if (!enabled) return;
    if (!dragEventHasFiles(e)) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = await getFileListFromDataTransferItems(e.dataTransfer);
    if (files.length === 0) return;

    await upLoadFileToServer(files, {
      ...props.attachment,
      fileMap,
      onFileMapChange: setFileMap,
    });
  });

  const handleDragOver = useRefFunction((e: React.DragEvent) => {
    if (!enabled) return;
    if (!dragEventHasFiles(e)) return;
    // 必须 preventDefault 才能让后续 drop 事件触发
    e.preventDefault();
    setIsDragOver(true);
  });

  const handleDragLeave = useRefFunction((e: React.DragEvent) => {
    if (!enabled) return;
    // 仅当离开输入框本体（而非子元素间移动）时才取消高亮
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  });

  const handleDragEnter = useRefFunction((e: React.DragEvent) => {
    if (!enabled) return;
    if (!dragEventHasFiles(e)) return;
    e.preventDefault();
    setIsDragOver(true);
  });

  return {
    isDragOver,
    dropHandlers: enabled
      ? {
          onDrop: handleDrop,
          onDragOver: handleDragOver,
          onDragEnter: handleDragEnter,
          onDragLeave: handleDragLeave,
        }
      : undefined,
  };
};
