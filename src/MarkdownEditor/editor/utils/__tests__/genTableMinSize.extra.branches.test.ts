import { describe, expect, it } from 'vitest';
import { applyTableMinSizeToSchema } from '../genTableMinSize';
import type { Elements } from '../../../el';

describe('genTableMinSize 额外分支', () => {
  it('非 table 节点跳过', () => {
    const nodes: Elements[] = [
      { type: 'paragraph', children: [{ text: 'x' }] } as Elements,
    ];
    applyTableMinSizeToSchema(nodes, { minColumn: 3, minRows: 3 });
    expect(nodes[0].type).toBe('paragraph');
  });

  it('已满足最小行列不扩展', () => {
    const table = {
      type: 'table',
      children: Array.from({ length: 3 }, () => ({
        type: 'table-row',
        children: Array.from({ length: 3 }, () => ({
          type: 'table-cell',
          children: [{ text: '' }],
        })),
      })),
    } as Elements;
    applyTableMinSizeToSchema([table], { minColumn: 2, minRows: 2 });
    expect(table.children).toHaveLength(3);
    expect((table.children as any)[0].children).toHaveLength(3);
  });

  it('仅 minColumn 时补列不补行', () => {
    const table = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [{ type: 'table-cell', children: [{ text: '' }] }],
        },
      ],
    } as Elements;
    applyTableMinSizeToSchema([table], { minColumn: 4 });
    expect(table.children).toHaveLength(1);
    expect((table.children as any)[0].children).toHaveLength(4);
  });

  it('空 children 的 table 安全处理', () => {
    const table = { type: 'table', children: [] } as Elements;
    expect(() =>
      applyTableMinSizeToSchema([table], { minColumn: 2, minRows: 2 }),
    ).not.toThrow();
  });
});
