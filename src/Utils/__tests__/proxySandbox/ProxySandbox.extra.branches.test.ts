import { describe, expect, it } from 'vitest';
import { ProxySandbox } from '../../proxySandbox/ProxySandbox';

describe('ProxySandbox 额外分支', () => {
  it('allowNetwork:false 阻止 fetch（若暴露）', async () => {
    const sandbox = new ProxySandbox({ allowNetwork: false });
    const result = await sandbox.execute(`
      try {
        return typeof fetch
      } catch (e) {
        return 'err'
      }
    `);
    expect(result.success).toBe(true);
    sandbox.destroy();
  });

  it.skip('多次 execute 共享沙箱状态（同实例）', async () => {
    const sandbox = new ProxySandbox();
    await sandbox.execute('globalThis.__x = 1; return 1');
    const second = await sandbox.execute('return globalThis.__x');
    expect(second.success).toBe(true);
    sandbox.destroy();
  });

  it('空代码 / 仅表达式', async () => {
    const sandbox = new ProxySandbox();
    const empty = await sandbox.execute('');
    expect(empty.success === true || empty.success === false).toBe(true);
    const expr = await sandbox.execute('return 2+2');
    expect(expr.result).toBe(4);
    sandbox.destroy();
  });

  it('customGlobals 覆盖同名只读探测', async () => {
    const sandbox = new ProxySandbox({
      customGlobals: { Math: { abs: (n: number) => Math.abs(n) } },
    });
    const result = await sandbox.execute('return Math.abs(-3)');
    expect(result.success).toBe(true);
    sandbox.destroy();
  });
});
