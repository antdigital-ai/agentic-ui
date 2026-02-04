import type { Root, RootContent, Table } from 'mdast';
import rehypeRaw from 'rehype-raw';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { ChartTypeConfig } from '../../../el';
import {
  convertParagraphToImage,
  fixStrongWithSpecialChars,
} from '../remarkParse';
//@ts-ignore
import rehypeKatex from 'rehype-katex';
import remarkFrontmatter from 'remark-frontmatter';
import { CardNode, ChartNode, CodeNode, Elements } from '../../../el';
import { MarkdownEditorPlugin } from '../../../plugin';
import { TableNode, TrNode as TableRowNode } from '../../types/Table';
import { EditorUtils } from '../../utils';
import type { ParserMarkdownToSlateNodeConfig } from '../parserMarkdownToSlateNode';

// 表格相关常量
export const MIN_TABLE_CELL_LENGTH = 5; // 表格单元格最小长度
export const tableRegex = /^\|.*\|\s*\n\|[-:| ]+\|/m;

// 创建 remark 实例用于 stringify
const stringifyObj = remark()
  .use(remarkParse)
  .use(fixStrongWithSpecialChars)
  .use(convertParagraphToImage)
  .use(remarkMath as any, {
    singleDollarTextMath: false,
  })
  .use(remarkRehype as any, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeKatex as any)
  .use(remarkGfm, { singleTilde: false }) // 禁用单波浪线删除线
  .use(remarkFrontmatter, ['yaml']);

const myRemark = {
  stringify: (obj: Root) => {
    const mdStr = stringifyObj.stringify(obj);
    return mdStr;
  },
};

// 类型定义
type AlignType = 'left' | 'center' | 'right' | null;

/**
 * 高级数字检查
 */
const advancedNumericCheck = (value: string | number) => {
  const numericPattern = /^[-+]?[0-9,]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
  return (
    typeof value === 'number' ||
    (typeof value === 'string' && numericPattern.test(value))
  );
};

/**
 * 判断是否为数字值
 */
const isNumericValue = (value: string | number) => {
  return (
    typeof value === 'number' ||
    (!isNaN(parseFloat(value)) && isFinite(value as unknown as number)) ||
    advancedNumericCheck(value)
  );
};

/**
 * 判断是否包含不完整输入
 * 如果一行中包含可能尚未完成的数字输入，返回 true
 */
const hasIncompleteNumericInput = (values: any[]): boolean => {
  // 检查是否有可能是正在输入的不完整数字
  // 例如: '12.' 或 '0.' 或 '-' 或 仅有一个数字字符的情况
  return values.some((val) => {
    if (typeof val !== 'string') return false;
    return (
      (val.endsWith('.') && /\d/.test(val)) || // 以小数点结尾
      val === '-' || // 只有负号
      val === '+' || // 只有正号
      (val.length === 1 && /\d/.test(val)) // 只有一个数字
    );
  });
};

/**
 * 规范化字段名，统一处理转义字符
 * 将 `index\_value` 转换为 `index_value`，确保字段名一致
 * @param fieldName - 原始字段名
 * @returns 规范化后的字段名
 */
export const normalizeFieldName = (fieldName: string): string => {
  if (!fieldName) return fieldName;
  // 移除转义字符：将 `\_` 转换为 `_`，`\\` 转换为 `\`
  return fieldName
    .replace(/\\_/g, '_')
    .replace(/\\\\/g, '\\')
    .replace(/\\(?=")/g, '') // 移除转义的双引号
    .trim();
};

/**
 * 获取列对齐方式
 */
export const getColumnAlignment = (
  data: any[],
  columns: {
    dataIndex: string;
  }[],
): AlignType[] => {
  if (!data.length) return [];

  // 缓存上一次的对齐结果，避免频繁切换
  const prevAlignments: AlignType[] = [];

  return columns.map((col, index) => {
    const values = data
      .map((row: { [x: string]: any }) => row[col.dataIndex])
      .filter(Boolean);
    values?.pop();
    // 如果检测到可能正在输入的数字，保持当前对齐状态
    if (hasIncompleteNumericInput(values)) {
      return prevAlignments[index] || null;
    }

    const alignment: AlignType = values.every(isNumericValue) ? 'right' : null;
    prevAlignments[index] = alignment;
    return alignment;
  });
};

/**
 * 解析表格或图表
 * @param table - 表格 AST 节点
 * @param preNode - 前一个节点（实际传入的是 Slate 的 preElement，即上一轮 push 到 els 的节点）
 * @param plugins - 插件数组
 * @param parseNodes - 解析节点的函数，用于解析单元格内容
 * @param parserConfig - 解析配置
 * @param contextChartConfig - 由上一条 HTML 注释（<!-- [{"chartType":...}] -->）解析得到的配置；当 preNode 无 html 配置且注释被 skip 时由此传入
 * @returns 返回表格或图表节点
 */
export const parseTableOrChart = (
  table: Table & { finished?: boolean },
  preNode: RootContent,
  plugins: MarkdownEditorPlugin[],
  parseNodes: (
    nodes: RootContent[],
    plugins: MarkdownEditorPlugin[],
    top?: boolean,
    parent?: RootContent,
    parserConfig?: ParserMarkdownToSlateNodeConfig,
  ) => (Elements | any)[],
  parserConfig?: ParserMarkdownToSlateNodeConfig,
  contextChartConfig?: Record<string, unknown>,
): CardNode | Elements => {
  const keyMap = new Map<string, string>();

  // 优先使用前一个 HTML 代码块的 otherProps；若 HTML 注释被 skip（不产出 code 节点），则使用 contextChartConfig
  //
  // 【为何 preNode 里常常拿不到图表配置】
  // preNode 实际是上一轮产出的 Slate 节点（preElement）。当上一条是 <!-- [{"chartType":...}] -->
  // 时，该注释在 parseNodes 里被 continue 掉，不生成任何 el，preElement 不会更新为 code 节点，
  // 表格看到的「前一个」仍是再上一轮的 paragraph/heading 等，type 非 'code'，无 otherProps，
  // 故此处 config 为空。图表配置已放在 contextProps 中，由 table handler 以 contextChartConfig 传入。
  let config: Record<string, unknown> =
    preNode?.type === 'code' &&
    (preNode as CodeNode)?.language === 'html' &&
    (preNode as CodeNode)?.otherProps
      ? ((preNode as CodeNode)?.otherProps as Record<string, unknown>)
      : {};
  if (
    Object.keys(config).length === 0 &&
    contextChartConfig &&
    (contextChartConfig.config ||
      (contextChartConfig as ChartTypeConfig)?.chartType)
  ) {
    config = contextChartConfig;
  }

  const tableHeader = table?.children?.at(0);
  const columns =
    tableHeader?.children
      ?.map((node) => {
        return myRemark
          .stringify({
            type: 'root',
            children: [node],
          })
          ?.replace(/\n/g, '')
          .trim();
      })
      .map((title) => {
        // 先规范化字段名，统一处理转义字符
        const normalizedTitle = normalizeFieldName(title || ' ');
        return normalizedTitle;
      })
      .map((title, index) => {
        if (keyMap.has(title)) {
          keyMap.set(title, keyMap.get(title) + '_' + index);
          return {
            title: title,
            dataIndex: title + '_' + index,
            key: title + '_' + index,
          };
        }
        keyMap.set(title, title);
        return {
          title: title,
          dataIndex: title,
          key: title,
        };
      }) || [];

  const dataSource =
    table?.children?.slice(1)?.map((row) => {
      return row.children?.reduce((acc, cell, index) => {
        // 如果数据列数超出表头列数，舍弃多余的数据
        if (index >= columns.length) {
          return acc;
        }
        acc[columns[index].dataIndex] = myRemark
          .stringify({
            type: 'root',
            children: [cell],
          })
          ?.replace(/\n/g, '')
          ?.replace(/\\(?=")/g, '')
          ?.replace(/\\_/g, '')
          ?.trim();
        return acc;
      }, {} as any);
    }) || [];

  if (table.align?.every((item) => !item)) {
    const aligns = getColumnAlignment(dataSource, columns);
    table.align = aligns;
  }

  const aligns = table.align;

  /**
   * 将对象转换为数组（处理 {0: {...}, 1: {...}} 这种错误格式）
   * @param obj - 要转换的对象
   * @returns 转换后的数组，如果不是数字键对象则返回原对象
   */
  const convertObjectToArray = (obj: any): any => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }

    const keys = Object.keys(obj);
    // 检查是否所有键都是数字字符串（如 "0", "1", "2"）
    const allNumericKeys =
      keys.length > 0 && keys.every((key) => /^\d+$/.test(key));

    if (allNumericKeys) {
      // 按数字顺序排序并转换为数组
      const sortedKeys = keys.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      return sortedKeys.map((key) => obj[key]);
    }

    return obj;
  };

  // 如果 config 对象包含 config 属性（数组格式的配置），使用它
  // 否则使用 config 本身（对象格式的配置）
  let chartConfig = Array.isArray(config?.config)
    ? config.config
    : config?.config || config;

  // 如果 chartConfig 是对象且键都是数字（如 {0: {...}}），转换为数组
  chartConfig = convertObjectToArray(chartConfig);

  // 获取 chartType，支持多种配置格式
  const getChartType = (): string | undefined => {
    return (
      (chartConfig as ChartTypeConfig)?.chartType ||
      (Array.isArray(chartConfig) &&
        (chartConfig?.[0] as ChartTypeConfig)?.chartType) ||
      (config as ChartTypeConfig)?.chartType ||
      (config as ChartTypeConfig)?.at?.(0)?.chartType
    );
  };

  const chartType = getChartType();
  // 如果 chartType 为 "table"，将其视为不存在，按普通表格处理
  const isChart = chartType && chartType !== 'table';

  // 计算合并单元格信息
  const mergeCells = (config as CodeNode['otherProps'])?.mergeCells || [];

  // 创建合并单元格映射，用于快速查找
  const mergeMap = new Map<
    string,
    { rowSpan: number; colSpan: number; hidden?: boolean }
  >();
  mergeCells?.forEach(
    ({ row, col, rowSpan, rowspan, colSpan, colspan }: any) => {
      let rawRowSpan = rowSpan || rowspan;
      let rawColSpan = colSpan || colspan;
      // 主单元格
      mergeMap.set(`${row}-${col}`, {
        rowSpan: rawRowSpan,
        colSpan: rawColSpan,
      });

      // 被合并的单元格标记为隐藏
      for (let r = row; r < row + rawRowSpan; r++) {
        for (let c = col; c < col + rawColSpan; c++) {
          if (r !== row || c !== col) {
            mergeMap.set(`${r}-${c}`, { rowSpan: 1, colSpan: 1, hidden: true });
          }
        }
      }
    },
  );

  const children = table.children.map((r: { children: any[] }, l: number) => {
    return {
      type: 'table-row',
      align: aligns?.[l] || undefined,
      children: r.children.map(
        (c: { children: string | any[] }, i: string | number) => {
          const mergeInfo = mergeMap.get(`${l}-${i}`);
          return {
            type: 'table-cell',
            align: aligns?.[i as number] || undefined,
            title: l === 0,
            rows: l,
            cols: i,
            // 直接设置 rowSpan 和 colSpan
            ...(mergeInfo?.rowSpan && mergeInfo.rowSpan > 1
              ? { rowSpan: mergeInfo.rowSpan }
              : {}),
            ...(mergeInfo?.colSpan && mergeInfo.colSpan > 1
              ? { colSpan: mergeInfo.colSpan }
              : {}),
            // 如果是被合并的单元格，标记为隐藏
            ...(mergeInfo?.hidden ? { hidden: true } : {}),
            children: c.children?.length
              ? [
                  {
                    type: 'paragraph',
                    children: parseNodes(
                      c.children as any,
                      plugins,
                      false,
                      c as any,
                      parserConfig,
                    ),
                  },
                ]
              : [
                  {
                    type: 'paragraph',
                    children: [{ text: '' }],
                  },
                ],
          };
        },
      ),
    };
  }) as TableRowNode[];

  const otherProps = {
    ...(isChart
      ? {
          config: chartConfig,
        }
      : config),
    columns,
    dataSource: dataSource.map((item) => {
      delete item?.chartType;
      return {
        ...item,
      };
    }),
  };

  const node: TableNode | ChartNode = {
    type: isChart ? 'chart' : 'table',
    ...(table.finished !== undefined && { finished: table.finished }),
    children: children,
    otherProps,
  } as any;
  return EditorUtils.wrapperCardNode(node);
};

/**
 * 预处理 Markdown 表格换行符
 * @param markdown - 原始 Markdown 字符串
 * @returns 处理后的 Markdown 字符串
 */
export const preprocessMarkdownTableNewlines = (markdown: string): string => {
  // 检查是否包含表格
  if (!tableRegex.test(markdown)) return markdown; // 如果没有表格，直接返回原始字符串

  // 处理表格结尾的换行符：
  // 1. 如果只有一个换行符，改成两个
  // 2. 如果有两个以上换行符，改成两个
  // 3. 如果已经是两个换行符，保持不变
  let processedMarkdown = markdown
    .replace(
      /(\|[^|\n]*\|)\n(?!\n|\|)/g, // 匹配表格行后面跟着单个换行符（不是两个），但下一行不是表格行
      '$1\n\n', // 替换为两个换行符
    )
    .replace(
      /(\|[^|\n]*\|)\n{3,}(?!\|)/g, // 匹配表格行后面跟着3个或更多换行符，但下一行不是表格行
      '$1\n\n', // 替换为两个换行符
    );

  // 如果包含表格，处理换行符
  return processedMarkdown
    ?.split('\n\n')
    .map((line) => {
      if (line.includes('```')) return line; // 如果包含代码块，直接返回原始字符串
      // 检查是否包含表格
      if (!tableRegex.test(line)) return line; // 如果没有表格，直接返回原始字符串
      // 匹配所有表格的行（确保我们在表格行内匹配换行符）
      return line.replace(/\|([^|]+)\|/g, (match) => {
        if (match.replaceAll('\n', '')?.length < MIN_TABLE_CELL_LENGTH)
          return match;
        // 只替换每个表格单元格内的换行符
        return match.split('\n').join('<br>');
      });
    })
    .join('\n\n');
};
