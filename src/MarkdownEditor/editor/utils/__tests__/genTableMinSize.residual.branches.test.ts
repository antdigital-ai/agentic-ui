import { describe, expect, it } from 'vitest';
import { applyTableMinSizeToSchema } from '../genTableMinSize';

describe('applyTableMinSizeToSchema residual branches', () => {
  it('does nothing without config or effective minima', () => {
    const schema: any[] = [{ type: 'table', children: [] }];
    applyTableMinSizeToSchema(schema);
    applyTableMinSizeToSchema(schema, { minColumn: -1, minRows: -2 });
    expect(schema[0].children).toEqual([]);
  });

  it('pads nested header rows and appends rows with clamped minima', () => {
    const schema: any[] = [
      {
        type: 'blockquote',
        children: [
          {
            type: 'table',
            children: [
              {
                type: 'table-head',
                children: [
                  { type: 'table-row', children: [{ type: 'table-cell', children: [] }] },
                ],
              },
            ],
          },
        ],
      },
    ];
    applyTableMinSizeToSchema(schema, { minColumn: 3, minRows: 3 });
    const table = schema[0].children[0];
    expect(table.children[0].children[0].children).toHaveLength(3);
    expect(table.children).toHaveLength(3);
    expect(table.children.slice(1).every((row: any) => row.children.length === 3)).toBe(true);
  });

  it('table-footer / 无 children / config 早退', () => {
    applyTableMinSizeToSchema([{ type: 'table' } as any], undefined);
    applyTableMinSizeToSchema([{ type: 'table', children: [] } as any], {
      minColumn: 0,
      minRows: 0,
    });
    const schema: any[] = [
      {
        type: 'table',
        children: [
          {
            type: 'table-footer',
            children: [
              { type: 'table-row', children: [{ type: 'table-cell', children: [] }] },
              { type: 'paragraph', children: [] },
            ],
          },
        ],
      },
    ];
    applyTableMinSizeToSchema(schema, { minColumn: 2, minRows: 2 });
    expect(schema[0].children.length).toBeGreaterThanOrEqual(2);
  });
});
