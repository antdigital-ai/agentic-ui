/**
 * proxySandbox index midtail：工厂 / math / health（避开不稳定 Worker 路径）。
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  createConfiguredSandbox,
  DEFAULT_SANDBOX_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  quickExecute,
  safeMathEval,
  SandboxHealthChecker,
} from '../index';

describe('proxySandbox index midtail branches', () => {
  const sandboxes: { destroy: () => void }[] = [];

  afterEach(() => {
    while (sandboxes.length) {
      sandboxes.pop()?.destroy();
    }
  });

  it('createConfiguredSandbox 四分支', () => {
    for (const type of ['basic', 'secure', 'restricted', 'other'] as const) {
      const s = createConfiguredSandbox(type as any);
      sandboxes.push(s);
      expect(s).toBeTruthy();
    }
    expect(DEFAULT_SANDBOX_CONFIG.timeout).toBe(3000);
    expect(DEFAULT_SECURITY_CONFIG.limits?.maxCallStackDepth).toBe(50);
  });

  it('safeMathEval：合法 / 非法字符', async () => {
    expect(await safeMathEval('max(1,2,3)')).toBe(3);
    expect(await safeMathEval('PI')).toBeCloseTo(Math.PI);
    await expect(safeMathEval('1+2')).resolves.toBe(3);
    await expect(safeMathEval('1;alert(1)')).rejects.toThrow(/unsafe/i);
  });

  it('quickExecute 成功与失败', async () => {
    await expect(quickExecute('return 10')).resolves.toBe(10);
    await expect(
      quickExecute('throw new Error("x")'),
    ).rejects.toBeTruthy();
  });

  it('health checker support + basicExecution', async () => {
    const checker = SandboxHealthChecker.getInstance();
    const env = checker.checkEnvironmentSupport();
    expect(env.supported).toBe(true);
    const result = await checker.testBasicFunctionality();
    expect(result.results.basicExecution).toBe(true);
  });
});
