/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/ban-types */

import dayjs from 'dayjs';

/**
 * @fileoverview 图表插件工具函数文件
 *
 * 该文件提供了图表数据处理、格式化、转换等工具函数。
 * 包括数字格式化、数据验证、排序、查找等功能。
 *
 * @author md-editor
 * @version 1.0.0
 * @since 2024
 */

/**
 * 创建一个新的 `Intl.NumberFormat` 实例，用于将数字格式化为美国英语的十进制格式。
 *
 * @constant
 * @type {Intl.NumberFormat}
 * @default
 * @example
 * const formattedNumber = intl.format(1234567.89);
 * console.log(formattedNumber); // 输出: "1,234,567.89"
 */
const intl = new Intl.NumberFormat('en-US', {
  style: 'decimal',
});

/**
 * 将数字或字符串格式化为字符串。
 *
 * @param value - 要格式化的值，可以是字符串或数字。
 * @returns 格式化后的字符串。如果输入值为字符串，则直接返回该字符串；
 *          如果输入值为数字，则使用 `intl.format` 方法格式化后返回；
 *          如果输入值为空或格式化过程中发生错误，则返回原始值。
 */
export const stringFormatNumber = (value: string | number) => {
  if (!value) return value;
  try {
    if (typeof value === 'string') return value;

    if (typeof value === 'number') {
      return intl.format(Number(value));
    }
    return value;
  } catch (error) {
    return value;
  }
};

/**
 * 防抖函数
 *
 * 创建一个防抖函数，该函数会在调用后等待指定的延迟时间，
 * 如果在延迟时间内再次调用，则重新开始计时。
 * 常用于限制函数调用频率，如搜索输入、窗口调整等场景。
 *
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数，包含以下方法：
 *   - `flush()`: 立即执行函数并清除定时器
 *   - `cancel()`: 取消延迟执行
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('搜索:', query);
 * }, 300);
 *
 * // 调用防抖函数
 * debouncedSearch('hello');
 * debouncedSearch('world'); // 只有这个会执行
 *
 * // 立即执行
 * debouncedSearch.flush();
 *
 * // 取消执行
 * debouncedSearch.cancel();
 * ```
 *
 * @since 1.0.0
 */
export function debounce(
  func: { (): void; apply?: any },
  delay: number | undefined,
) {
  let timer: any = null;
  const fn = function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      //@ts-ignore
      func.apply(this, arguments);
    }, delay);
  };
  fn.flush = function () {
    clearTimeout(timer);
    //@ts-ignore
    func.apply(this, arguments);
  };
  fn.cancel = function () {
    clearTimeout(timer);
  };
  return fn;
}

/**
 * 图表数据项接口
 *
 * 定义了图表中单个数据项的结构，用于统一各种图表类型的数据格式。
 * 支持多种图表类型的数据表示，包括分类、类型、坐标等信息。
 *
 * @interface ChartDataItem
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const dataItem: ChartDataItem = {
 *   x: '2024-01',
 *   y: 100,
 *   category: '销售',
 *   type: '产品A',
 *   xtitle: '月份',
 *   ytitle: '销售额',
 *   filterLabel: 'Q1'
 * };
 * ```
 */
export interface ChartDataItem {
  /** 数据类别，用于数据分组和筛选 */
  category?: string;
  /** 数据类型，用于区分不同的数据系列 */
  type?: string;
  /** X轴值，可以是数字或字符串 */
  x: number | string;
  /** Y轴值，可以是数字或字符串 */
  y: number | string;
  /** X轴标题，用于显示轴标签 */
  xtitle?: string;
  /** Y轴标题，用于显示轴标签 */
  ytitle?: string;
  /** 筛选标签，用于数据筛选和过滤 */
  filterLabel?: string;
  /** 类目排序键；配置 `sortBy` / `index` 列后用于 X 轴顺序 */
  sortBy?: number | string;
}

/** 未提供 type 时的默认数据序列名（与折线/柱状等图表一致） */
export const DEFAULT_CHART_DATASET_TYPE = '默认';

/** 未配置 sortBy 时，若表格存在该列则自动用于 X 轴排序 */
export const CHART_AUTO_SORT_BY_COLUMN = 'index';

/**
 * 雷达图数据项：与 {@link ChartDataItem} 同形。
 * - `x`：雷达轴维度（如「产品」「技术」）
 * - `y`：分值
 * - `type`：图例序列名
 * - `category`：工具栏筛选项
 *
 * 兼容历史字段 `label` / `score`（分别映射为 x / y）。
 */
export type RadarChartDataItem = ChartDataItem & {
  /** @deprecated 请使用 x */
  label?: string;
  /** @deprecated 请使用 y */
  score?: number | string;
};

export type RadarChartDataInput = Partial<ChartDataItem> & {
  label?: string;
  score?: number | string;
};

/**
 * 解析图表 Y 轴数值（雷达图分值、柱状图高度等）
 */
export const parseChartDataYValue = (
  value: number | string | null | undefined,
): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return 0;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
    return 0;
  }
  return 0;
};

/**
 * 将雷达图入参归一化为 {@link ChartDataItem}（与 LineChart / BarChart 等一致）
 */
export const normalizeRadarChartData = (
  data: RadarChartDataInput[] | null | undefined,
): ChartDataItem[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  const result: ChartDataItem[] = [];

  for (const raw of data) {
    if (raw === null || raw === undefined || typeof raw !== 'object') {
      continue;
    }

    const x = raw.x ?? raw.label;
    const y = raw.y ?? raw.score;

    if (x === null || x === undefined || String(x).trim() === '') {
      continue;
    }
    if (y === null || y === undefined || y === '') {
      continue;
    }

    const type = raw.type?.trim() ? raw.type : DEFAULT_CHART_DATASET_TYPE;

    result.push({
      category: raw.category,
      type,
      x,
      y,
      xtitle: raw.xtitle,
      ytitle: raw.ytitle,
      filterLabel: raw.filterLabel,
    });
  }

  return result;
};

/** 1 亿（人民币口语单位）对应的「元」数量 */
const CHINESE_YI_TO_YUAN = 1e8;
/** 1 万对应的「元」数量 */
const CHINESE_WAN_TO_YUAN = 1e4;

/**
 * 将含「亿元 / 万元 / 元」的人民币口语字符串转为数值（以「元」为数值单位）。
 *
 * - `533亿元` → `533 * 1e8`
 * - `549万元` → `549 * 1e4`
 * - `128.5元` → `128.5`
 *
 * 不含上述单位且无法识别为纯数字时返回 `null`，避免误解析如 `8%`。
 *
 * @param value - 原始单元格或字段值
 * @returns 解析后的有限数字，无法解析则为 `null`
 */
export const parseChineseCurrencyToNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== 'string') return null;

  let s = value.trim();
  if (!s) return null;

  s = s
    .replace(/,/g, '')
    .replace(/，/g, '')
    .replace(/[￥¥\s]/g, '');

  const yi = s.match(/(-?\d+(?:\.\d+)?)\s*亿/);
  if (yi) {
    const n = parseFloat(yi[1]);
    return Number.isFinite(n) ? n * CHINESE_YI_TO_YUAN : null;
  }

  const wan = s.match(/(-?\d+(?:\.\d+)?)\s*万/);
  if (wan) {
    const n = parseFloat(wan[1]);
    return Number.isFinite(n) ? n * CHINESE_WAN_TO_YUAN : null;
  }

  const yuan = s.match(/(-?\d+(?:\.\d+)?)\s*元/);
  if (yuan) {
    const n = parseFloat(yuan[1]);
    return Number.isFinite(n) ? n : null;
  }

  return null;
};

/**
 * 归一化 X 轴值
 *
 * 将字符串数字转换为数字类型，避免重复标签问题。
 * 如果输入已经是数字，直接返回；如果是字符串，尝试转换为数字。
 * 转换失败时返回原始值。
 *
 * @param {number | string} value - 原始 X 轴值
 * @returns {number | string} 归一化后的值
 *
 * @example
 * ```typescript
 * normalizeXValue(123); // 123
 * normalizeXValue('456'); // 456
 * normalizeXValue('abc'); // 'abc'
 * normalizeXValue(''); // ''
 * ```
 *
 * @since 1.0.0
 */
export const normalizeXValue = (value: number | string): number | string => {
  if (typeof value === 'number') return value;
  const s = String(value).trim();
  if (s === '') return value;
  const n = Number(s);
  if (Number.isFinite(n)) return n;
  const cn = parseChineseCurrencyToNumber(s);
  return cn !== null ? cn : value;
};

/**
 * 比较两个 X 轴值的大小
 *
 * 用于对 X 轴值进行排序，支持数字和字符串的混合比较。
 * 比较规则：
 * 1. 数字优先于字符串
 * 2. 数字按数值大小比较
 * 3. 字符串按字典序比较
 *
 * @param {number | string} a - 第一个值
 * @param {number | string} b - 第二个值
 * @returns {number} 比较结果：负数表示 a < b，0 表示 a = b，正数表示 a > b
 *
 * @example
 * ```typescript
 * compareXValues(1, 2); // -1
 * compareXValues('a', 'b'); // -1
 * compareXValues(1, 'a'); // -1 (数字优先)
 * compareXValues('a', 1); // 1 (数字优先)
 * ```
 *
 * @since 1.0.0
 */
export const compareXValues = (
  a: number | string,
  b: number | string,
): number => {
  const normalizedA = normalizeXValue(a);
  const normalizedB = normalizeXValue(b);

  // 如果都是数字，按数值比较
  if (typeof normalizedA === 'number' && typeof normalizedB === 'number') {
    return normalizedA - normalizedB;
  }

  // 如果一个是数字，一个是字符串，数字优先
  if (typeof normalizedA === 'number' && typeof normalizedB === 'string') {
    return -1;
  }
  if (typeof normalizedA === 'string' && typeof normalizedB === 'number') {
    return 1;
  }

  // 如果都是字符串，按字符串比较
  return String(normalizedA).localeCompare(String(normalizedB));
};

/** 月.日-月.日 区间，如 2.7-2.13(节前冲刺) */
const CHART_X_MD_RANGE_PATTERN =
  /^(\d{1,2})\.(\d{1,2})\s*[-–—~至]\s*(\d{1,2})\.(\d{1,2})/;

/** ISO 风格日期或日期区间起始，如 2024-01、2024/01/15 */
const CHART_X_ISO_DATE_PATTERN = /^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/;

/**
 * 解析 X 轴日期/日期区间的排序键；非日期返回 null
 */
export const parseChartXDateSortKey = (
  value: number | string,
): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    if (value >= 1000 && value <= 9999) {
      return dayjs(`${value}-01-01`).valueOf();
    }
    return null;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const mdRange = raw.match(CHART_X_MD_RANGE_PATTERN);
  if (mdRange) {
    const month = Number(mdRange[1]);
    const day = Number(mdRange[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return dayjs()
        .month(month - 1)
        .date(day)
        .startOf('day')
        .valueOf();
    }
  }

  const iso = raw.match(CHART_X_ISO_DATE_PATTERN);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = iso[3] ? Number(iso[3]) : 1;
    const parsed = dayjs(`${year}-${month}-${day}`);
    if (parsed.isValid()) return parsed.valueOf();
  }

  if (/^\d{4}$/.test(raw)) {
    const year = dayjs(`${raw}-01-01`);
    if (year.isValid()) return year.valueOf();
  }

  if (
    /^\d{4}-\d{1,2}(-\d{1,2})?$/.test(raw) ||
    /^\d{4}\/\d{1,2}(\/\d{1,2})?$/.test(raw)
  ) {
    const parsed = dayjs(raw);
    if (parsed.isValid()) return parsed.valueOf();
  }

  return null;
};

export const isChartXDateOrRange = (value: number | string): boolean =>
  parseChartXDateSortKey(value) !== null;

export const areAllChartXDateOrRange = (
  values: Array<number | string>,
): boolean =>
  values.length > 0 && values.every((value) => isChartXDateOrRange(value));

/**
 * 比较两个 X 轴日期/区间；非日期返回 0（不改变相对顺序）
 */
export const compareChartXValues = (
  a: number | string,
  b: number | string,
): number => {
  const keyA = parseChartXDateSortKey(a);
  const keyB = parseChartXDateSortKey(b);
  if (keyA === null || keyB === null) return 0;
  return keyA - keyB;
};

const getChartXValueDedupeKey = (value: number | string): string => {
  const normalized = normalizeXValue(value);
  return typeof normalized === 'number'
    ? `n:${normalized}`
    : `s:${String(normalized)}`;
};

/** 按数据出现顺序去重提取 X 值 */
export const uniqueChartXValuesPreservingOrder = (
  data: ChartDataItem[],
): Array<number | string> => {
  const result: Array<number | string> = [];
  const seen = new Set<string>();

  for (const item of data) {
    const x = item.x;
    if (x === null || x === undefined || x === '' || String(x).trim() === '') {
      continue;
    }
    const normalized = normalizeXValue(x);
    const key = getChartXValueDedupeKey(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
};

/**
 * 表格行按 x 字段排序：仅当全部为日期/区间时排序，否则保持原顺序
 */
export const sortChartDataRowsByXField = <T extends Record<string, unknown>>(
  rows: T[],
  xField: string,
): T[] => {
  if (rows.length === 0) return rows;

  const xValues = rows.map((row) => {
    const raw = row[xField];
    if (raw === null || raw === undefined || raw === '') {
      return null;
    }
    return normalizeXValue(raw as number | string);
  });

  if (xValues.some((value) => value === null)) {
    return rows;
  }

  if (!areAllChartXDateOrRange(xValues as Array<number | string>)) {
    return rows;
  }

  return [...rows].sort((rowA, rowB) =>
    compareChartXValues(
      rowA[xField] as number | string,
      rowB[xField] as number | string,
    ),
  );
};

/**
 * 检查两个 X 轴值是否相等
 *
 * 比较两个 X 轴值是否相等，支持数字和字符串的混合比较。
 * 先对值进行归一化处理，然后进行比较。
 *
 * @param {number | string} a - 第一个值
 * @param {number | string} b - 第二个值
 * @returns {boolean} 是否相等
 *
 * @example
 * ```typescript
 * isXValueEqual(1, 1); // true
 * isXValueEqual('1', 1); // true
 * isXValueEqual('a', 'a'); // true
 * isXValueEqual(1, 2); // false
 * ```
 *
 * @since 1.0.0
 */
export const isXValueEqual = (
  a: number | string,
  b: number | string,
): boolean => {
  const normalizedA = normalizeXValue(a);
  const normalizedB = normalizeXValue(b);

  if (typeof normalizedA === 'number' && typeof normalizedB === 'number') {
    return normalizedA === normalizedB;
  }

  return String(normalizedA) === String(normalizedB);
};

/**
 * 解析图表排序列名：显式 `sortBy` 优先，否则表格含 `index` 列时自动使用
 */
export const resolveChartSortByField = (
  rows: Array<Record<string, unknown>> | null | undefined,
  explicitSortBy?: string,
  getCellValue: (row: Record<string, unknown>, field: string) => unknown = (
    row,
    field,
  ) => row[field],
): string | undefined => {
  if (explicitSortBy) return explicitSortBy;
  const data = rows ?? [];
  const hasIndexColumn = data.some((row) => {
    const value = getCellValue(row, CHART_AUTO_SORT_BY_COLUMN);
    return value !== null && value !== undefined && String(value).trim() !== '';
  });
  return hasIndexColumn ? CHART_AUTO_SORT_BY_COLUMN : undefined;
};

/**
 * 解析 sortBy 排序字段值
 */
export const parseSortByValue = (value: unknown): number | string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const s = String(value).trim();
  if (s === '') return null;
  const n = Number(s);
  if (Number.isFinite(n)) return n;
  return s;
};

/**
 * 比较两个 sortBy 值；缺失值排在后面
 */
export const compareSortByValues = (
  a: number | string | null,
  b: number | string | null,
): number => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return compareXValues(a, b);
};

/**
 * 数据是否包含有效的 sortBy 字段
 */
export const hasChartSortBy = (data: ChartDataItem[]): boolean =>
  data.some((item) => parseSortByValue(item.sortBy) !== null);

/**
 * 取某一 x 类目对应的 sortBy（多行取最小值）
 */
export const getSortByForX = (
  data: ChartDataItem[],
  xValue: number | string,
): number | string | null => {
  let best: number | string | null = null;
  for (const item of data) {
    if (!isXValueEqual(item.x, xValue)) continue;
    const sortBy = parseSortByValue(item.sortBy);
    if (sortBy === null) continue;
    if (best === null || compareSortByValues(sortBy, best) < 0) {
      best = sortBy;
    }
  }
  return best;
};

/**
 * 从数据中提取并排序 X 轴值
 *
 * 从图表数据数组中提取所有唯一的 X 轴值。
 * 有 sortBy/index 时按 sortBy 排序；否则仅当全部为日期/日期区间时按时间排序，其余保持数据顺序。
 *
 * @param {ChartDataItem[]} data - 图表数据数组
 * @returns {Array<number | string>} 排序后的唯一 X 轴值数组
 *
 * @example
 * ```typescript
 * const data = [
 *   { x: '2024-01', y: 100 },
 *   { x: '2024-02', y: 200 },
 *   { x: '2024-01', y: 150 }, // 重复值
 *   { x: 3, y: 300 }
 * ];
 * const sortedValues = extractAndSortXValues(data);
 * // ['2024-01', '2024-02', 3]
 * ```
 *
 * @since 1.0.0
 */
export const extractAndSortXValues = (
  data: ChartDataItem[],
): Array<number | string> => {
  const uniqueValues = uniqueChartXValuesPreservingOrder(data);

  if (hasChartSortBy(data)) {
    const position = new Map<number | string, number>();
    uniqueValues.forEach((value, index) => {
      position.set(value, index);
    });

    return [...uniqueValues].sort((a, b) => {
      const sortCmp = compareSortByValues(
        getSortByForX(data, a),
        getSortByForX(data, b),
      );
      if (sortCmp !== 0) return sortCmp;
      return (position.get(a) ?? 0) - (position.get(b) ?? 0);
    });
  }

  if (areAllChartXDateOrRange(uniqueValues)) {
    return [...uniqueValues].sort(compareChartXValues);
  }

  return uniqueValues;
};

/**
 * 根据 X 轴值查找对应的数据点
 *
 * 在数据数组中查找指定 X 轴值对应的数据点。
 * 可以指定数据类型进行精确匹配。
 *
 * @param {ChartDataItem[]} data - 数据数组
 * @param {number | string} xValue - X 轴值
 * @param {string} [type] - 数据类型，可选
 * @returns {ChartDataItem | undefined} 匹配的数据点，如果未找到返回 undefined
 *
 * @example
 * ```typescript
 * const data = [
 *   { x: '2024-01', y: 100, type: 'A' },
 *   { x: '2024-01', y: 200, type: 'B' },
 *   { x: '2024-02', y: 300, type: 'A' }
 * ];
 *
 * // 查找所有类型
 * findDataPointByXValue(data, '2024-01'); // 第一个匹配项
 *
 * // 查找指定类型
 * findDataPointByXValue(data, '2024-01', 'B'); // { x: '2024-01', y: 200, type: 'B' }
 * ```
 *
 * @since 1.0.0
 */
export const findDataPointByXValue = (
  data: ChartDataItem[],
  xValue: number | string,
  type?: string,
): ChartDataItem | undefined => {
  if (!type) return data.find((item) => isXValueEqual(item.x, xValue));
  return data.find(
    (item) => item.type === type && isXValueEqual(item.x, xValue),
  );
};

/**
 * 将值转换为数字
 *
 * 安全地将任意值转换为数字类型，转换失败时返回默认值。
 * 如果输入已经是有效的数字，直接返回；否则尝试转换。
 * 字符串支持「亿元 / 万元 / 元」等人民币口语格式（见 `parseChineseCurrencyToNumber`）。
 *
 * @param {any} val - 要转换的值
 * @param {number} fallback - 转换失败时的默认值
 * @returns {number} 转换后的数字
 *
 * @example
 * ```typescript
 * toNumber('123', 0); // 123
 * toNumber(456, 0); // 456
 * toNumber('abc', 0); // 0
 * toNumber(null, 100); // 100
 * ```
 *
 * @since 1.0.0
 */
export const toNumber = (val: any, fallback: number): number => {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  const n = Number(val);
  if (Number.isFinite(n)) return n;
  if (typeof val === 'string') {
    const cn = parseChineseCurrencyToNumber(val);
    if (cn !== null && Number.isFinite(cn)) return cn;
  }
  return fallback;
};

/**
 * 检查值是否不为空
 *
 * 检查值是否不为 null 和 undefined。
 * 用于数据验证和条件判断。
 *
 * @param {any} val - 要检查的值
 * @returns {boolean} 是否不为空
 *
 * @example
 * ```typescript
 * isNotEmpty('hello'); // true
 * isNotEmpty(0); // true
 * isNotEmpty(''); // true
 * isNotEmpty(null); // false
 * isNotEmpty(undefined); // false
 * ```
 *
 * @since 1.0.0
 */
export const isNotEmpty = (val: any) => {
  return val !== null && val !== undefined;
};

/**
 * 生成数据数组的快速哈希值
 *
 * 用于优化 useMemo 的依赖项比较，避免使用 JSON.stringify 的性能开销。
 * 通过比较数组长度和最后一个元素的引用来快速判断数据是否变化。
 * 适用于流式数据场景，当数据频繁追加时性能更好。
 *
 * @param {any[]} data - 数据数组
 * @returns {string} 哈希值字符串
 *
 * @example
 * ```typescript
 * const hash1 = getDataHash([{ x: 1, y: 2 }]);
 * const hash2 = getDataHash([{ x: 1, y: 2 }, { x: 3, y: 4 }]);
 * // hash1 !== hash2
 * ```
 *
 * @since 1.0.0
 */
export const getDataHash = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) {
    return `0-${data?.length || 0}`;
  }
  // 使用长度和最后一个元素的引用作为快速哈希
  // 对于流式数据，通常只有新增，所以比较最后一个元素即可
  const lastItem = data[data.length - 1];
  const firstItem = data[0];
  // 使用简单的哈希：长度 + 首尾元素的简单标识
  const firstKey = firstItem ? Object.keys(firstItem).join(',') : '';
  const lastKey = lastItem ? Object.keys(lastItem).join(',') : '';
  return `${data.length}-${firstKey}-${lastKey}`;
};

/**
 * 深度比较两个配置对象的关键字段
 *
 * 用于优化 useMemo 的依赖项比较，只比较配置的关键字段，
 * 避免对整个配置对象进行深度比较的性能开销。
 *
 * @param {any} config1 - 第一个配置对象
 * @param {any} config2 - 第二个配置对象
 * @returns {boolean} 是否相等
 *
 * @example
 * ```typescript
 * const config1 = { x: 'date', y: 'value', height: 400 };
 * const config2 = { x: 'date', y: 'value', height: 400 };
 * isConfigEqual(config1, config2); // true
 * ```
 *
 * @since 1.0.0
 */
export const isConfigEqual = (config1: any, config2: any): boolean => {
  if (config1 === config2) return true;
  if (!config1 || !config2) return false;

  const keys1 = Object.keys(config1);
  const keys2 = Object.keys(config2);

  if (keys1.length !== keys2.length) return false;

  // 只比较关键字段
  const keyFields = ['x', 'y', 'height', 'index', 'sortBy', 'rest'];
  for (const key of keyFields) {
    if (config1[key] !== config2[key]) {
      // 对于 rest 对象，进行浅比较
      if (key === 'rest' && config1[key] && config2[key]) {
        const rest1 = config1[key];
        const rest2 = config2[key];
        const restKeys1 = Object.keys(rest1);
        const restKeys2 = Object.keys(rest2);
        if (restKeys1.length !== restKeys2.length) return false;
        for (const restKey of restKeys1) {
          if (rest1[restKey] !== rest2[restKey]) return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
};

/**
 * 将 RGB/RGBA 颜色字符串转换为十六进制格式
 *
 * @param {string} rgb - RGB/RGBA 颜色字符串（如 'rgb(29, 122, 252)' 或 'rgba(29, 122, 252, 0.5)'）
 * @returns {string} 十六进制颜色值（如 '#1d7afc'）
 *
 * @since 1.0.0
 */
const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * 从浏览器 DOM 中解析 CSS 变量的实际颜色值
 *
 * @param {string} cssVar - CSS 变量表达式（如 'var(--color-blue)'）
 * @returns {string} 解析后的颜色值（如 '#1d7afc'）或原值
 *
 * @example
 * ```typescript
 * resolveCssVariable('var(--color-blue-control-fill-primary)'); // '#1d7afc'
 * resolveCssVariable('#ff0000'); // '#ff0000'
 * ```
 *
 * @since 1.0.0
 */
export const resolveCssVariable = (() => {
  const cssVariableCache = new Map<string, string>();

  return (cssVar: string): string => {
    // 如果不是 CSS 变量，直接返回
    if (!cssVar.trim().startsWith('var(')) {
      return cssVar;
    }

    if (cssVariableCache.has(cssVar)) {
      return cssVariableCache.get(cssVar)!;
    }

    // 提取变量名，如 'var(--color-blue)' => '--color-blue'
    const match = cssVar.match(/var\((--[^)]+)\)/);
    if (!match) {
      // 无法匹配也缓存，避免重复解析
      cssVariableCache.set(cssVar, cssVar);
      return cssVar;
    }

    let resolvedColor = cssVar;
    // 从 DOM 中获取计算后的样式值
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        // 创建临时元素来获取计算后的颜色值
        const tempEl = document.createElement('div');
        tempEl.style.color = cssVar;
        document.body.appendChild(tempEl);
        const computedColor = window.getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);

        // 如果解析成功，将 rgb/rgba 转换为十六进制
        if (computedColor && computedColor !== cssVar) {
          resolvedColor = rgbToHex(computedColor);
        }
      } catch (e) {
        console.warn(`Failed to resolve CSS variable: ${cssVar}`, e);
      }
    }

    cssVariableCache.set(cssVar, resolvedColor);
    return resolvedColor;
  };
})();

/**
 * 将十六进制颜色或CSS变量转换为带透明度的 RGBA 字符串
 *
 * 支持3位和6位十六进制颜色格式、CSS变量（如 var(--color-name)），并添加透明度。
 *
 * @param {string} color - 颜色值（如 '#ff0000'、'#f00' 或 'var(--color-blue)'）
 * @param {number} alpha - 透明度值（0-1之间）
 * @returns {string} RGBA 颜色字符串
 *
 * @example
 * ```typescript
 * hexToRgba('#ff0000', 0.5); // 'rgba(255, 0, 0, 0.5)'
 * hexToRgba('#f00', 0.8); // 'rgba(255, 0, 0, 0.8)'
 * hexToRgba('var(--color-blue)', 0.5); // 'rgba(29, 122, 252, 0.5)'
 * ```
 *
 * @since 1.0.0
 */
export const hexToRgba = (color: string, alpha: number): string => {
  // 解析 CSS 变量为实际颜色值
  const resolvedColor = resolveCssVariable(color);

  // 处理十六进制颜色
  const sanitized = resolvedColor.replace('#', '');
  const isShort = sanitized.length === 3;
  const r = parseInt(
    isShort ? sanitized[0] + sanitized[0] : sanitized.slice(0, 2),
    16,
  );
  const g = parseInt(
    isShort ? sanitized[1] + sanitized[1] : sanitized.slice(2, 4),
    16,
  );
  const b = parseInt(
    isShort ? sanitized[2] + sanitized[2] : sanitized.slice(4, 6),
    16,
  );
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// 导出 Chart.js 注册相关函数
export {
  registerBarChartComponents,
  registerChartComponents,
  registerLineChartComponents,
} from './utils/registerChart';
