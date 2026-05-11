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

/**
 * 四象限标签顺序：[右上(Q1), 左上(Q2), 左下(Q3), 右下(Q4)]
 *
 * 对应坐标系：
 * - Q1: high-X, high-Y（右上）
 * - Q2: low-X, high-Y（左上）
 * - Q3: low-X, low-Y（左下）
 * - Q4: high-X, low-Y（右下）
 */
export const DEFAULT_QUADRANT_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'];

export interface QuadrantItem {
  name: string;
  description?: string;
  x: number;
  y: number;
  quadrant: number;
  /** 原始行数据 */
  raw: Record<string, any>;
}

const toSafeNumber = (raw: unknown): number | null => {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

/**
 * 将数据行按 X/Y 阈值分配到四个象限。
 *
 * 象限编号：
 * - 0 (Q1): x >= xThreshold && y >= yThreshold（右上）
 * - 1 (Q2): x < xThreshold && y >= yThreshold（左上）
 * - 2 (Q3): x < xThreshold && y < yThreshold（左下）
 * - 3 (Q4): x >= xThreshold && y < yThreshold（右下）
 */
export const classifyIntoQuadrants = (
  data: Record<string, any>[],
  xField: string,
  yField: string,
  nameField: string,
  descField: string | undefined,
  xThreshold: number,
  yThreshold: number,
): QuadrantItem[][] => {
  const quadrants: QuadrantItem[][] = [[], [], [], []];

  for (const row of data) {
    const xVal = toSafeNumber(row[xField]);
    const yVal = toSafeNumber(row[yField]);
    if (xVal === null || yVal === null) continue;

    const name = String(row[nameField] ?? '').trim();
    if (!name) continue;

    let quadrant: number;
    if (xVal >= xThreshold && yVal >= yThreshold) quadrant = 0;
    else if (xVal < xThreshold && yVal >= yThreshold) quadrant = 1;
    else if (xVal < xThreshold && yVal < yThreshold) quadrant = 2;
    else quadrant = 3;

    quadrants[quadrant].push({
      name,
      description: descField ? String(row[descField] ?? '').trim() : undefined,
      x: xVal,
      y: yVal,
      quadrant,
      raw: row,
    });
  }

  return quadrants;
};

/**
 * 计算数据集中某列的中位数，作为默认阈值。
 */
export const computeMedian = (
  data: Record<string, any>[],
  field: string,
): number => {
  const values = data
    .map((row) => toSafeNumber(row[field]))
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);

  if (values.length === 0) return 50;
  const mid = Math.floor(values.length / 2);
  return values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid];
};
