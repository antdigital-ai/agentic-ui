/**
 * genTableMinSize deepen：table/row children 缺省走 `|| []` 与 `?? 0`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyTableMinSizeToSchema } from '../genTableMinSize';

describe('genTableMinSize deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('table 无 children 时仅 minColumn 不补行也能走过 || []', () => {
    const schema: any[] = [{ type: 'table' }];
    applyTableMinSizeToSchema(schema, { minRows: 0, minColumn: 2 });
    expect(schema[0].children).toBeUndefined();
  });

  it('行 children 缺省时 columnCount 走 ?? 0', () => {
    const schema: any[] = [
      {
        type: 'table',
        children: [{ type: 'table-row' }],
      },
    ];
    applyTableMinSizeToSchema(schema, { minRows: 1, minColumn: 1 });
    expect(schema[0].children[0].children.length).toBeGreaterThanOrEqual(1);
  });
});
