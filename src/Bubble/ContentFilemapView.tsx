import json5 from 'json5';
import React, { useMemo } from 'react';
import { normalizeFileMapPropsFromJson } from '../MarkdownEditor/editor/elements/AgenticUiBlocks/agenticUiEmbedUtils';
import partialParse from '../MarkdownEditor/editor/parser/json-parse';
import { FileMapView } from '../MarkdownInputField/FileMapView';
import type { FilemapBlock } from './extractFilemapBlocks';
import type { BubbleProps } from './type';

const parseBody = (body: string): unknown => {
  try {
    return json5.parse(body || '{}');
  } catch {
    try {
      return partialParse(body || '{}');
    } catch {
      return null;
    }
  }
};

const FilemapItem: React.FC<{
  body: string;
  fileViewConfig?: BubbleProps['fileViewConfig'];
  fileViewEvents?: BubbleProps['fileViewEvents'];
  placement?: 'left' | 'right';
}> = ({ body, fileViewConfig, fileViewEvents, placement }) => {
  const parsed = useMemo(() => parseBody(body), [body]);

  const { fileList, className } = useMemo(
    () => normalizeFileMapPropsFromJson(parsed),
    [parsed],
  );

  const fileMap = useMemo(
    () => new Map(fileList.map((f) => [f.uuid || f.name, f])),
    [fileList],
  );

  const defaultHandlers = useMemo(
    () => ({
      onPreview: (file: any) => {
        const url = file?.previewUrl || file?.url;
        if (url && typeof window !== 'undefined') window.open(url, '_blank');
      },
      onDownload: (file: any) => {
        const url = file?.url || file?.previewUrl;
        if (!url || typeof document === 'undefined') return;
        const link = document.createElement('a');
        link.href = url;
        link.download = file?.name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      onViewAll: () => {},
    }),
    [],
  );

  let events: ReturnType<NonNullable<BubbleProps['fileViewEvents']>> = {};
  try {
    events = fileViewEvents?.(defaultHandlers) || {};
  } catch {}

  if (parsed === null || fileMap.size === 0) return null;

  return (
    <FileMapView
      fileMap={fileMap}
      className={className ?? fileViewConfig?.className}
      style={fileViewConfig?.style}
      placement={placement}
      onPreview={events?.onPreview}
      onDownload={events?.onDownload}
      itemRender={fileViewConfig?.itemRender}
      maxDisplayCount={fileViewConfig?.maxDisplayCount}
      showMoreButton={fileViewConfig?.showMoreButton}
      customSlot={fileViewConfig?.customSlot}
      renderMoreAction={fileViewConfig?.renderFileMoreAction as any}
    />
  );
};

/**
 * 将从 markdown content 中提取出的 agentic-ui-filemap 块渲染为 FileMapView 列表。
 * 渲染在气泡内容框外部，避免图片被包在带样式的气泡背景里。
 */
export const ContentFilemapView: React.FC<{
  blocks: FilemapBlock[];
  fileViewConfig?: BubbleProps['fileViewConfig'];
  fileViewEvents?: BubbleProps['fileViewEvents'];
  placement?: 'left' | 'right';
  style?: React.CSSProperties;
}> = ({ blocks, fileViewConfig, fileViewEvents, placement, style }) => {
  if (blocks.length === 0) return null;
  return (
    <div style={style} data-testid="content-filemap-view">
      {blocks.map((block, i) => (
        <FilemapItem
          key={i}
          body={block.body}
          fileViewConfig={fileViewConfig}
          fileViewEvents={fileViewEvents}
          placement={placement}
        />
      ))}
    </div>
  );
};
