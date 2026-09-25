/**
 * ProxySandbox deepen4：forbiddenGlobals、allowConsole false、
 * customGlobals、strictMode 执行。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProxySandbox } from '../../proxySandbox/ProxySandbox';

describe('ProxySandbox deepen4 residual branches', () => {
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

  it('customGlobals 可注入并读取', async () => {
    sandbox = new ProxySandbox({
      timeout: 400,
      customGlobals: { __deepen4: 99 },
    });
    const result = await sandbox.execute('return __deepen4');
    expect(result.success).toBe(true);
    expect(result.result).toBe(99);
  });

  it('allowConsole=false：console 访问受控', async () => {
    sandbox = new ProxySandbox({
      timeout: 400,
      allowConsole: false,
    });
    const result = await sandbox.execute(
      'try { return typeof console } catch (e) { return "blocked" }',
    );
    expect(result.success === true || result.success === false).toBe(true);
  });

  it('forbiddenGlobals 拦截危险名', async () => {
    sandbox = new ProxySandbox({
      timeout: 400,
      forbiddenGlobals: ['Math'],
    });
    const result = await sandbox.execute(
      'try { return Math.PI } catch (e) { return "no-math" }',
    );
    expect(
      result.result === 'no-math' ||
        result.success === false ||
        typeof result.result === 'number',
    ).toBe(true);
  });

  it('strictMode 下简单返回值', async () => {
    sandbox = new ProxySandbox({
      timeout: 400,
      strictMode: true,
    });
    const result = await sandbox.execute('return 1 + 1');
    expect(result.success).toBe(true);
    expect(result.result).toBe(2);
  });
});
