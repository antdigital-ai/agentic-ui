/**
 * InsertAutocomplete 残留：locale 缺省标签回退、getInsertOptions isTop。
 */
import { describe, expect, it } from 'vitest';
import { getInsertOptions } from '../InsertAutocomplete';

describe('InsertAutocomplete residual branches', () => {
  it('getInsertOptions：locale 缺省回退 + isTop 插入标题组', () => {
    const top = getInsertOptions({ isTop: true }, {} as any);
    const labels = top
      .flatMap((g) => g.children || [])
      .map((c) => c.label?.[0]);
    expect(labels).toEqual(
      expect.arrayContaining([
        '表格',
        '引用',
        '本地图片',
        '主标题',
        '段标题',
        '小标题',
      ]),
    );
    expect(top.some((g) => g.key === 'head')).toBe(true);

    const nested = getInsertOptions({ isTop: false }, {} as any);
    expect(nested.some((g) => g.key === 'head')).toBe(false);
  });

  it('getInsertOptions：locale 有值时优先 locale', () => {
    const opts = getInsertOptions(
      { isTop: true },
      {
        table: 'Table',
        quote: 'Quote',
        localeImage: 'LocalImg',
        head1: 'H1',
        head2: 'H2',
        head3: 'H3',
      } as any,
    );
    const labels = opts
      .flatMap((g) => g.children || [])
      .map((c) => c.label?.[0]);
    expect(labels).toEqual(
      expect.arrayContaining(['Table', 'Quote', 'LocalImg', 'H1', 'H2', 'H3']),
    );
  });

  it('getInsertOptions：列表/代码/有序 locale 回退键', () => {
    const opts = getInsertOptions({ isTop: false }, {
      code: 'CodeX',
      'b-list': 'UL',
      'n-list': 'OL',
      't-list': 'TL',
    } as any);
    const labels = opts
      .flatMap((g) => g.children || [])
      .map((c) => c.label?.[0]);
    expect(labels).toEqual(
      expect.arrayContaining(['CodeX', 'UL', 'OL', 'TL']),
    );
    expect(opts.some((g) => g.key === 'head')).toBe(false);
  });

  it('getInsertOptions：每组 key/task/args 结构完整', () => {
    const top = getInsertOptions({ isTop: true }, {} as any);
    const byKey = Object.fromEntries(
      top.flatMap((g) => (g.children || []).map((c) => [c.key, c])),
    );
    expect(byKey.table.task).toBe('insertTable');
    expect(byKey.quote.task).toBe('insertQuote');
    expect(byKey.code.task).toBe('insertCode');
    expect(byKey.localeImage.task).toBe('uploadImage');
    expect(byKey['b-list'].args).toEqual(['unordered']);
    expect(byKey['n-list'].args).toEqual(['ordered']);
    expect(byKey['t-list'].args).toEqual(['task']);
    expect(byKey.head1.task).toBe('head');
    expect(byKey.head2.args?.[0]).toBe(2);
    expect(byKey.head3.args?.[0]).toBe(3);

    const nested = getInsertOptions({ isTop: false }, {
      table: 'T',
      quote: 'Q',
      code: 'C',
      localeImage: 'I',
      'b-list': 'B',
      'n-list': 'N',
      't-list': 'K',
    } as any);
    expect(nested.map((g) => g.key)).toEqual(
      expect.arrayContaining(['element', 'media', 'list']),
    );
    expect(nested.find((g) => g.key === 'element')?.children).toHaveLength(3);
  });

  it('exclusive deepen：locale 半缺省；isTop true/false 全 key 扫描', () => {
    const half = getInsertOptions({ isTop: true }, {
      table: 'T',
      'b-list': 'UL',
    } as any);
    const labels = half.flatMap((g) => g.children || []).map((c) => c.label?.[0]);
    expect(labels).toEqual(
      expect.arrayContaining(['T', '引用', '代码', '本地图片', 'UL', '有序列表', '任务列表', '主标题']),
    );

    const top = getInsertOptions({ isTop: true }, null as any);
    expect(top.map((g) => g.key)).toEqual(
      expect.arrayContaining(['element', 'media', 'list', 'head']),
    );
    for (const g of top) {
      for (const c of g.children || []) {
        expect(c.key).toBeTruthy();
        expect(c.task || c.args).toBeTruthy();
        expect(Array.isArray(c.label)).toBe(true);
      }
    }

    const nest = getInsertOptions({ isTop: false }, {
      quote: undefined,
      code: null,
      localeImage: '',
    } as any);
    expect(nest.some((g) => g.key === 'head')).toBe(false);
    const nestLabels = nest
      .flatMap((g) => g.children || [])
      .map((c) => c.label?.[0]);
    expect(nestLabels.length).toBeGreaterThan(5);
  });
});
