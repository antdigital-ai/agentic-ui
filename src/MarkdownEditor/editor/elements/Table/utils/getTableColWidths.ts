import {
  TABLE_COL_WIDTH_MIN_COLUMNS,
  TABLE_DEFAULT_COL_WIDTH,
} from '../../../../../Constants/mobile';

/** 只读表格列宽计算的输入参数 */
export interface ReadonlyTableColWidthsInput {
  /** 表格列数，取自 element.children[0].children.length */
  columnCount: number;
  /** 表格 otherProps，可含 colWidths 覆盖默认计算 */
  otherProps?: { colWidths?: number[] } | null;
}

/**
 * 列宽值：px 数字或百分比字符串（如 '25%'）
 */
export type ColWidthValue = number | string;

/**
 * 计算只读表格列宽（纯函数，无副作用）
 *
 * ## 策略优先级
 * 1. **显式传入**：otherProps.colWidths 存在时直接返回，不参与自动计算
 * 2. **1–4 列**：返回百分比实现平分，如 4 列为 ['25%','25%','25%','25%']
 * 3. **5 列及以上**：每列 TABLE_DEFAULT_COL_WIDTH (120px)
 *
 * ## 使用说明
 * - 由 ReadonlyTableComponent 在「宽度不足」时调用，宽容器下不调用
 * - 详见 Table/utils/README.md
 *
 * @param input - 列数与 otherProps
 * @returns 列宽数组，支持 number (px) 或 string (如 '25%')
 */
export function getReadonlyTableColWidths(
  input: ReadonlyTableColWidthsInput,
): ColWidthValue[] {
  const { columnCount, otherProps } = input;

  if (otherProps?.colWidths && otherProps.colWidths.length > 0) {
    return otherProps.colWidths;
  }

  if (columnCount === 0) {
    return [];
  }

  if (columnCount < TABLE_COL_WIDTH_MIN_COLUMNS) {
    const percent = (100 / columnCount).toFixed(2);
    return Array(columnCount).fill(`${percent}%`);
  }

  return Array(columnCount).fill(TABLE_DEFAULT_COL_WIDTH);
}
