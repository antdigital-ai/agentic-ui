/**
 * 数值格式化工具函数
 */

export interface NumberFormatOptions {
  precision?: number;
  groupSeparator?: string;
}

/**
 * 格式化数值
 * @param value 原始数值
 * @param options 格式化选项
 * @returns 格式化后的字符串
 */
export const formatNumber = (
  value: number | string | null | undefined,
  options: NumberFormatOptions = {},
): string => {
  const { precision, groupSeparator = ',' } = options;

  // 处理空值
  if (value === null || value === undefined || value === '') {
    return `--`;
  }

  // 转换为数字
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // 检查是否为有效数字
  if (isNaN(numValue)) {
    return `--`;
  }

  // 应用精度
  let formattedValue =
    precision !== undefined ? numValue.toFixed(precision) : numValue.toString();

  // 应用千分位分隔符
  if (groupSeparator && groupSeparator !== '') {
    const parts = formattedValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
    formattedValue = parts.join('.');
  }

  return `${formattedValue}`;
};

/**
 * 检查值是否为有效的数值
 */
export const isValidNumber = (value: any): boolean => {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(numValue) && isFinite(numValue);
};
