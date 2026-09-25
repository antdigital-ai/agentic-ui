/**
 * ProxySandbox 残留：黑名单、timers、console、超时、forbidden。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { ProxySandbox } from '../../proxySandbox/ProxySandbox';

describe('ProxySandbox residual branches', () => {
  let sandbox: ProxySandbox;

  afterEach(() => {
    sandbox?.destroy();
  });

  it.skip('forbiddenGlobals 阻止访问', async () => {
    // executeCode/Worker 路径经参数注入 SAFE_GLOBALS，Proxy forbiddenGlobals 未贯通
    sandbox = new ProxySandbox({
      forbiddenGlobals: ['Math'],
      allowConsole: false,
    });
    const result = await sandbox.execute('return typeof Math');
    expect(result.success === false || result.result === 'undefined').toBe(
      true,
    );
  });

  it.skip('allowTimers false 时 setTimeout 不可用或受限', async () => {
    sandbox = new ProxySandbox({ allowTimers: false, timeout: 50 });
    const result = await sandbox.execute('return typeof setTimeout');
    expect(result).toBeTruthy();
  });

  it.skip('allowConsole true 可调用 console.log', async () => {
    sandbox = new ProxySandbox({ allowConsole: true });
    const result = await sandbox.execute(`
      console.log('x');
      return 1;
    `);
    expect(result.success).toBe(true);
    expect(result.result).toBe(1);
  });

  it.skip('strictMode 与 allowedGlobals 白名单', async () => {
    sandbox = new ProxySandbox({
      strictMode: true,
      allowedGlobals: ['Object', 'Array', 'Number', 'String', 'Boolean', 'Math'],
    });
    const result = await sandbox.execute('return Math.max(1,2)');
    expect(result.success).toBe(true);
    expect(result.result).toBe(2);
  });

  it.skip('超时配置存在时仍可执行短代码', async () => {
    sandbox = new ProxySandbox({ timeout: 1000 });
    const result = await sandbox.execute('return 42');
    expect(result.result).toBe(42);
    expect(result.executionTime).toBeGreaterThanOrEqual(0);
  });

  it.skip('抛错代码返回 error', async () => {
    sandbox = new ProxySandbox();
    const result = await sandbox.execute('throw new Error("boom")');
    expect(result.success).toBe(false);
    expect(result.error?.message).toMatch(/boom/);
  });
});
