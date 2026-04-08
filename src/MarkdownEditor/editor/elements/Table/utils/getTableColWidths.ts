import { Node } from 'slate';
import stringWidth from 'string-width';
import {
  TABLE_COL_WIDTH_MIN_COLUMNS,
  TABLE_DEFAULT_COL_WIDTH,
} from '../../../../../Constants/mobile';
import type { TableNode } from '../../../types/Table';

export type ColWidthValue = number | string;

export interface ReadonlyTableColWidthsInput {
  columnCount: number;
  otherProps?: { colWidths?: ColWidthValue[] } | null;
  element?: TableNode | null;
  containerWidth?: number;
}

const SMART_SAMPLE_ROWS = 5;
const SMART_CELL_PADDING = 28; // 20 基础内边距 + 8 数字等字符宽度补偿
const SMART_FONT = '14px sans-serif';
const CHAR_WIDTH_PX = 12;
const WORD_SPLIT = /[\s\u4e00-\u9fa5]/;

type TableRow = { children: unknown[] };

function getTableRows(element: TableNode): TableRow[] {
  return element.children.flatMap((node) =>
    node.type === 'table-row'
      ? [node]
      : 'children' in node
        ? (node.children as TableRow[])
        : [],
  );
}

function getSampledCellTexts(
  element: TableNode,
  columnCount: number,
  maxRows: number,
): string[][] {
  return getTableRows(element)
    .slice(0, maxRows)
    .map((row) =>
      Array.from({ length: columnCount }, (_, i) => {
        const cell = row.children?.[i];
        return cell && typeof cell === 'object' && 'children' in cell
          ? Node.string(cell as Parameters<typeof Node.string>[0])
          : '';
      }),
    );
}

function createMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;
  ctx.font = SMART_FONT;
  return ctx;
}

function measureText(
  ctx: CanvasRenderingContext2D,
  text: string | null | undefined,
  pad: number,
): number {
  return text === null || text === undefined
    ? pad
    : ctx.measureText(String(text)).width + pad;
}

function getColumnMetrics(
  grid: string[][],
  col: number,
  ctx: CanvasRenderingContext2D,
  pad: number,
): { maxW: number; minW: number } {
  let maxW = 0;
  let minW = 0;
  for (const row of grid) {
    const cellText = row[col] ?? '';
    const full = measureText(ctx, cellText, pad);
    const words = cellText.split(WORD_SPLIT).filter(Boolean);
    const longest = words.length
      ? Math.max(...words.map((w) => measureText(ctx, w, pad)))
      : measureText(ctx, cellText, pad);
    maxW = Math.max(maxW, full);
    minW = Math.max(minW, longest);
  }
  return { maxW, minW };
}

function getSmartColWidthsPx(
  grid: string[][],
  columnCount: number,
  containerWidth: number,
): number[] | null {
  if (
    columnCount <= TABLE_COL_WIDTH_MIN_COLUMNS ||
    !grid.length ||
    containerWidth <= 0
  ) {
    return null;
  }
  const ctx = createMeasureContext();
  if (!ctx) return null;

  const metrics = Array.from({ length: columnCount }, (_, i) =>
    getColumnMetrics(grid, i, ctx, SMART_CELL_PADDING),
  );
  const totalMin = metrics.reduce((s, c) => s + c.minW, 0);
  if (totalMin >= containerWidth) return metrics.map((c) => c.minW);

  const remaining = containerWidth - totalMin;
  const totalFlex = metrics.reduce((s, c) => s + (c.maxW - c.minW), 0) || 1;
  return metrics.map((c) =>
    Math.floor(c.minW + ((c.maxW - c.minW) / totalFlex) * remaining),
  );
}

function getContentBasedColWidthsPx(
  element: TableNode,
  columnCount: number,
): number[] {
  const rows = getTableRows(element);
  return Array.from({ length: columnCount }, (_, colIndex) => {
    let maxPx = TABLE_DEFAULT_COL_WIDTH;
    for (const row of rows) {
      const cell = row.children?.[colIndex];
      if (cell && typeof cell === 'object' && 'children' in cell) {
        const w =
          stringWidth(Node.string(cell as Parameters<typeof Node.string>[0])) *
          CHAR_WIDTH_PX;
        if (w > maxPx) maxPx = w;
      }
    }
    return maxPx;
  });
}

function pxToPercent(px: number[]): string[] {
  const total = px.reduce((a, b) => a + b, 0);
  return total <= 0
    ? px.map(() => '0%')
    : px.map((w) => `${((w / total) * 100).toFixed(2)}%`);
}

/** 只读表格列宽：显式 colWidths > 智能算法(6+列) > 内容比例 > 平分 */
export function getReadonlyTableColWidths(
  input: ReadonlyTableColWidthsInput,
): ColWidthValue[] {
  const { columnCount, otherProps, element, containerWidth } = input;
  if (otherProps?.colWidths?.length) return otherProps.colWidths;
  if (columnCount === 0) return [];

  const useSmart =
    element?.children?.length &&
    typeof containerWidth === 'number' &&
    containerWidth > 0;
  if (useSmart) {
    const grid = getSampledCellTexts(element, columnCount, SMART_SAMPLE_ROWS);
    const smart = getSmartColWidthsPx(grid, columnCount, containerWidth);
    if (smart) return smart;
  }
  if (element?.children?.length)
    return pxToPercent(getContentBasedColWidthsPx(element, columnCount));

  const pct = (100 / columnCount).toFixed(2);
  return Array(columnCount).fill(`${pct}%`);
}
