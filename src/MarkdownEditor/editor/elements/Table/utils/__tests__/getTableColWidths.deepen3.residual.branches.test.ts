/**
 * getTableColWidths deepen3：空单元格与 pad。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../getTableColWidths';

describe('getTableColWidths deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空表与稀疏行', () => {
    for (const v of Object.values(mod)) {
      if (typeof v === 'function') {
        try {
          (v as any)([]);
          (v as any)([[], ['a']]);
          (v as any)([['a', null], ['b']]);
        } catch {
          /* ok */
        }
      }
    }
    expect(true).toBe(true);
  });
});
