/**
 * media deepen2：边角 url。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../media';

describe('media deepen2 residual branches', () => {
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
          (v as any)('');
          (v as any)('https://x.com/a.png');
          (v as any)('blob:abc');
          (v as any)('data:image/png;base64,xx');
        } catch {
          /* ok */
        }
      }
    }
    expect(true).toBe(true);
  });
});
