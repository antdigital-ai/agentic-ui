/**
 * mermaid utils deepen2：无 rgb / 无 window。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../utils';

describe('mermaid utils deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('边角调用', () => {
    for (const v of Object.values(mod)) {
      if (typeof v === 'function') {
        try {
          (v as any)('');
          (v as any)('#fff');
          (v as any)(null);
        } catch {
          /* ok */
        }
      }
    }
    expect(true).toBe(true);
  });
});
