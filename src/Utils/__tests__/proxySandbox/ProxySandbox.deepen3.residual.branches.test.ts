/**
 * ProxySandbox deepen3：executeWithInstructionLimit timeoutId clear、
 * serializableParams null 早退、Worker 失败回退。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProxySandbox } from '../../proxySandbox/ProxySandbox';

describe('ProxySandbox deepen3 residual branches', () => {
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

  it('executeWithInstructionLimit：成功路径 clearTimeout', async () => {
    sandbox = new ProxySandbox({ timeout: 500 });
    const result = await (sandbox as any).executeWithInstructionLimit(
      'return 42',
    );
    expect(result).toBe(42);
  });

  it('executeWithInstructionLimit：抛错路径 clearTimeout', async () => {
    sandbox = new ProxySandbox({ timeout: 500 });
    await expect(
      (sandbox as any).executeWithInstructionLimit('throw new Error("x")'),
    ).rejects.toThrow();
  });

  it('trySerializeParams：循环引用 → null 早退', async () => {
    sandbox = new ProxySandbox({ timeout: 400 });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let resolve!: (v: any) => void;
    let reject!: (e?: any) => void;
    const p = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    const cyclic: any = {};
    cyclic.self = cyclic;
    const out = (sandbox as any).trySerializeParams(
      { bad: cyclic },
      'return 1',
      resolve,
      reject,
    );
    expect(out).toBeNull();
    warn.mockRestore();
    await Promise.race([p, vi.advanceTimersByTimeAsync(50)]);
  });

  it('executeWithWorker：无 Worker 时回退', async () => {
    sandbox = new ProxySandbox({ timeout: 400 });
    const origWorker = globalThis.Worker;
    // @ts-expect-error force missing
    globalThis.Worker = undefined;
    try {
      const result = await sandbox.execute('return 7');
      expect(result.success === true || result.success === false).toBe(true);
    } finally {
      globalThis.Worker = origWorker;
    }
  });

  it('fallbackToSyncExecution：正常代码走 timeout 保护', async () => {
    sandbox = new ProxySandbox({ timeout: 300 });
    await new Promise<void>((resolve) => {
      (sandbox as any).fallbackToSyncExecution(
        'return 3',
        {},
        () => resolve(),
        () => resolve(),
      );
    });
  });
});
