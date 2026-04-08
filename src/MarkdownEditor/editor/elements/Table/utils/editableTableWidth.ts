import {
  MOBILE_TABLE_MIN_COLUMN_WIDTH,
  TABLE_EDIT_COL_WIDTH_MIN_COLUMNS,
} from '../../../../../Constants/mobile';
import type { TableNode } from '../../../types/Table';
import type { ColWidthValue } from './getTableColWidths';
import { getReadonlyTableColWidths } from './getTableColWidths';

const TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH = 60;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toPixelWidth = (
  width: ColWidthValue | undefined,
  containerWidth: number,
  fallbackWidth: number,
): number => {
  if (typeof width === 'number') return width;
  if (!width) return fallbackWidth;

  if (width.endsWith('%')) {
    const ratio = Number.parseFloat(width);
    if (Number.isFinite(ratio)) return (containerWidth * ratio) / 100;
  }

  const parsed = Number.parseFloat(width);
  return Number.isFinite(parsed) ? parsed : fallbackWidth;
};

export interface GetEditableTableColWidthsParams {
  readonly: boolean;
  columnCount: number;
  availableTableWidth: number;
  mobileBreakpointValue: number;
  element?: TableNode;
}

/** 统一编辑态列宽策略：显式列宽优先，其他场景复用只读算法并归一化为像素值 */
export const getEditableTableColWidths = ({
  readonly,
  columnCount,
  availableTableWidth,
  mobileBreakpointValue,
  element,
}: GetEditableTableColWidthsParams): number[] => {
  if (readonly) return [];
  if (!element?.children?.length) return [];
  if (columnCount < TABLE_EDIT_COL_WIDTH_MIN_COLUMNS) return [];

  const explicitColWidths = (
    element.otherProps as { colWidths?: ColWidthValue[] } | undefined
  )?.colWidths;
  if (explicitColWidths?.length) {
    return explicitColWidths
      .slice(0, columnCount)
      .map((width) =>
        Math.max(
          1,
          Math.round(
            toPixelWidth(
              width,
              availableTableWidth,
              TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH,
            ),
          ),
        ),
      );
  }

  const isMobileLayout = availableTableWidth <= mobileBreakpointValue;
  const minColumnWidth = isMobileLayout
    ? MOBILE_TABLE_MIN_COLUMN_WIDTH
    : TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH;
  const maxColumnWidth = isMobileLayout
    ? availableTableWidth
    : Math.max(TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH, availableTableWidth / 4);
  const fallbackWidth = Math.max(
    minColumnWidth,
    Math.floor(availableTableWidth / Math.max(columnCount, 1)),
  );

  const sourceColWidths = getReadonlyTableColWidths({
    columnCount,
    element,
    containerWidth: availableTableWidth,
  });
  const normalizedWidths = Array.from({ length: columnCount }, (_, index) =>
    clamp(
      toPixelWidth(sourceColWidths[index], availableTableWidth, fallbackWidth),
      minColumnWidth,
      maxColumnWidth,
    ),
  );

  const totalWidth = normalizedWidths.reduce((sum, width) => sum + width, 0);
  if (totalWidth > availableTableWidth) {
    return Array(columnCount).fill(fallbackWidth);
  }

  return normalizedWidths;
};

export interface GetEditableTableMinWidthParams {
  columnCount: number;
  colWidths: number[];
  availableTableWidth: number;
  mobileBreakpointValue: number;
  resolvedContentWidth: number;
  minContainerWidth: number;
  rowIndexColWidth: number;
}

export const getEditableTableMinWidth = ({
  columnCount,
  colWidths,
  availableTableWidth,
  mobileBreakpointValue,
  resolvedContentWidth,
  minContainerWidth,
  rowIndexColWidth,
}: GetEditableTableMinWidthParams): number => {
  const isMobileLayout = availableTableWidth <= mobileBreakpointValue;
  const minColumnWidth = isMobileLayout
    ? MOBILE_TABLE_MIN_COLUMN_WIDTH
    : TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH;
  const colWidthsTotal = colWidths.reduce((total, width) => total + width, 0);
  const fallbackMinWidth = Number(
    (Math.max(resolvedContentWidth, minContainerWidth) * 0.95).toFixed(0),
  );

  return Math.max(
    columnCount * minColumnWidth,
    colWidthsTotal + rowIndexColWidth,
    fallbackMinWidth,
    minContainerWidth,
  );
};
