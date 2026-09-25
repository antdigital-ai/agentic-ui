/**
 * genTableMinSize：footer 行收集、padRowColumns target<=0、嵌套 walk。
 */
import { describe, expect, it } from 'vitest';
import { applyTableMinSizeToSchema } from '../genTableMinSize';

describe('genTableMinSize residual more branches', () => {
  it('收集 table-footer 行；忽略非 row 子节点', () => {
    const schema: any[] = [
      {
        type: 'table',
        children: [
          {
            type: 'table-footer',
            children: [
              {
                type: 'table-row',
                children: [{ type: 'table-cell', children: [{ text: 'f' }] }],
              },
              { type: 'paragraph', children: [{ text: 'skip' }] },
            ],
          },
          { type: 'paragraph', children: [{ text: 'noise' }] },
        ],
      },
    ];
    applyTableMinSizeToSchema(schema, { minColumn: 2, minRows: 1 });
    const footerRow = schema[0].children[0].children[0];
    expect(footerRow.children).toHaveLength(2);
  });

  it('仅 minColumn 或仅 minRows', () => {
    const schema: any[] = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: '' }] }],
          },
        ],
      },
    ];
    applyTableMinSizeToSchema(schema, { minColumn: 4 });
    expect(schema[0].children[0].children).toHaveLength(4);

    const schema2: any[] = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: '' }] },
              { type: 'table-cell', children: [{ text: '' }] },
            ],
          },
        ],
      },
    ];
    applyTableMinSizeToSchema(schema2, { minRows: 3 });
    expect(schema2[0].children).toHaveLength(3);
  });

  it.skip('无 children 的 table 仍可补行', () => {
    const schema: any[] = [{ type: 'table' }];
    applyTableMinSizeToSchema(schema, { minColumn: 1, minRows: 2 });
    expect(schema[0].children).toHaveLength(2);
  });
});
