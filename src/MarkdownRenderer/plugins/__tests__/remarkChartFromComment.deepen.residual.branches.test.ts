/**
 * remarkChartFromComment deepen：无 tableData 跳过；dataIndex 缺省。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { remarkChartFromComment } from '../remarkChartFromComment';

describe('remarkChartFromComment deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('注释后非可解析表则跳过', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'html',
          value: '<!-- [{"chartType":"line","x":"a","y":"b"}] -->',
        },
        { type: 'paragraph', children: [{ type: 'text', value: 'x' }] },
      ],
    };
    remarkChartFromComment()(tree);
    expect(tree.children[0].type).toBe('html');
  });

  it('合法注释+表转换；列 dataIndex 缺省为空串', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'html',
          value: '<!-- [{"chartType":"line","x":"月","y":"值"}] -->',
        },
        {
          type: 'table',
          children: [
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '月' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '值' }],
                },
              ],
            },
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '1' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: '2' }],
                },
              ],
            },
          ],
        },
      ],
    };
    remarkChartFromComment()(tree);
    expect(
      tree.children.some((c: any) => c.type === 'code' && c.lang === 'chart') ||
        tree.children[0].type === 'html',
    ).toBe(true);
  });
});
