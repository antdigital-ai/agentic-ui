import React, { useEffect, useMemo, useState } from 'react';
import { TABLE_ROW_INDEX_COL_WIDTH } from '../TableColgroup';

const TABLE_HORIZONTAL_PADDING = 32;
const DEFAULT_CONTENT_WIDTH = 400;

const getEditorContentElement = (
  markdownContainerRef: React.RefObject<HTMLElement | null> | undefined,
): HTMLDivElement | null =>
  (markdownContainerRef?.current?.querySelector(
    '.ant-agentic-md-editor-content',
  ) as HTMLDivElement | null) || null;

const getEditorContentWidth = (
  markdownContainerRef: React.RefObject<HTMLElement | null> | undefined,
): number => getEditorContentElement(markdownContainerRef)?.clientWidth || 0;

export interface UseEditableTableContentWidthParams {
  readonly: boolean;
  markdownContainerRef?: React.RefObject<HTMLElement | null>;
  minContainerWidth: number;
}

export function useEditableTableContentWidth({
  readonly,
  markdownContainerRef,
  minContainerWidth,
}: UseEditableTableContentWidthParams) {
  const [contentWidth, setContentWidth] = useState(0);

  const resolvedContentWidth = useMemo(() => {
    if (contentWidth > 0) return contentWidth;
    return (
      getEditorContentWidth(markdownContainerRef) || DEFAULT_CONTENT_WIDTH
    );
  }, [contentWidth, markdownContainerRef]);

  const availableTableWidth = useMemo(
    () =>
      Math.max(
        resolvedContentWidth - TABLE_HORIZONTAL_PADDING - TABLE_ROW_INDEX_COL_WIDTH,
        minContainerWidth,
      ),
    [resolvedContentWidth, minContainerWidth],
  );

  useEffect(() => {
    if (readonly || typeof window === 'undefined') return;

    const contentElement = getEditorContentElement(markdownContainerRef);
    if (!contentElement) {
      setContentWidth(0);
      return;
    }

    const updateWidth = () => setContentWidth(contentElement.clientWidth || 0);

    if (typeof ResizeObserver === 'undefined') {
      updateWidth();
      return;
    }

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(contentElement);
    updateWidth();

    return () => resizeObserver.disconnect();
  }, [readonly, markdownContainerRef]);

  return {
    resolvedContentWidth,
    availableTableWidth,
  };
}
