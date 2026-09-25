/**
 * ProxySandbox deepen5 safe：createSafeWindow、execute、instructionLimit、console。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProxySandbox } from '../../proxySandbox/ProxySandbox';

describe('ProxySandbox deepen5 safe residual branches', () => {
  let sandbox: ProxySandbox | undefined;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    sandbox?.destroy();
    sandbox = undefined;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('createSafeWindow：浏览器环境写入 innerWidth/screen', () => {
    sandbox = new ProxySandbox({ timeout: 400 });
    const safeWindow = (sandbox as any).createSafeWindow();
    expect(safeWindow.innerWidth).toBe(1024);
    expect(safeWindow.screen?.width).toBe(1920);
  });

  it('globalProxy：globalThis 不在 target 时返回 receiver', () => {
    sandbox = new ProxySandbox({
      timeout: 400,
      allowedGlobals: ['window', 'global', 'globalThis', 'Math'],
      forbiddenGlobals: ['eval', 'Function'],
    });
    delete (sandbox as any).sandboxGlobal.globalThis;
    const proxy = (sandbox as any).globalProxy;
    expect((proxy as any).globalThis).toBe(proxy);
  });

  it('execute 可读 window.innerWidth', async () => {
    sandbox = new ProxySandbox({
      timeout: 400,
      allowedGlobals: ['window', 'Math'],
      forbiddenGlobals: ['eval', 'Function', 'constructor', '__proto__'],
    });
    const result = await sandbox.execute('return window.innerWidth');
    expect(result.success).toBe(true);
    expect(result.result).toBe(1024);
  });

  it('executeWithInstructionLimit：成功/失败均 clearTimeout', async () => {
    sandbox = new ProxySandbox({ timeout: 800 });
    await expect(
      (sandbox as any).executeWithInstructionLimit('return 11'),
    ).resolves.toBe(11);
    await expect(
      (sandbox as any).executeWithInstructionLimit('throw new Error("boom")'),
    ).rejects.toThrow('boom');
  });

  it('handleConsoleMessage 与 forbidden 变量', async () => {
    sandbox = new ProxySandbox({
      timeout: 400,
      allowConsole: true,
      forbiddenGlobals: ['blockedVar'],
    });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    (sandbox as any).handleConsoleMessage('log', ['hello']);
    expect(logSpy).toHaveBeenCalled();

    const bad = await sandbox.execute('return blockedVar');
    expect(bad.success).toBe(false);
    logSpy.mockRestore();
  });
});
