const MOBILE_PADDING_MIN = '4px';
const MOBILE_PADDING_MAX = '12px';
const MOBILE_PADDING_SCALE = '2vw';
const MOBILE_TABLE_MIN_CELL_WIDTH = 96;

/** 表格列宽计算的列数阈值，少于该列数不设置 col 元素，使用浏览器默认布局 */
export const TABLE_COL_WIDTH_MIN_COLUMNS = 3;

/** 表格默认列宽，与 style.ts 中 --table-cell-min-width (120px) 保持一致 */
export const TABLE_DEFAULT_COL_WIDTH = 120;

/** 表格最后一列最小宽度（弹性列） */
export const TABLE_LAST_COL_MIN_WIDTH = 80;

export const MOBILE_PADDING = `clamp(${MOBILE_PADDING_MIN}, ${MOBILE_PADDING_SCALE}, ${MOBILE_PADDING_MAX})`;
export const MOBILE_BREAKPOINT = '768px';
export const MOBILE_TABLE_MIN_COLUMN_WIDTH = MOBILE_TABLE_MIN_CELL_WIDTH;
