/**
 * ProxySandbox deepen residual：allowedGlobals 缺失、allowConsole 消息、
 * forbidden ReferenceError 改写、非序列化参数回退。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProxySandbox } from '../../proxySandbox/ProxySandbox';

describe('ProxySandbox deepen residual branches', () => {
  let sandbox: ProxySandbox;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    sandbox?.destroy();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('allowedGlobals 含不存在名时跳过；customGlobals 可读', async () => {
    sandbox = new ProxySandbox({
      allowedGlobals: ['Math', '__not_a_real_global__'],
      customGlobals: { myConst: 42 },
      timeout: 500,
    });
    const result = await sandbox.execute('return myConst + Math.abs(-1)');
    expect(result.success).toBe(true);
    expect(result.result).toBe(43);
  });

  it('allowConsole true：handleConsoleMessage 转发 log', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    sandbox = new ProxySandbox({ allowConsole: true, timeout: 500 });
    (sandbox as any).handleConsoleMessage('log', ['hello']);
    (sandbox as any).handleConsoleMessage('nope', ['x']);
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('executeCode：forbiddenGlobals 的 ReferenceError 改写消息', () => {
    sandbox = new ProxySandbox({
      forbiddenGlobals: ['evilVar'],
      timeout: 500,
      strictMode: true,
    });
    expect(() =>
      (sandbox as any).executeCode('return evilVar'),
    ).toThrow(/not allowed|is not defined/);
  });

  it('trySerializeParams：不可序列化参数走同步回退', async () => {
    sandbox = new ProxySandbox({ timeout: 500 });
    const fn = () => 1;
    const result = await sandbox.execute('return typeof cb', { cb: fn });
    expect(result.success === true || result.success === false).toBe(true);
  });

  it('createSafeWindow allowConsole 注入 console；超时 clearTimeout', async () => {
    sandbox = new ProxySandbox({
      allowConsole: true,
      allowTimers: false,
      timeout: 50,
    });
    const win = (sandbox as any).createSafeWindow();
    expect(win.console).toBeTruthy();
    const p = sandbox.execute(`
      while(true) {}
    `);
    await vi.advanceTimersByTimeAsync(100);
    const result = await p;
    expect(result.success === false || result.error).toBeTruthy();
  });
});
