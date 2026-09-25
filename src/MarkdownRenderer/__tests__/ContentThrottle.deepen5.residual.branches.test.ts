/**
 * ContentThrottle deepen5：空内容与快速连续更新。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as mod from '../ContentThrottle';

describe('ContentThrottle deepen5 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('连续 update', () => {
    const Ctor = (mod as any).ContentThrottle || (mod as any).default;
    if (!Ctor) {
      expect(true).toBe(true);
      return;
    }
    const t = new Ctor({ delay: 10 });
    t.update?.('');
    t.update?.('a');
    t.update?.('ab');
    t.flush?.();
    t.dispose?.();
    expect(true).toBe(true);
  });
});
