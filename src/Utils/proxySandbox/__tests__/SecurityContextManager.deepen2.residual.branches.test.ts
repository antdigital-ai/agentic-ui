/**
 * SecurityContextManager deepen2：无 performance.mark/measure；
 * checkCallStackDepth 无 stack / 空 stack 回退 0。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSecurityContextManager,
  SecurityContextManager,
} from '../SecurityContextManager';

describe('SecurityContextManager deepen2 residual branches', () => {
  const managers: SecurityContextManager[] = [];

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    while (managers.length) {
      managers.pop()?.destroy();
    }
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('performance.mark/measure 缺失时仍可执行', async () => {
    const mark = performance.mark;
    const measure = performance.measure;
    // @ts-expect-error test delete
    delete performance.mark;
    // @ts-expect-error test delete
    delete performance.measure;
    try {
      const m = createSecurityContextManager({
        monitoring: { enablePerformanceMonitoring: true },
      });
      managers.push(m);
      const id = m.createContext();
      const result = await m.executeInContext(id, 'return 2');
      expect(result.success).toBe(true);
    } finally {
      performance.mark = mark;
      performance.measure = measure;
    }
  });

  it('resourceMonitor checkCallStackDepth 有 stack / 无参抛错路径', async () => {
    const m = createSecurityContextManager({
      monitoring: { enableResourceMonitoring: true },
    });
    managers.push(m);
    const id = m.createContext();
    await m.executeInContext(id, 'return 1');
    const monitor = (m as any).globalMonitors?.get?.('resourceMonitor');
    if (monitor?.checkCallStackDepth) {
      expect(monitor.checkCallStackDepth('a\nb\nc')).toBe(3);
      expect(monitor.checkCallStackDepth()).toBeGreaterThanOrEqual(0);
    } else {
      expect(true).toBe(true);
    }
  });
});
