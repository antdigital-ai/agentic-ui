/**
 * SecurityContextManager 分支覆盖补充测试
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SecurityContextManager,
  type ExecutionContext,
} from '../../../src/Utils/proxySandbox/SecurityContextManager';

describe('SecurityContextManager 分支覆盖', () => {
  let manager: SecurityContextManager;

  afterEach(() => {
    manager?.destroy();
  });

  /* ====== performanceMonitor.mark / measure ====== */

  describe('性能监控器 mark 和 measure', () => {
    it('mark 在 performance 可用时调用 performance.mark', () => {
      manager = new SecurityContextManager({
        monitoring: { enablePerformanceMonitoring: true },
      });

      const perfMonitor = (manager as any).globalMonitors.get('performance');
      expect(perfMonitor).toBeDefined();

      const markSpy = vi.spyOn(performance, 'mark');
      perfMonitor.mark('test-start');
      expect(markSpy).toHaveBeenCalledWith('sandbox-test-start');
      markSpy.mockRestore();
    });

    it('measure 在 performance 可用时调用 performance.measure', () => {
      manager = new SecurityContextManager({
        monitoring: { enablePerformanceMonitoring: true },
      });

      const perfMonitor = (manager as any).globalMonitors.get('performance');

      // 先创建 mark 点
      performance.mark('sandbox-start');
      performance.mark('sandbox-end');

      const measureSpy = vi.spyOn(performance, 'measure');
      perfMonitor.measure('test-measure', 'start', 'end');
      expect(measureSpy).toHaveBeenCalledWith(
        'test-measure',
        'sandbox-start',
        'sandbox-end',
      );
      measureSpy.mockRestore();

      // 清理 marks
      performance.clearMarks('sandbox-start');
      performance.clearMarks('sandbox-end');
      performance.clearMeasures('test-measure');
    });

    it('measure 在 performance.measure 抛错时 console.warn', () => {
      manager = new SecurityContextManager({
        monitoring: { enablePerformanceMonitoring: true },
      });

      const perfMonitor = (manager as any).globalMonitors.get('performance');
      const measureSpy = vi
        .spyOn(performance, 'measure')
        .mockImplementation(() => {
          throw new Error('measure error');
        });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      perfMonitor.measure('fail', 'noexist1', 'noexist2');

      expect(warnSpy).toHaveBeenCalledWith(
        'Performance measurement failed:',
        expect.any(Error),
      );

      measureSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  /* ====== errorTracker.captureError / captureWarning ====== */

  describe('错误追踪器 captureError 和 captureWarning', () => {
    it('captureError 输出 console.error', () => {
      manager = new SecurityContextManager({
        monitoring: { enableErrorTracking: true },
      });

      const tracker = (manager as any).globalMonitors.get('errorTracker');
      expect(tracker).toBeDefined();

      const errorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      tracker.captureError(new Error('test error'), 'testContext');
      expect(errorSpy).toHaveBeenCalledWith(
        '[Sandbox Error] testContext:',
        expect.any(Error),
      );
      errorSpy.mockRestore();
    });

    it('captureWarning 输出 console.warn', () => {
      manager = new SecurityContextManager({
        monitoring: { enableErrorTracking: true },
      });

      const tracker = (manager as any).globalMonitors.get('errorTracker');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      tracker.captureWarning('test warning', 'warnCtx');
      expect(warnSpy).toHaveBeenCalledWith(
        '[Sandbox Warning] warnCtx: test warning',
      );
      warnSpy.mockRestore();
    });
  });

  /* ====== resourceMonitor.checkMemoryUsage / checkCallStackDepth ====== */

  describe('资源监控器 checkMemoryUsage 和 checkCallStackDepth', () => {
    it('checkMemoryUsage 返回数值', () => {
      manager = new SecurityContextManager({
        monitoring: { enableResourceMonitoring: true },
      });

      const resMonitor = (manager as any).globalMonitors.get('resourceMonitor');
      expect(resMonitor).toBeDefined();

      const result = resMonitor.checkMemoryUsage();
      expect(typeof result).toBe('number');
    });

    it('checkCallStackDepth 传入 stack 时按换行分割', () => {
      manager = new SecurityContextManager({
        monitoring: { enableResourceMonitoring: true },
      });

      const resMonitor = (manager as any).globalMonitors.get('resourceMonitor');
      const depth = resMonitor.checkCallStackDepth('line1\nline2\nline3');
      expect(depth).toBe(3);
    });

    it('checkCallStackDepth 无 stack 时通过 throw 获取深度', () => {
      manager = new SecurityContextManager({
        monitoring: { enableResourceMonitoring: true },
      });

      const resMonitor = (manager as any).globalMonitors.get('resourceMonitor');
      const depth = resMonitor.checkCallStackDepth();
      expect(typeof depth).toBe('number');
      expect(depth).toBeGreaterThan(0);
    });
  });

  /* ====== wrapCodeWithMonitoring — 资源监控禁用 ====== */

  describe('wrapCodeWithMonitoring 资源监控禁用时直接返回代码', () => {
    it('enableResourceMonitoring=false 时原样返回代码', () => {
      manager = new SecurityContextManager({
        monitoring: { enableResourceMonitoring: false },
      });

      const code = 'return 1 + 1';
      const wrapped = (manager as any).wrapCodeWithMonitoring(code);
      expect(wrapped).toBe(code);
    });
  });

  /* ====== checkResourceLimits 各条件触发 ====== */

  describe('checkResourceLimits 资源超限抛错', () => {
    it('executionTime 超限时抛出错误', () => {
      manager = new SecurityContextManager({
        limits: { maxExecutionTime: 100 },
      });

      const context: ExecutionContext = {
        id: 'test',
        createdAt: Date.now(),
        scope: {},
        permissions: (manager as any).config.permissions,
        resourceUsage: {
          memoryUsage: 0,
          executionTime: 200,
          callStackDepth: 0,
          loopIterations: 0,
        },
      };

      expect(() => (manager as any).checkResourceLimits(context)).toThrow(
        'Execution time limit exceeded',
      );
    });

    it('memoryUsage 超限时抛出错误', () => {
      manager = new SecurityContextManager({
        limits: { maxMemoryUsage: 1000 },
      });

      const context: ExecutionContext = {
        id: 'test',
        createdAt: Date.now(),
        scope: {},
        permissions: (manager as any).config.permissions,
        resourceUsage: {
          memoryUsage: 2000,
          executionTime: 0,
          callStackDepth: 0,
          loopIterations: 0,
        },
      };

      expect(() => (manager as any).checkResourceLimits(context)).toThrow(
        'Memory usage limit exceeded',
      );
    });

    it('callStackDepth 超限时抛出错误', () => {
      manager = new SecurityContextManager({
        limits: { maxCallStackDepth: 10 },
      });

      const context: ExecutionContext = {
        id: 'test',
        createdAt: Date.now(),
        scope: {},
        permissions: (manager as any).config.permissions,
        resourceUsage: {
          memoryUsage: 0,
          executionTime: 0,
          callStackDepth: 50,
          loopIterations: 0,
        },
      };

      expect(() => (manager as any).checkResourceLimits(context)).toThrow(
        'Call stack depth limit exceeded',
      );
    });
  });
});
