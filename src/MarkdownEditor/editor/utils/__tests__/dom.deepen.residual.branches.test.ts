/**
 * dom deepen：SSR window undefined 时 getSelRect 返回 null。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('dom deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('window undefined 时 getSelRect 为 null', async () => {
    vi.stubGlobal('window', undefined);
    const { getSelRect } = await import('../dom');
    expect(getSelRect()).toBeNull();
  });
});
