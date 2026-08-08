/**
 * SecurityContextManager deepen：memory 监控、无 stack、LRU 淘汰 oldest。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSecurityContextManager,
  SecurityContextManager,
} from '../SecurityContextManager';

describe('SecurityContextManager deepen residual branches', () => {
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

  it('performance.memory 存在时执行仍成功', async () => {
    Object.defineProperty(performance, 'memory', {
      configurable: true,
      value: { usedJSHeapSize: 12345 },
    });
    const m = createSecurityContextManager({
      monitoring: { enableResourceMonitoring: true },
    });
    managers.push(m);
    const id = m.createContext();
    const result = await m.executeInContext(id, 'return 1');
    expect(result.success).toBe(true);
  });

  it('getStatistics oldestContext 取 createdAt 更早者', () => {
    const m = createSecurityContextManager();
    managers.push(m);
    const older = m.createContext('older');
    const olderCtx = m.getContext(older)!;
    olderCtx.createdAt = 1;
    const newer = m.createContext('newer');
    const newerCtx = m.getContext(newer)!;
    newerCtx.createdAt = 100;
    const stats = m.getStatistics();
    expect(stats.oldestContext?.id).toBe('older');
    expect(stats.totalContexts).toBe(2);
  });

  it('getStatistics 空上下文 average 为 0', () => {
    const m = createSecurityContextManager();
    managers.push(m);
    const stats = m.getStatistics();
    expect(stats.totalContexts).toBe(0);
    expect(stats.averageExecutionTime).toBe(0);
  });
});
