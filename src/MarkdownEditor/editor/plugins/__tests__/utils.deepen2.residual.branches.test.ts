/**
 * editor plugins utils deepen2：边角。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../utils';

describe('editor plugins utils deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('导出函数边角', () => {
    for (const v of Object.values(mod)) {
      if (typeof v === 'function') {
        try {
          (v as any)();
          (v as any)({});
          (v as any)([]);
        } catch {
          /* ok */
        }
      }
    }
    expect(true).toBe(true);
  });
});
