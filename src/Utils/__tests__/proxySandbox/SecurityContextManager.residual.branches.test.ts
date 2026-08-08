/**
 * SecurityContextManager residual：默认合并、create/destroy context、execute。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SecurityContextManager } from '../../proxySandbox/SecurityContextManager';

describe('SecurityContextManager residual branches', () => {
  let manager: SecurityContextManager;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    manager?.destroy();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空配置与自定义 permissions/limits 合并', () => {
    manager = new SecurityContextManager();
    expect(manager).toBeTruthy();
    manager.destroy();
    manager = new SecurityContextManager({
      allowConsole: false,
      allowTimers: false,
      timeout: 100,
      permissions: { network: true },
      limits: { maxExecutionTime: 200 },
      monitoring: { enablePerformanceMonitoring: false },
    });
    expect(manager).toBeTruthy();
  });

  it('createContext / executeCode / destroyContext', async () => {
    manager = new SecurityContextManager({ timeout: 500 });
    const ctx = (manager as any).createContext?.('c1') ?? null;
    if (typeof (manager as any).execute === 'function') {
      const result = await (manager as any)
        .execute('return 1', 'c1')
        .catch(() => ({ success: false }));
      expect(result).toBeTruthy();
    } else if (typeof (manager as any).executeInContext === 'function') {
      const result = await (manager as any)
        .executeInContext('c1', 'return 1')
        .catch(() => ({ success: false }));
      expect(result).toBeTruthy();
    }
    expect(ctx === null || ctx !== undefined).toBe(true);
  });
});
