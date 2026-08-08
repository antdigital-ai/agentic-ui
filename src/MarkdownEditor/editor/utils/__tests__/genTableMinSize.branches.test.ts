import { describe, expect, it } from 'vitest';
import { applyTableMinSizeToSchema } from '../genTableMinSize';
import type { Elements } from '../../../el';

describe('genTableMinSize 分支覆盖', () => {
  const makeTable = (rows: number, cols: number): Elements =>
    ({
      type: 'table',
      children: Array.from({ length: rows }, () => ({
        type: 'table-row',
        children: Array.from({ length: cols }, () => ({
          type: 'table-cell',
          children: [{ text: 'c' }],
        })),
      })),
    }) as Elements;

  it('config 为空时不修改', () => {
    const table = makeTable(1, 1);
    applyTableMinSizeToSchema([table]);
    expect(table.children).toHaveLength(1);
  });

  it('minColumn 与 minRows 均为 0 时不修改', () => {
    const table = makeTable(1, 1);
    applyTableMinSizeToSchema([table], { minColumn: 0, minRows: 0 });
    expect((table.children as Elements[])[0].children).toHaveLength(1);
  });

  it('补齐列数到 minColumn', () => {
    const table = makeTable(1, 1);
    applyTableMinSizeToSchema([table], { minColumn: 3 });
    const row = (table.children as Elements[])[0];
    expect(row.children).toHaveLength(3);
  });

  it('补齐行数到 minRows', () => {
    const table = makeTable(1, 2);
    applyTableMinSizeToSchema([table], { minRows: 3 });
    expect(table.children).toHaveLength(3);
  });

  it('table-head 内 row 计入 collectTableRows', () => {
    const table = {
      type: 'table',
      children: [
        {
          type: 'table-head',
          children: [
            {
              type: 'table-row',
              children: [{ type: 'table-cell', children: [{ text: '' }] }],
            },
          ],
        },
      ],
    } as Elements;
    applyTableMinSizeToSchema([table], { minColumn: 2, minRows: 2 });
    expect(table.children).toHaveLength(2);
  });

  it('table-footer 内 row 计入', () => {
    const table = {
      type: 'table',
      children: [
        {
          type: 'table-footer',
          children: [
            {
              type: 'table-row',
              children: [{ type: 'table-cell', children: [{ text: '' }] }],
            },
          ],
        },
      ],
    } as Elements;
    applyTableMinSizeToSchema([table], { minRows: 2 });
    expect(table.children).toHaveLength(2);
  });

  it('嵌套非 table 节点 walk 子树', () => {
    const inner = makeTable(1, 1);
    const wrapper = {
      type: 'blockquote',
      children: [inner],
    } as Elements;
    applyTableMinSizeToSchema([wrapper], { minColumn: 2 });
    expect((inner.children as Elements[])[0].children).toHaveLength(2);
  });

  it('负 minColumn/minRows 按 0 处理', () => {
    const table = makeTable(2, 2);
    applyTableMinSizeToSchema([table], { minColumn: -1, minRows: -1 });
    expect((table.children as Elements[])[0].children).toHaveLength(2);
  });
});
