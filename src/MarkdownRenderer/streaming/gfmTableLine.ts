const GFM_TABLE_CELL_SEPARATOR = '|';
const GFM_TABLE_SEPARATOR_CELL_PATTERN = /^:?-+:?$/;

interface GfmTableCells {
  cells: string[];
  hasBorder: boolean;
}

const getGfmTableCells = (line: string): GfmTableCells => {
  const trimmedLine = line.trim();
  if (!trimmedLine.includes(GFM_TABLE_CELL_SEPARATOR)) {
    return { cells: [], hasBorder: false };
  }

  const cells = trimmedLine.split(GFM_TABLE_CELL_SEPARATOR);
  const hasLeadingBorder = cells[0]?.trim() === '';
  const hasTrailingBorder = cells[cells.length - 1]?.trim() === '';
  if (hasLeadingBorder) cells.shift();
  if (hasTrailingBorder) cells.pop();
  return {
    cells: cells.map((cell) => cell.trim()),
    hasBorder: hasLeadingBorder || hasTrailingBorder,
  };
};

const hasGfmTableShape = ({ cells, hasBorder }: GfmTableCells): boolean =>
  cells.length > 1 || (hasBorder && cells.length === 1);

const isGfmTableSeparatorLine = (tableCells: GfmTableCells): boolean => {
  const { cells } = tableCells;
  return (
    hasGfmTableShape(tableCells) &&
    cells.length > 0 &&
    cells.every((cell) => GFM_TABLE_SEPARATOR_CELL_PATTERN.test(cell))
  );
};

/** GFM 表格行：`| a | b |`、`a | b`，或流式中的 `| 1 |` */
export const isGfmTableLine = (line: string): boolean => {
  const tableCells = getGfmTableCells(line);
  if (isGfmTableSeparatorLine(tableCells)) return true;
  return hasGfmTableShape(tableCells) && tableCells.cells.some(Boolean);
};

/** 流式末块是否仍在 GFM 表格行内（从末尾向前扫描连续表格行） */
export const endsInsideGfmTable = (source: string): boolean => {
  const lines = source.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line === '') {
      continue;
    }
    return isGfmTableLine(line);
  }
  return false;
};
