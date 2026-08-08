/**
 * ProxySandbox 分支覆盖：DOM 代理、自定义全局、错误路径。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { ProxySandbox } from '../../proxySandbox/ProxySandbox';

describe('ProxySandbox branches', () => {
  let sandbox: ProxySandbox;

  afterEach(() => {
    sandbox?.destroy();
  });

  it('allowDOM:true 时 document 为受限代理', async () => {
    sandbox = new ProxySandbox({ allowDOM: true });
    const result = await sandbox.execute(`
      return {
        hasDoc: typeof document !== 'undefined',
        title: document.title,
        q: document.querySelector('x')
      }
    `);
    expect(result.success).toBe(true);
    expect(result.result.hasDoc).toBe(true);
    expect(result.result.title).toBe('Sandbox Document');
    expect(result.result.q).toBeNull();
  });

  it('customGlobals 注入自定义变量', async () => {
    sandbox = new ProxySandbox({
      customGlobals: { MY_FLAG: 'yes' },
    });
    const result = await sandbox.execute('return MY_FLAG');
    expect(result.result).toBe('yes');
  });

  it('执行语法错误返回 success:false', async () => {
    sandbox = new ProxySandbox();
    const result = await sandbox.execute('return {{{');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('destroy 后可重新创建', () => {
    sandbox = new ProxySandbox();
    sandbox.destroy();
    sandbox = new ProxySandbox();
    expect(sandbox).toBeDefined();
  });

  it('strictMode:false 仍可执行', async () => {
    sandbox = new ProxySandbox({ strictMode: false });
    const result = await sandbox.execute('var x = 1; return x');
    expect(result.success).toBe(true);
    expect(result.result).toBe(1);
  });

  it('timeout 配置可构造', async () => {
    sandbox = new ProxySandbox({ timeout: 10000 });
    const result = await sandbox.execute('return 1');
    expect(result.success).toBe(true);
  });
});
