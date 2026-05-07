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

/**
 * 解析 fileViewConfig.renderFileMoreAction 的多种合法写法：
 *   1. ReactNode（直接 JSX）
 *   2. (file) => ReactNode
 *   3. () => ReactNode
 *   4. () => (file) => ReactNode
 *
 * 实现要点：始终用 `(file)` 形式调用函数，并对返回值做一次类型分发。
 * 不再依赖 `cfg.length === 0` 来区分 0 参/1 参函数 —— 在 TS/默认参数下 `length` 经常不可靠。
 */
type RenderMoreActionConfig =
  | React.ReactNode
  | ((file: AttachmentFile) => React.ReactNode)
  | (() => React.ReactNode)
  | (() => (file: AttachmentFile) => React.ReactNode);

const renderMoreAction = (
  cfg: RenderMoreActionConfig | undefined,
  file: AttachmentFile,
): React.ReactNode | undefined => {
  if (cfg === null || cfg === undefined || cfg === false) return undefined;
  if (typeof cfg !== 'function') {
    // ReactNode 直传
    return cfg as React.ReactNode;
  }

  try {
    // 始终以 (file) 调用：对 (file)=>Node 与 ()=>Node 都兼容
    const result = (cfg as (file?: AttachmentFile) => React.ReactNode)(file);
    if (typeof result === 'function') {
      // currying 形态：()=>(file)=>Node
      return (result as (file: AttachmentFile) => React.ReactNode)(file);
    }
    return result;
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
              renderMoreAction(
                fileViewConfig.renderFileMoreAction as RenderMoreActionConfig,
                file,
              )
          : undefined
      }
      customSlot={fileViewConfig.customSlot}
      placement={placement}
      fileMap={originData.fileMap}
      data-testid="file-item"
    />
  );
};
