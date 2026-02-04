import React, { useMemo } from 'react';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseMarkdownInputFieldStylesParams {
  toolsRender?: MarkdownInputFieldProps['toolsRender'];
  maxHeight?: MarkdownInputFieldProps['maxHeight'];
  style?: React.CSSProperties;
  attachment?: { enable?: boolean };
  isEnlarged: boolean;
  rightPadding: number;
  topRightPadding: number;
  quickRightOffset: number;
  hasEnlargeAction: boolean;
  hasRefineAction: boolean;
  totalActionCount: number;
  isMultiRowLayout: boolean;
}

interface UseMarkdownInputFieldStylesReturn {
  computedRightPadding: number;
  collapsedHeight: number;
  collapsedHeightPx: number;
  computedMinHeight: number | string | undefined;
  enlargedStyle: React.CSSProperties;
}

/**
 * 样式计算 Hook
 * 计算组件所需的样式值
 */
export const useMarkdownInputFieldStyles = ({
  toolsRender,
  maxHeight,
  style,
  attachment,
  isEnlarged,
  rightPadding,
  topRightPadding,
  quickRightOffset,
  hasEnlargeAction,
  hasRefineAction,
  totalActionCount,
  isMultiRowLayout,
}: UseMarkdownInputFieldStylesParams): UseMarkdownInputFieldStylesReturn => {
  const computedRightPadding = useMemo(() => {
    const bottomOverlayPadding = toolsRender ? 0 : rightPadding || 52;
    const topOverlayPadding = (topRightPadding || 0) + (quickRightOffset || 0);
    return Math.max(bottomOverlayPadding, topOverlayPadding);
  }, [toolsRender, rightPadding, topRightPadding, quickRightOffset]);

  const collapsedHeight = useMemo(() => {
    // 优先使用 maxHeight prop，其次使用 style.maxHeight，最后使用默认值
    const maxHeightValue = maxHeight ?? style?.maxHeight;
    const base =
      typeof maxHeightValue === 'number'
        ? maxHeightValue
        : maxHeightValue
          ? parseFloat(String(maxHeightValue)) || 114
          : 114;
    return base;
  }, [maxHeight, style?.maxHeight, attachment?.enable]);

  const collapsedHeightPx = useMemo(() => {
    const extra = attachment?.enable ? 90 : 0;
    return collapsedHeight + extra;
  }, [collapsedHeight, attachment?.enable]);

  const computedMinHeight = useMemo(() => {
    if (isEnlarged) return 'auto';
    if (style?.minHeight !== undefined) return style.minHeight;
    // 如果同时有放大按钮和提示词优化按钮，最小高度为 140px
    if (hasEnlargeAction && hasRefineAction) return 140;
    if (totalActionCount === 1) return 90;
    // 其他多行布局情况，最小高度为 106px
    if (isMultiRowLayout) return 106;
    // 默认使用传入的 minHeight 或 0
    return style?.minHeight || 0;
  }, [
    isEnlarged,
    hasEnlargeAction,
    hasRefineAction,
    isMultiRowLayout,
    totalActionCount,
    style?.minHeight,
  ]);

  const enlargedStyle = useMemo(() => {
    if (!isEnlarged) return {};
    return {
      maxHeight: '980px',
      minHeight: '280px',
    } as React.CSSProperties;
  }, [isEnlarged]);

  return {
    computedRightPadding,
    collapsedHeight,
    collapsedHeightPx,
    computedMinHeight,
    enlargedStyle,
  };
};
