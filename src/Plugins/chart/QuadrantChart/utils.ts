/**
 * QuadrantChart 渲染层工具函数。
 *
 * 四象限图采用最简模式：按行顺序渲染，前 4 行 = 4 个象限。
 * 第 1 列 = 象限标签，第 2 列 = 逗号分隔的条目列表。
 */

/** 四象限固定 4 格 */
const MAX_QUADRANTS = 4;

/** 条目拆分分隔符（与 docCards 的 splitTags 一致） */
const ITEM_SPLIT_PATTERN = /[,;|/，；、]+/;

export interface QuadrantGroup {
  label: string;
  items: string[];
}

/**
 * 将原始单元格内容拆分为条目列表。
 */
export const splitItems = (raw: unknown): string[] => {
  if (raw === undefined || raw === null) return [];
  const text = String(raw).trim();
  if (!text) return [];
  return text
    .split(ITEM_SPLIT_PATTERN)
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * 按行顺序解析表格数据为四象限。
 *
 * - 前 4 行依次对应 4 个象限；
 * - 第 1 列值作为象限标签；
 * - 第 2 列值按分隔符拆分为条目列表；
 * - 不足 4 行时补空占位。
 */
export const parseQuadrantsFromRows = (
  data: Record<string, any>[],
  columns: { dataIndex: string }[],
): QuadrantGroup[] => {
  const labelKey = columns[0]?.dataIndex;
  const itemsKey = columns[1]?.dataIndex;

  const groups: QuadrantGroup[] = [];

  const rowCount = Math.min(data.length, MAX_QUADRANTS);
  for (let i = 0; i < rowCount; i++) {
    const row = data[i];
    const label = labelKey ? String(row[labelKey] ?? '').trim() : `Q${i + 1}`;
    const items = itemsKey ? splitItems(row[itemsKey]) : [];
    groups.push({ label: label || `Q${i + 1}`, items });
  }

  while (groups.length < MAX_QUADRANTS) {
    groups.push({ label: `Q${groups.length + 1}`, items: [] });
  }

  return groups;
};
