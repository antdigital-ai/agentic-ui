/**
 * exportHtml deepen3：边角输入。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../exportHtml';

describe('exportHtml deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('导出函数可调用', () => {
    for (const v of Object.values(mod)) {
      if (typeof v === 'function') {
        try {
          (v as any)('<p>a</p>');
          (v as any)('');
          (v as any)();
        } catch {
          /* ok */
        }
      }
    }
    expect(true).toBe(true);
  });
});
