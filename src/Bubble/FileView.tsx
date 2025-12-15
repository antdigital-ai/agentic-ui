import React from 'react';
import { AttachmentFile } from '../MarkdownInputField/AttachmentButton/types';
import { FileMapView } from '../MarkdownInputField/FileMapView';
import { BubbleProps } from './type';

type BubbleFileViewProps = {
  bubble: BubbleProps<{
    content: string;
    uuid: number;
  }>;
  bubbleListRef: any;
  placement: 'left' | 'right';
};

const DEFAULT_DOWNLOAD_FILENAME = 'download';

const openFileInNewWindow = (file: AttachmentFile): void => {
  const url = file?.previewUrl || file?.url;
  if (!url || typeof window === 'undefined') return;

  window.open(url, '_blank');
};

const downloadFile = (file: AttachmentFile): void => {
  const url = file?.url || file?.previewUrl;
  if (!url || typeof document === 'undefined') return;

  const link = document.createElement('a');
  link.href = url;
  link.download = file?.name || DEFAULT_DOWNLOAD_FILENAME;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const defaultHandlers = {
  onPreview: openFileInNewWindow,
  onDownload: downloadFile,
  onViewAll: () => {},
} as const;

const renderMoreAction = (
  cfg: any,
  file: AttachmentFile,
): React.ReactNode | undefined => {
  if (!cfg) return undefined;
  if (React.isValidElement(cfg)) return cfg as React.ReactNode;
  if (typeof cfg !== 'function') return cfg as React.ReactNode;

  try {
    const result = cfg.length === 0 ? cfg() : cfg(file);
    return typeof result === 'function' ? result(file) : result;
  } catch {
    return undefined;
  }
};

const createViewAllHandler = (
  handler: ((files: AttachmentFile[]) => void) | undefined,
) => {
  if (!handler) return undefined;

  return (files: AttachmentFile[]) => {
    handler(files);
    return false;
  };
};

/**
 * BubbleFileView 组件
 *
 * 展示聊天气泡中的文件列表
 *
 * @example
 * ```tsx
 * <BubbleFileView bubble={bubbleData} placement="left" />
 * ```
 */
export const BubbleFileView: React.FC<BubbleFileViewProps> = ({
  bubble,
  placement,
}) => {
  const { originData, fileViewEvents, fileViewConfig = {} } = bubble;

  if (!originData?.fileMap || originData.fileMap.size === 0) return null;

  let events: {
    onPreview?: (file: AttachmentFile) => void;
    onDownload?: (file: AttachmentFile) => void;
    onViewAll?: (files: AttachmentFile[]) => void;
  } = {};
  try {
    events = fileViewEvents?.(defaultHandlers) || {};
  } catch {
    console.warn('fileViewEvents execution failed');
  }

  return (
    <FileMapView
      className={fileViewConfig.className}
      style={fileViewConfig.style}
      maxDisplayCount={fileViewConfig.maxDisplayCount}
      showMoreButton={fileViewConfig.showMoreButton}
      onPreview={events.onPreview}
      onDownload={events.onDownload}
      onViewAll={createViewAllHandler(events.onViewAll)}
      renderMoreAction={
        fileViewConfig.renderFileMoreAction
          ? (file) =>
              renderMoreAction(fileViewConfig.renderFileMoreAction, file)
          : undefined
      }
      customSlot={fileViewConfig.customSlot}
      placement={placement}
      fileMap={originData.fileMap}
      data-testid="file-item"
    />
  );
};
