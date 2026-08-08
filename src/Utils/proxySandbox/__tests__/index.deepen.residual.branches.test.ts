/**
 * proxySandbox index deepen：默认 / secure / restricted 工厂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createConfiguredSandbox } from '../index';

describe('proxySandbox index deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('默认 basic 沙箱可创建并销毁', () => {
    const sandbox = createConfiguredSandbox();
    expect(sandbox).toBeTruthy();
    sandbox.destroy?.();
  });

  it('secure / restricted 变体', () => {
    const a = createConfiguredSandbox('secure');
    const b = createConfiguredSandbox('restricted');
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    a.destroy?.();
    b.destroy?.();
  });
});
