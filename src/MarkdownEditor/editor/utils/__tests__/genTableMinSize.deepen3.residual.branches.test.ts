/**
 * genTableMinSize deepen3：row.children 为 undefined 走 ?? 0。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyTableMinSizeToSchema } from '../genTableMinSize';

describe('genTableMinSize deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('children undefined 的行参与 max', () => {
    const schema = [
      {
        type: 'table',
        children: [
          { type: 'table-row', children: undefined },
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'a' }] },
              { type: 'table-cell', children: [{ text: 'b' }] },
            ],
          },
        ],
      },
    ];
    applyTableMinSizeToSchema(schema, { minColumn: 3, minRows: 2 });
    expect(schema[0].children.length).toBeGreaterThanOrEqual(2);
  });
});
