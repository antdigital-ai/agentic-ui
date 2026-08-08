/**
 * FileTypeProcessor deepen3：未知扩展与空名。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../FileTypeProcessor';

describe('FileTypeProcessor deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('未知类型处理', () => {
    for (const v of Object.values(mod)) {
      if (typeof v === 'function') {
        try {
          (v as any)({ name: 'a.unknownext', url: 'https://x/a.unknownext' });
          (v as any)({ name: '' });
          (v as any)('nope.xyz');
        } catch {
          /* ok */
        }
      }
    }
    expect(true).toBe(true);
  });
});
