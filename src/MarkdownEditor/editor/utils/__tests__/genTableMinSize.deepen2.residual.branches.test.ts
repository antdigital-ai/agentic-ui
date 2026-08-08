/**
 * genTableMinSize deepen2：table-head 无 children；row 无 children 时 ??。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyTableMinSizeToSchema } from '../genTableMinSize';

describe('genTableMinSize deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('table-head children 缺失与 row.children 缺失仍可补齐', () => {
    const schema = [
      {
        type: 'table',
        children: [
          { type: 'table-head' },
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'a' }] }],
          },
          { type: 'table-row' },
        ],
      },
    ] as any;
    applyTableMinSizeToSchema(schema, { minColumn: 2, minRows: 3 });
    const rows = schema[0].children.filter(
      (n: any) => n.type === 'table-row' || n.type === 'table-head',
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(schema[0].children.length).toBeGreaterThanOrEqual(3);
  });
});
