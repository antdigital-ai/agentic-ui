import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { remarkChartFromComment } from '../../plugins/remarkChartFromComment';

/**
 * 用 remark-parse 解析 markdown 得到 mdast，然后跑 remarkChartFromComment 转换器，
 * 返回顶层 children，便于断言子节点类型与值。
 */
const runPlugin = (md: string): any => {
  const tree: any = unified().use(remarkParse).parse(md);
  remarkChartFromComment()(tree);
  return tree.children;
};

/**
 * remark-parse 的实际产物里，html 注释节点与紧随其后的 table 节点
 * 之间是否有空 paragraph / 中间节点，是 remark-parse 的内部细节，
 * 不属于本插件的契约。所以测试只断言"是否产出 chart code 节点"以及其 payload 内容，
 * 不做总长度等结构性断言。
 */
const TABLE_MD = '| month | value |\n| --- | --- |\n| 2024 | 100 |';

const findChartCode = (children: any[]): any | undefined =>
  children.find((c) => c?.type === 'code' && c?.lang === 'chart');

/**
 * 构造一个 html(注释) + table 严格相邻的手工 mdast 树。
 * 比走 remark-parse 更稳定——后者对 `<!-- ... -->` 与 `| ... |` 之间的换行
 * 可能插入空 paragraph，导致插件的"i+1 必须是 table"前提不成立。
 */
const buildCommentTableTree = (commentValue: string): any => ({
  type: 'root',
  children: [
    { type: 'html', value: commentValue },
    {
      type: 'table',
      children: [
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: 'month' }] },
            { type: 'tableCell', children: [{ type: 'text', value: 'value' }] },
          ],
        },
        {
          type: 'tableRow',
          children: [
            { type: 'tableCell', children: [{ type: 'text', value: '2024' }] },
            { type: 'tableCell', children: [{ type: 'text', value: '100' }] },
          ],
        },
      ],
    },
  ],
});

describe('remarkChartFromComment', () => {
  it('converts <!-- {chartConfig} --> + table into a chart code node', () => {
    const tree = buildCommentTableTree(
      '<!-- [{"chartType":"line","x":"month","y":"value"}] -->',
    );
    remarkChartFromComment()(tree);

    const chartNode = findChartCode(tree.children);
    expect(chartNode).toBeDefined();

    const payload = JSON.parse(chartNode.value);
    expect(payload.config).toEqual([
      { chartType: 'line', x: 'month', y: 'value' },
    ]);
    expect(payload.columns).toHaveLength(2);
    expect(payload.dataSource).toEqual([
      { key: 'row-1', month: 2024, value: 100 },
    ]);
  });

  it('accepts a single object (auto-wraps to array)', () => {
    // 覆盖 `if (!Array.isArray(chartConfig)) chartConfig = [chartConfig]` 分支
    const tree = buildCommentTableTree(
      '<!-- {"chartType":"bar","x":"month","y":"value"} -->',
    );
    remarkChartFromComment()(tree);

    const chartNode = findChartCode(tree.children);
    expect(chartNode).toBeDefined();
    const payload = JSON.parse(chartNode.value);
    expect(payload.config).toEqual([
      { chartType: 'bar', x: 'month', y: 'value' },
    ]);
    expect(payload.dataSource).toEqual([
      { key: 'row-1', month: 2024, value: 100 },
    ]);
  });

  it('skips when all chart configs are explicit "table" type', () => {
    const md = `<!-- [{"chartType":"table"}] -->\n${TABLE_MD}`;
    const children = runPlugin(md);

    // 不应转换为 chart code 节点：保留原 markdown 渲染路径
    expect(findChartCode(children)).toBeUndefined();
  });

  it('skips when the comment is not a chart-config json', () => {
    const md = `<!-- just a regular comment -->\n${TABLE_MD}`;
    const children = runPlugin(md);
    expect(findChartCode(children)).toBeUndefined();
  });

  it('skips when the json is malformed', () => {
    const md = `<!-- [{not valid json -->\n${TABLE_MD}`;
    const children = runPlugin(md);
    expect(findChartCode(children)).toBeUndefined();
  });

  it('skips when html node is not followed by a table', () => {
    const md = `<!-- [{"chartType":"line"}] -->\n\nplain paragraph`;
    const children = runPlugin(md);
    expect(findChartCode(children)).toBeUndefined();
  });

  it('is a no-op for a tree without children', () => {
    expect(() => remarkChartFromComment()({} as any)).not.toThrow();
    expect(() =>
      remarkChartFromComment()({ children: null } as any),
    ).not.toThrow();
  });

  /**
   * 列名带「单位括号」时，注释里写「逻辑名」也能正确归一化为表头实际 dataIndex。
   * 这与 MarkdownEditor 链路（parseTable.ts 的 columnKeyMatchesConfiguredField）行为一致。
   */
  it('normalizes axis fields when column header carries a parenthesis unit suffix', () => {
    const tree: any = {
      type: 'root',
      children: [
        {
          type: 'html',
          value:
            '<!-- {"chartType":"line","x":"时段","y":"客单价","title":"分时段客单价变化"} -->',
        },
        {
          type: 'table',
          children: [
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '时段' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '客单价(元)' }],
                },
              ],
            },
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '12:00' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '118.19' }],
                },
              ],
            },
          ],
        },
      ],
    };

    remarkChartFromComment()(tree);

    const chartNode = findChartCode(tree.children);
    expect(chartNode).toBeDefined();

    const payload = JSON.parse(chartNode.value);
    // 关键断言：y 已被归一化为表头真实列名
    expect(payload.config[0].y).toBe('客单价(元)');
    expect(payload.config[0].x).toBe('时段');
    // dataSource 行里能直接通过归一化后的 key 取到值
    expect(payload.dataSource[0]['客单价(元)']).toBe(118.19);
  });

  it('also normalizes axis fields with Chinese full-width parenthesis suffix', () => {
    const tree: any = {
      type: 'root',
      children: [
        {
          type: 'html',
          value: '<!-- {"chartType":"bar","x":"季度","y":"GDP总量"} -->',
        },
        {
          type: 'table',
          children: [
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '季度' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: 'GDP总量（万亿元）' }],
                },
              ],
            },
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '2024Q1' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '30' }],
                },
              ],
            },
          ],
        },
      ],
    };

    remarkChartFromComment()(tree);
    const payload = JSON.parse(findChartCode(tree.children).value);
    expect(payload.config[0].y).toBe('GDP总量（万亿元）');
  });

  it('keeps the configured field as-is when no column matches', () => {
    // 找不到匹配列时不应抛错，且配置字段保留原样（让下游决定如何处理）
    const tree: any = {
      type: 'root',
      children: [
        {
          type: 'html',
          value: '<!-- {"chartType":"line","x":"时段","y":"利润"} -->',
        },
        {
          type: 'table',
          children: [
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '时段' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '客单价(元)' }],
                },
              ],
            },
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '12:00' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '118' }],
                },
              ],
            },
          ],
        },
      ],
    };

    remarkChartFromComment()(tree);
    const payload = JSON.parse(findChartCode(tree.children).value);
    expect(payload.config[0].y).toBe('利润');
  });
});
