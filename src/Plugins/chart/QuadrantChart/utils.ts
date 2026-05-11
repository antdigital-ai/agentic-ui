/**
 * QuadrantChart 渲染层工具函数集合。
 *
 * 保持「零外部依赖」，仅依赖 `src/Utils/columnMatching.ts` 中的纯字符串工具。
 */
import {
  QUADRANT_FIELD_ALIASES,
  resolveQuadrantFields as sharedResolveQuadrantFields,
  type QuadrantField,
  type QuadrantFieldMap,
  type ResolvedQuadrantFields,
} from '../../../Utils/columnMatching';

export type { QuadrantField, QuadrantFieldMap, ResolvedQuadrantFields };
export const resolveQuadrantFields = sharedResolveQuadrantFields;
export const DEFAULT_QUADRANT_FIELD_ALIASES = QUADRANT_FIELD_ALIASES;

/** 四象限固定 4 格 */
const MAX_QUADRANTS = 4;

export interface QuadrantGroup {
  label: string;
  items: QuadrantItem[];
}

export interface QuadrantItem {
  name: string;
  description?: string;
}

/**
 * 按「象限」列的值将数据行分组到最多 4 个象限。
 *
 * 取前 4 个不重复的象限值作为象限标签，按首次出现顺序排列。
 * 超出 4 个的象限值会被忽略。
 */
export const groupByQuadrant = (
  data: Record<string, any>[],
  nameField: string,
  quadrantField: string,
  descField: string | undefined,
): QuadrantGroup[] => {
  const labelOrder: string[] = [];
  const groupMap = new Map<string, QuadrantItem[]>();

  for (const row of data) {
    const label = String(row[quadrantField] ?? '').trim();
    if (!label) continue;

    const name = String(row[nameField] ?? '').trim();
    if (!name) continue;

    if (!groupMap.has(label)) {
      if (labelOrder.length >= MAX_QUADRANTS) continue;
      labelOrder.push(label);
      groupMap.set(label, []);
    }

    groupMap.get(label)!.push({
      name,
      description: descField ? String(row[descField] ?? '').trim() || undefined : undefined,
    });
  }

  // 不足 4 组时补空象限
  while (labelOrder.length < MAX_QUADRANTS) {
    const placeholder = `Q${labelOrder.length + 1}`;
    labelOrder.push(placeholder);
    groupMap.set(placeholder, []);
  }

  return labelOrder.map((label) => ({
    label,
    items: groupMap.get(label) || [],
  }));
};
