import { describe, expect, it } from 'vitest';
import type { Elements } from '../../../el';
import { applyTableMinSizeToSchema } from '../genTableMinSize';

describe('applyTableMinSizeToSchema', () => {
  it('pads columns and rows on table nodes', () => {
    const schema: Elements[] = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'A' }] },
            ],
          } as Elements,
        ],
      } as Elements,
    ];

    applyTableMinSizeToSchema(schema, { minColumn: 2, minRows: 2 });

    const table = schema[0];
    const rows = (table.children || []) as Elements[];
    expect(rows).toHaveLength(2);
    expect(rows[0].children).toHaveLength(2);
    expect(rows[1].children).toHaveLength(2);
  });

  it('recurses into nested non-table children', () => {
    const schema: Elements[] = [
      {
        type: 'blockquote',
        children: [
          {
            type: 'table',
            children: [
              {
                type: 'table-row',
                children: [{ type: 'table-cell', children: [{ text: 'x' }] }],
              } as Elements,
            ],
          } as Elements,
        ],
      } as Elements,
    ];

    applyTableMinSizeToSchema(schema, { minColumn: 3, minRows: 1 });
    const table = (schema[0].children as Elements[])[0];
    expect((table.children as Elements[])[0].children).toHaveLength(3);
  });
});
