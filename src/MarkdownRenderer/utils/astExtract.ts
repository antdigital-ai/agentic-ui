import React from 'react';

/**
 * AST 提取工具集——从 mdast / hast / React children 中抽取文本与结构化数据。
 *
 * 这些工具原本散落在 `markdownReactShared.ts` 的开头，按职责单独拆出便于复用与测试。
 */

/**
 * 从 mdast 表格单元格节点中提取纯文本。
 * 递归收集所有 `text` 子节点的 value，去除前后空白。
 */
export const extractCellText = (cell: any): string => {
  if (!cell?.children) return '';
  return cell.children
    .map((child: any) => {
      if (child.type === 'text') return child.value || '';
      if (child.children) return extractCellText(child);
      return '';
    })
    .join('')
    .trim();
};

/**
 * "逗号分组数字"模式（宽松版千分位）：
 * - 可选前缀负号
 * - 必须包含至少一个逗号（中英文皆可）
 * - 最后一段必须 ≥ 3 位数字（千分位的本质是 3 位分组；末段不足 3 位极不可能是数字）
 * - 中间段不限位数（容错用户书写不规范的场景，如 `12,3456`、`1,2,3456`）
 * - 可选小数部分
 *
 * 命中示例：`8,287.44`、`1,234`、`12,3456`、`-29,337.76`、`1，234.5`、`1,234,567`
 * 不命中示例：`1,2`（末段 2 位）、`12,34`（末段 2 位）、`1,2,3`（末段 1 位）、`1,234,abc`（含非数字）
 */
const THOUSAND_SEPARATED_NUMBER_PATTERN =
  /^-?\d+(?:[,，]\d+)*[,，]\d{3,}(?:\.\d+)?$/;

/**
 * 数字主体（含可选千分位 + 可选小数 + 可选科学计数法指数），不含正负号。
 * 用作百分比 / 紧凑后缀模式的内部子片段。
 *
 * 指数部分要求底数后跟非空指数（如 `1.2e3`、`1e-5`、`3E+10`），
 * 不接受 `1e`（指数缺位）、`e3`（缺底数）这类残缺写法。
 *
 * 注意：紧凑后缀字符集是 `[kKmMbBtT]`，与 `e/E` 不冲突。
 */
const NUMERIC_BODY_SOURCE = String.raw`\d+(?:[,，]\d+)*(?:\.\d+)?(?:[eE][+-]?\d+)?`;

/**
 * 百分比模式：`12.5%`、`-3%`、`+12,345.6%`、`100 %`。
 *
 * 设计取舍：百分比保留字面值（`12.5%` → `12.5`），不做 `/100` 转换；
 * 因为 chart 场景下的 y 轴通常会以"百分比"为单位展示，做转换反而会误导。
 */
const PERCENT_PATTERN = new RegExp(
  String.raw`^[+-]?${NUMERIC_BODY_SOURCE}\s*%$`,
);

/**
 * 英文紧凑后缀（k/m/b/t，大小写均可）：`1.2k`、`3M`、`-2.5B`、`+1,234t`。
 *
 * 倍率：`k = 1e3`、`m = 1e6`、`b = 1e9`、`t = 1e12`。
 */
const COMPACT_SUFFIX_PATTERN = new RegExp(
  String.raw`^([+-]?${NUMERIC_BODY_SOURCE})\s*([kKmMbBtT])$`,
);

const COMPACT_SUFFIX_MULTIPLIER: Record<string, number> = {
  k: 1e3,
  m: 1e6,
  b: 1e9,
  t: 1e12,
};

/**
 * 把"逗号分组数字字符串"转为 number。
 *
 * 调用方必须先用 {@link THOUSAND_SEPARATED_NUMBER_PATTERN} 校验过格式，
 * 否则可能误把 `1,2`、`1,2,3` 之类非千分位字符串解析为数字。
 */
const parseThousandSeparatedNumber = (val: string): number => {
  return Number(val.replace(/[,，]/g, ''));
};

/**
 * 表格单元格的"字符串 → 数字 or 原值"统一规则。
 *
 * 规则优先级（自上而下）：
 * 1. 空串 → 直接返回空串
 * 2. `Number(val)` 成功 → 直接返回 number（覆盖纯数字 `42` / `3.14` / `-1.5`）
 * 3. 带正号前缀（`+1,234` / `+3.14`）→ 去掉 `+` 后递归
 * 4. 千分位数字（`8,287.44` / `1,234` / `12,3456`）→ 去逗号转 number
 * 5. 百分比（`12.5%` / `-3%`）→ 去 `%` 去逗号转 number（保留字面值，不除以 100）
 * 6. 英文紧凑后缀（`1.2k` / `3M` / `-2.5B` / `+1,234t`）→ base × multiplier
 * 7. 中文金额（`1.5万` / `2亿` / `5万元`）→ 走 `parseChineseCurrencyToNumber`
 * 8. 都不命中 → 返回原字符串
 *
 * @param val - 单元格文本（已 trim）
 * @param parseChineseCurrencyToNumber - 注入的中文金额解析器
 */
export const coerceTableCellValue = (
  val: string,
  parseChineseCurrencyToNumber: (val: string) => number | null,
): string | number => {
  if (val === '') return val;

  const num = Number(val);
  if (Number.isFinite(num)) return num;

  // 带正号前缀：Number('+1,234') 会失败，但去掉 + 后能命中千分位/紧凑后缀
  if (val.startsWith('+')) {
    const rest = val.slice(1);
    // 防御：避免 '++1' 这类无意义递归
    if (rest && !rest.startsWith('+') && !rest.startsWith('-')) {
      const recursed = coerceTableCellValue(rest, parseChineseCurrencyToNumber);
      if (typeof recursed === 'number') return recursed;
    }
  }

  if (THOUSAND_SEPARATED_NUMBER_PATTERN.test(val)) {
    return parseThousandSeparatedNumber(val);
  }

  if (PERCENT_PATTERN.test(val)) {
    const bare = val.replace(/%\s*$/, '').replace(/[,，]/g, '');
    const n = Number(bare);
    if (Number.isFinite(n)) return n;
  }

  const compactMatch = val.match(COMPACT_SUFFIX_PATTERN);
  if (compactMatch) {
    const [, base, suffix] = compactMatch;
    const baseNum = Number(base.replace(/[,，]/g, ''));
    const multiplier = COMPACT_SUFFIX_MULTIPLIER[suffix.toLowerCase()];
    if (Number.isFinite(baseNum) && multiplier) {
      return baseNum * multiplier;
    }
  }

  const cn = parseChineseCurrencyToNumber(val);
  return cn !== null ? cn : val;
};

/**
 * 从 mdast `table` 节点提取列定义和数据行。
 *
 * - 第一行视为表头，其余行作为数据
 * - 数据值的字符串 → 数字转换规则参见 {@link coerceTableCellValue}
 *
 * @returns 解析失败（缺表头 / 空表）时返回 `null`
 */
export const extractTableData = (
  tableNode: any,
  parseChineseCurrencyToNumber: (val: string) => number | null,
): {
  columns: { title: string; dataIndex: string }[];
  dataSource: Record<string, any>[];
} | null => {
  if (!tableNode.children?.length) return null;

  const headerRow = tableNode.children[0];
  if (!headerRow?.children?.length) return null;

  const columns = headerRow.children.map((cell: any) => {
    const text = extractCellText(cell);
    return { title: text, dataIndex: text, key: text };
  });

  const dataSource: Record<string, any>[] = [];
  for (let i = 1; i < tableNode.children.length; i++) {
    const row = tableNode.children[i];
    if (!row?.children) continue;
    const record: Record<string, any> = { key: `row-${i}` };
    row.children.forEach((cell: any, j: number) => {
      if (j < columns.length) {
        const val = extractCellText(cell);
        record[columns[j].dataIndex] = coerceTableCellValue(
          val,
          parseChineseCurrencyToNumber,
        );
      }
    });
    dataSource.push(record);
  }

  return { columns, dataSource };
};

/**
 * 从 className 字符串/数组中提取 `language-xxx` 形式的语言标识。
 *
 * 与 `pre > code` 的代码块语言识别配套使用。
 */
export const extractLanguageFromClassName = (
  className: string | string[] | undefined,
): string | undefined => {
  if (!className) return undefined;
  const flat =
    typeof className === 'string' ? className : className.map(String).join(' ');
  const classes = flat.split(/\s+/).filter(Boolean);
  for (const cls of classes) {
    const match = cls.match(/^language-(.+)$/);
    if (match) return match[1];
  }
  return undefined;
};

/**
 * 递归提取 React children 中的纯文本。
 *
 * 用于在 hast → React 转换后，从已渲染的子树重新拿到原始文本（如 `<think>` 内容）。
 */
export const extractChildrenText = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children))
    return children.map(extractChildrenText).join('');
  if (React.isValidElement(children) && (children as any).props?.children) {
    return extractChildrenText((children as any).props.children);
  }
  return '';
};
