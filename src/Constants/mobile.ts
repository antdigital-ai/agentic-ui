const MOBILE_PADDING_MIN = '4px';
const MOBILE_PADDING_MAX = '12px';
const MOBILE_PADDING_SCALE = '2vw';
const MOBILE_TABLE_MIN_CELL_WIDTH = 96;

/**
 * 表格列宽阈值
 * - 列数 < 5：使用百分比平分
 * - 列数 >= 5：使用 TABLE_DEFAULT_COL_WIDTH 固定宽度
 */
export const TABLE_COL_WIDTH_MIN_COLUMNS = 5;

/** 编辑模式表格：列数 >= 此值时才计算并渲染 data col 元素，否则仅渲染行号列 */
export const TABLE_EDIT_COL_WIDTH_MIN_COLUMNS = 3;

/** 表格默认列宽 (px)，与 style.ts 中 --agentic-ui-table-cell-min-width (120px) 保持一致 */
export const TABLE_DEFAULT_COL_WIDTH = 120;

/** 表格最后一列最小宽度 (px)，弹性列用于吸收剩余空间 */
export const TABLE_LAST_COL_MIN_WIDTH = 80;

export const MOBILE_PADDING = `clamp(${MOBILE_PADDING_MIN}, ${MOBILE_PADDING_SCALE}, ${MOBILE_PADDING_MAX})`;
export const MOBILE_BREAKPOINT = '768px';
export const MOBILE_TABLE_MIN_COLUMN_WIDTH = MOBILE_TABLE_MIN_CELL_WIDTH;
