import { parseChineseCurrencyToNumber } from '../../Plugins/chart/utils';
import { extractTableData } from '../utils/astExtract';
import { normalizeChartConfigAxisFields } from '../utils/chartAxisMatch';

/**
 * 匹配形如 `<!-- [{"chartType":"line",...}] -->` 或 `<!-- {"chartType":"line",...} -->` 的注释。
 *
 * 第一组捕获 JSON 字面量（数组或对象），交由调用方 `JSON.parse` 解析。
 */
const CHART_COMMENT_PATTERN = /^<!--\s*(\[[\s\S]*\]|\{[\s\S]*\})\s*-->$/;

/**
 * remark 插件：将 "HTML 注释（图表配置）+ 表格" 组合转为 chart 代码块。
 *
 * - 在 MarkdownEditor 中，`parseTableOrChart` 负责此逻辑
 * - 在 MarkdownRenderer 中，此插件在 mdast 层面完成等价转换
 *
 * 匹配模式示例：
 * ```
 * <!-- [{"chartType":"line","x":"month","y":"value",...}] -->
 * | month | value |
 * |-------|-------|
 * | 2024  | 100   |
 * ```
 *
 * 转换后等价于：
 * ````md
 * ```chart
 * {"config":[{"chartType":"line","x":"month","y":"value"}],
 *  "columns":[...],"dataSource":[...]}
 * ```
 * ````
 *
 * 配置项中所有 `chartType` 都为 `"table"` 时跳过转换（保留原表格渲染）。
 */
export const remarkChartFromComment = () => {
  return (tree: any) => {
    const children = tree.children;
    if (!children || !Array.isArray(children)) return;

    const toRemove: number[] = [];

    for (let i = 0; i < children.length - 1; i++) {
      const node = children[i];
      const next = children[i + 1];

      if (node.type !== 'html' || next.type !== 'table') continue;

      const match = node.value?.match(CHART_COMMENT_PATTERN);
      if (!match) continue;

      let chartConfig: any;
      try {
        chartConfig = JSON.parse(match[1]);
      } catch {
        continue;
      }

      if (!Array.isArray(chartConfig)) chartConfig = [chartConfig];
      const hasChartType = chartConfig.some(
        (c: any) => c.chartType && c.chartType !== 'table',
      );
      if (!hasChartType) continue;

      const tableData = extractTableData(next, parseChineseCurrencyToNumber);
      if (!tableData) continue;

      // 注释里写的 x/y 可能是表头列名的「逻辑名」（如「客单价」），
      // 实际表头常带括号单位说明（如「客单价(元)」）。
      // 在生成 chart code 块前归一化为表格真实存在的 dataIndex，
      // 让下游 ChartRenderer 能直接用 row[x]/row[y] 取到值。
      const columnKeys = tableData.columns.map((col: any) =>
        String(col?.dataIndex ?? ''),
      );
      const normalizedConfig = chartConfig.map((cfg: any) =>
        normalizeChartConfigAxisFields(cfg, columnKeys),
      );

      const chartJson = JSON.stringify({
        config: normalizedConfig,
        columns: tableData.columns,
        dataSource: tableData.dataSource,
      });

      children[i] = {
        type: 'code',
        lang: 'chart',
        value: chartJson,
      };
      toRemove.push(i + 1);
      i++;
    }

    for (let j = toRemove.length - 1; j >= 0; j--) {
      children.splice(toRemove[j], 1);
    }
  };
};
