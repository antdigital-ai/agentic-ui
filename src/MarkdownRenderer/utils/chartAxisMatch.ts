/**
 * 图表注释配置中 `x`/`y` 字段名 → 表头列 `dataIndex` 的模糊匹配工具。
 *
 * 背景：
 * - 用户在 HTML 注释里写 `<!-- {"chartType":"line","x":"时段","y":"客单价"} -->`，
 *   但表格表头常带括号单位说明，如 `| 时段 | 客单价(元) |`。
 * - 直接用 `row["客单价"]` 取值会取不到 `客单价(元)` 列，导致图表无数据。
 *
 * 这里提供与 `MarkdownEditor/editor/parser/parse/parseTable.ts` 中
 * `columnKeyMatchesConfiguredField` / `resolveChartAxisFieldToColumnKey` 行为完全一致
 * 的实现，供 MarkdownRenderer 链路（remarkChartFromComment 插件）复用，
 * 避免编辑器与渲染器在「同一份 markdown」上呈现不同行为。
 */

/**
 * 表头列名在「逻辑名」后仅跟括号单位说明时的后缀。
 *
 * 兼容中英文括号、可重复（如 `销量(万台)(同比)`）。
 *
 * 例：
 * - `客单价(元)` → 后缀 `(元)` 命中
 * - `GDP总量（万亿元）` → 后缀 `（万亿元）` 命中
 * - `销量(万台)(同比)` → 后缀 `(万台)(同比)` 命中
 */
const TRAILING_UNIT_SUFFIX_PATTERN = /^(\s*[（(][^）)]+[）)])+\s*$/;

/**
 * 判断表头列名 `columnKey` 是否对应注释里配置的轴字段 `configuredField`。
 *
 * 命中规则（按顺序）：
 * 1. 双方 `trim()` 后完全相等
 * 2. `columnKey` 以 `configuredField` 开头，且剩余部分完全匹配
 *    `TRAILING_UNIT_SUFFIX_PATTERN`（即只多出中英文括号包裹的单位/补充说明）
 *
 * 大小写敏感、不忽略字符串内部空格。
 */
export const columnKeyMatchesConfiguredField = (
  columnKey: string,
  configuredField: string,
): boolean => {
  const ck = (columnKey || '').trim();
  const f = (configuredField || '').trim();
  if (!ck || !f) return false;
  if (ck === f) return true;
  if (!ck.startsWith(f)) return false;
  const rest = ck.slice(f.length);
  return rest === '' || TRAILING_UNIT_SUFFIX_PATTERN.test(rest);
};

/**
 * 把注释里写的 `x`/`y` 字段名解析为表格列实际的 `dataIndex`。
 *
 * - 字段为 `undefined` / `null` 时原样返回
 * - 字段 `trim()` 后为空字符串时原样返回（保留调用方语义）
 * - 列名集合中存在精确匹配时直接返回该精确字段
 * - 否则走 {@link columnKeyMatchesConfiguredField} 找第一个命中的列名
 * - 全部不命中时返回原 `configuredField`（让下游决定如何处理"找不到列"）
 */
export const resolveChartAxisFieldToColumnKey = (
  configuredField: string | undefined,
  columnKeys: string[],
): string | undefined => {
  if (configuredField === undefined || configuredField === null) {
    return configuredField;
  }
  const f = configuredField.trim();
  if (!f) return configuredField;
  const keySet = new Set(columnKeys);
  if (keySet.has(f)) return f;
  const hit = columnKeys.find((k) => columnKeyMatchesConfiguredField(k, f));
  return hit ?? configuredField;
};

/**
 * 对单个 chart 配置对象的 `x`/`y` 字段做归一化，返回新对象。
 *
 * 不修改入参，未声明 `x`/`y` 的配置原样保留其它字段。
 */
export const normalizeChartConfigAxisFields = <
  T extends { x?: string; y?: string },
>(
  cfg: T,
  columnKeys: string[],
): T => ({
  ...cfg,
  x: resolveChartAxisFieldToColumnKey(cfg.x, columnKeys),
  y: resolveChartAxisFieldToColumnKey(cfg.y, columnKeys),
});
