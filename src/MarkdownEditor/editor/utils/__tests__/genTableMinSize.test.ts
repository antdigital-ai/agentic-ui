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
            children: [{ type: 'table-cell', children: [{ text: 'A' }] }],
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

  it('pads rows nested under table-head and table-footer', () => {
    const schema: Elements[] = [
      {
        type: 'table',
        children: [
          {
            type: 'table-head',
            children: [
              {
                type: 'table-row',
                children: [{ type: 'table-cell', children: [{ text: 'H' }] }],
              } as Elements,
            ],
          } as Elements,
          {
            type: 'table-footer',
            children: [
              {
                type: 'table-row',
                children: [{ type: 'table-cell', children: [{ text: 'F' }] }],
              } as Elements,
            ],
          } as Elements,
        ],
      } as Elements,
    ];

    applyTableMinSizeToSchema(schema, { minColumn: 3, minRows: 3 });

    const table = schema[0];
    const head = (table.children as Elements[])[0];
    const footer = (table.children as Elements[])[1];
    const paddedBodyRows = (table.children as Elements[]).slice(2);

    expect((head.children as Elements[])[0].children).toHaveLength(3);
    expect((footer.children as Elements[])[0].children).toHaveLength(3);
    expect(paddedBodyRows).toHaveLength(1);
    expect(paddedBodyRows[0].children).toHaveLength(3);
  });
});
