/**
 * remarkChartFromComment mid-tail：非法注释、table-only、对象配置、转换成功。
 */
import { describe, expect, it } from 'vitest';
import { remarkChartFromComment } from '../remarkChartFromComment';

const run = (children: any[]) => {
  const tree = { type: 'root', children };
  remarkChartFromComment()(tree);
  return tree.children;
};

describe('remarkChartFromComment midtail branches', () => {
  it('无 children / 非数组早退', () => {
    const tree: any = { type: 'root' };
    remarkChartFromComment()(tree);
    expect(tree.children).toBeUndefined();

    const t2: any = { type: 'root', children: null };
    remarkChartFromComment()(t2);
    expect(t2.children).toBeNull();
  });

  it('html 非图表注释或 JSON 非法时跳过', () => {
    const children = run([
      { type: 'html', value: '<!-- not-json -->' },
      {
        type: 'table',
        children: [],
      },
      { type: 'html', value: '<!-- {bad} -->' },
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: 'a' }] },
            ],
          },
        ],
      },
    ]);
    expect(children.some((c: any) => c.type === 'html')).toBe(true);
  });

  it('全部 chartType=table 时不转换', () => {
    const children = run([
      {
        type: 'html',
        value: '<!-- [{"chartType":"table","x":"m","y":"v"}] -->',
      },
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: 'm' }] },
              { type: 'tableCell', children: [{ type: 'text', value: 'v' }] },
            ],
          },
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: '1' }] },
              { type: 'tableCell', children: [{ type: 'text', value: '2' }] },
            ],
          },
        ],
      },
    ]);
    expect(children[0].type).toBe('html');
  });

  it('对象配置转为数组并生成 chart code；移除后续 table', () => {
    const children = run([
      {
        type: 'html',
        value: '<!-- {"chartType":"line","x":"month","y":"value"} -->',
      },
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              {
                type: 'tableCell',
                children: [{ type: 'text', value: 'month' }],
              },
              {
                type: 'tableCell',
                children: [{ type: 'text', value: 'value' }],
              },
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
      { type: 'paragraph', children: [{ type: 'text', value: 'after' }] },
    ]);
    expect(children[0].type).toBe('code');
    expect(children[0].lang).toBe('chart');
    expect(children[0].value).toContain('chartType');
    expect(children.some((c: any) => c.type === 'table')).toBe(false);
    expect(children[children.length - 1].type).toBe('paragraph');
  });

  it('html 后非 table 节点不转换', () => {
    const children = run([
      {
        type: 'html',
        value: '<!-- {"chartType":"bar"} -->',
      },
      { type: 'paragraph', children: [{ type: 'text', value: 'nope' }] },
    ]);
    expect(children[0].type).toBe('html');
    expect(children[1].type).toBe('paragraph');
  });
});
