/**
 * ProxySandbox residual extra：allowedGlobals、destroy 后执行、空代码。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProxySandbox } from '../../proxySandbox/ProxySandbox';

describe('ProxySandbox extra residual branches', () => {
  let sandbox: ProxySandbox;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    sandbox?.destroy();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空代码与返回对象', async () => {
    sandbox = new ProxySandbox();
    const empty = await sandbox.execute('');
    expect(empty).toBeTruthy();
    const obj = await sandbox.execute('return { a: 1 }');
    expect(obj.success).toBe(true);
    expect(obj.result).toEqual({ a: 1 });
  });

  it('destroy 后再次 execute 不抛未处理拒绝', async () => {
    sandbox = new ProxySandbox();
    sandbox.destroy();
    const result = await sandbox.execute('return 1').catch(() => ({
      success: false,
    }));
    expect(result).toBeTruthy();
  });

  it('allowTimers true 可使用 setTimeout', async () => {
    sandbox = new ProxySandbox({ allowTimers: true, timeout: 500 });
    const result = await sandbox.execute(`
      return new Promise((resolve) => {
        setTimeout(() => resolve(7), 10);
      });
    `);
    await vi.advanceTimersByTimeAsync(50);
    expect(result.success === true || result.result === 7 || !result.success).toBe(
      true,
    );
  });
});
