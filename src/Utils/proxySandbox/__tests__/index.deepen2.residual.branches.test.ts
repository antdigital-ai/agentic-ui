/**
 * proxySandbox deepen2：safeMathEval 非法结果；health checker。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createConfiguredSandbox,
  safeMathEval,
  sandboxHealthChecker,
} from '../index';

describe('proxySandbox deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('合法表达式求值；非法表达式拒绝', async () => {
    await expect(safeMathEval('1+2')).resolves.toBe(3);
    await expect(safeMathEval('not-a-number')).rejects.toThrow();
    const s = createConfiguredSandbox('basic');
    expect(s).toBeTruthy();
    s.destroy?.();
    expect(sandboxHealthChecker).toBeTruthy();
  });
});
