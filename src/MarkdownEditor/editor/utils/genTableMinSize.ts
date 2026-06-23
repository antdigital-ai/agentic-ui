import type { Elements } from '../../el';

export interface TableMinSizeConfig {
  minColumn?: number;
  minRows?: number;
}

const createEmptyCell = (): Elements =>
  ({
    type: 'table-cell',
    children: [{ text: '' }],
  }) as Elements;

const createEmptyRow = (columnCount: number): Elements =>
  ({
    type: 'table-row',
    children: Array.from({ length: columnCount }, createEmptyCell),
  }) as Elements;

function collectTableRows(table: Elements): Elements[] {
  const rows: Elements[] = [];
  for (const child of (table.children || []) as Elements[]) {
    if (child.type === 'table-row') {
      rows.push(child);
      continue;
    }
    if (child.type === 'table-head' || child.type === 'table-footer') {
      for (const row of (child.children || []) as Elements[]) {
        if (row.type === 'table-row') {
          rows.push(row);
        }
      }
    }
  }
  return rows;
}

function padRowColumns(row: Elements, targetColumns: number) {
  if (targetColumns <= 0) return;
  const cells = [...((row.children || []) as Elements[])];
  while (cells.length < targetColumns) {
    cells.push(createEmptyCell());
  }
  row.children = cells;
}

/**
 * 就地补齐 schema 中表格的最小行/列（用于 `tableConfig.minRows` / `minColumn`）。
 */
export function applyTableMinSizeToSchema(
  elements: Elements[],
  config?: TableMinSizeConfig,
): void {
  if (!config) return;
  const minColumn = Math.max(0, config.minColumn ?? 0);
  const minRows = Math.max(0, config.minRows ?? 0);
  if (minColumn === 0 && minRows === 0) return;

  const walk = (nodes: Elements[]) => {
    for (const node of nodes) {
      if (node.type === 'table') {
        const rows = collectTableRows(node);
        rows.forEach((row) => padRowColumns(row, minColumn));
        const columnCount = Math.max(
          minColumn,
          ...rows.map((row) => row.children?.length ?? 0),
          0,
        );
        while (rows.length < minRows) {
          const newRow = createEmptyRow(columnCount);
          (node.children as Elements[]).push(newRow);
          rows.push(newRow);
        }
        rows.forEach((row) => padRowColumns(row, columnCount));
      }
      if (Array.isArray(node.children)) {
        walk(node.children as Elements[]);
      }
    }
  };

  walk(elements);
}
