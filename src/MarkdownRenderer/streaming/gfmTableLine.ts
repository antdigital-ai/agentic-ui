const GFM_TABLE_CELL_SEPARATOR = '|';
const GFM_TABLE_SEPARATOR_CELL_PATTERN = /^:?-+:?$/;

const getGfmTableCells = (line: string): string[] => {
  const trimmedLine = line.trim();
  if (!trimmedLine.includes(GFM_TABLE_CELL_SEPARATOR)) return [];

  const cells = trimmedLine.split(GFM_TABLE_CELL_SEPARATOR);
  if (cells[0]?.trim() === '') cells.shift();
  if (cells[cells.length - 1]?.trim() === '') cells.pop();
  return cells.map((cell) => cell.trim());
};

const isGfmTableSeparatorLine = (cells: string[]): boolean =>
  cells.length > 1 &&
  cells.every((cell) => GFM_TABLE_SEPARATOR_CELL_PATTERN.test(cell));

/** GFM 表格行：`| a | b |`、`a | b`，或流式中的 `| 1 |` */
export const isGfmTableLine = (line: string): boolean => {
  const cells = getGfmTableCells(line);
  if (isGfmTableSeparatorLine(cells)) return true;
  return cells.length > 1 && cells.some(Boolean);
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
