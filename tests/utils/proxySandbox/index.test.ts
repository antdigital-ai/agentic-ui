/**
 * proxySandbox/index.ts 测试用例
 *
 * 测试沙箱工厂函数、便捷函数和健康检查器
 */

import { describe, expect, it, vi } from 'vitest';
import {
  createConfiguredSandbox,
  DEFAULT_SANDBOX_CONFIG,
  DEFAULT_SECURITY_CONFIG,
  quickExecute,
  safeMathEval,
  SandboxHealthChecker,
  sandboxHealthChecker,
} from '../../../src/Utils/proxySandbox';

describe('proxySandbox/index.ts', () => {
  describe('DEFAULT_SANDBOX_CONFIG', () => {
    it('应该包含所有必需的配置项', () => {
      expect(DEFAULT_SANDBOX_CONFIG).toBeDefined();
      expect(DEFAULT_SANDBOX_CONFIG.allowedGlobals).toBeInstanceOf(Array);
      expect(DEFAULT_SANDBOX_CONFIG.forbiddenGlobals).toBeInstanceOf(Array);
      expect(typeof DEFAULT_SANDBOX_CONFIG.allowConsole).toBe('boolean');
      expect(typeof DEFAULT_SANDBOX_CONFIG.allowTimers).toBe('boolean');
      expect(typeof DEFAULT_SANDBOX_CONFIG.timeout).toBe('number');
      expect(typeof DEFAULT_SANDBOX_CONFIG.strictMode).toBe('boolean');
      expect(typeof DEFAULT_SANDBOX_CONFIG.allowDOM).toBe('boolean');
      expect(typeof DEFAULT_SANDBOX_CONFIG.maxMemoryUsage).toBe('number');
    });

    it('应该包含安全的全局对象', () => {
      expect(DEFAULT_SANDBOX_CONFIG.allowedGlobals).toContain('console');
      expect(DEFAULT_SANDBOX_CONFIG.allowedGlobals).toContain('Math');
      expect(DEFAULT_SANDBOX_CONFIG.allowedGlobals).toContain('JSON');
    });

    it('应该包含禁止的全局对象', () => {
      expect(DEFAULT_SANDBOX_CONFIG.forbiddenGlobals).toContain('eval');
      expect(DEFAULT_SANDBOX_CONFIG.forbiddenGlobals).toContain('Function');
      expect(DEFAULT_SANDBOX_CONFIG.forbiddenGlobals).toContain('window');
    });
  });

  describe('DEFAULT_SECURITY_CONFIG', () => {
    it('应该包含所有必需的配置项', () => {
      expect(DEFAULT_SECURITY_CONFIG).toBeDefined();
      expect(DEFAULT_SECURITY_CONFIG.permissions).toBeDefined();
      expect(DEFAULT_SECURITY_CONFIG.limits).toBeDefined();
      expect(DEFAULT_SECURITY_CONFIG.monitoring).toBeDefined();
    });

    it('应该继承 DEFAULT_SANDBOX_CONFIG', () => {
      expect(DEFAULT_SECURITY_CONFIG.allowedGlobals).toEqual(
        DEFAULT_SANDBOX_CONFIG.allowedGlobals,
      );
      expect(DEFAULT_SECURITY_CONFIG.timeout).toBe(
        DEFAULT_SANDBOX_CONFIG.timeout,
      );
    });

    it('应该包含权限配置', () => {
      expect(typeof DEFAULT_SECURITY_CONFIG.permissions?.network).toBe(
        'boolean',
      );
      expect(typeof DEFAULT_SECURITY_CONFIG.permissions?.fileSystem).toBe(
        'boolean',
      );
      expect(typeof DEFAULT_SECURITY_CONFIG.permissions?.media).toBe('boolean');
    });

    it('应该包含资源限制配置', () => {
      expect(typeof DEFAULT_SECURITY_CONFIG.limits?.maxExecutionTime).toBe(
        'number',
      );
      expect(typeof DEFAULT_SECURITY_CONFIG.limits?.maxMemoryUsage).toBe(
        'number',
      );
      expect(typeof DEFAULT_SECURITY_CONFIG.limits?.maxCallStackDepth).toBe(
        'number',
      );
    });
  });

  describe('createConfiguredSandbox', () => {
    it('应该创建基础沙箱', () => {
      const sandbox = createConfiguredSandbox('basic');

      expect(sandbox).toBeDefined();
      expect(sandbox.getConfig().allowConsole).toBe(true);
      expect(sandbox.getConfig().timeout).toBe(3000);

      sandbox.destroy();
    });

    it('应该创建安全沙箱', () => {
      const sandbox = createConfiguredSandbox('secure');

      expect(sandbox).toBeDefined();
      expect(sandbox.getConfig().allowConsole).toBe(false);
      expect(sandbox.getConfig().allowTimers).toBe(false);
      expect(sandbox.getConfig().timeout).toBe(2000);
      expect(sandbox.getConfig().strictMode).toBe(true);

      sandbox.destroy();
    });

    it('应该创建受限沙箱', () => {
      const sandbox = createConfiguredSandbox('restricted');

      expect(sandbox).toBeDefined();
      expect(sandbox.getConfig().allowConsole).toBe(false);
      expect(sandbox.getConfig().allowTimers).toBe(false);
      expect(sandbox.getConfig().timeout).toBe(1000);
      expect(sandbox.getConfig().strictMode).toBe(true);
      expect(sandbox.getConfig().maxMemoryUsage).toBe(1024 * 1024);
      expect(sandbox.getConfig().allowedGlobals).toEqual([
        'Math',
        'JSON',
        'String',
        'Number',
      ]);

      sandbox.destroy();
    });

    it('应该处理未知类型，返回基础沙箱', () => {
      const sandbox = createConfiguredSandbox('unknown' as any);

      expect(sandbox).toBeDefined();
      expect(sandbox.getConfig().allowConsole).toBe(true);

      sandbox.destroy();
    });
  });

  describe('quickExecute', () => {
    it('应该能够执行简单代码', async () => {
      const result = await quickExecute('return 1 + 1');
      expect(result).toBe(2);
    });

    it('应该支持自定义全局变量', async () => {
      const result = await quickExecute('return customVar', {
        customVar: 'test-value',
      });
      expect(result).toBe('test-value');
    });

    it('应该支持注入参数', async () => {
      const result = await quickExecute('return injected', undefined, {
        injected: 'injected-value',
      });
      expect(result).toBe('injected-value');
    });

    it('应该同时支持自定义全局变量和注入参数', async () => {
      const result = await quickExecute(
        'return customVar + " " + injected',
        { customVar: 'custom' },
        { injected: 'injected' },
      );
      expect(result).toBe('custom injected');
    });

    it('应该在执行失败时抛出错误', async () => {
      await expect(
        quickExecute('throw new Error("test error")'),
      ).rejects.toThrow('test error');
    });

    it('应该在没有错误对象时抛出默认错误', async () => {
      // 模拟一个没有 error 的结果
      const { runInSandbox } = await import(
        '../../../src/Utils/proxySandbox/ProxySandbox'
      );
      const originalRunInSandbox = runInSandbox;
      vi.spyOn(
        await import('../../../src/Utils/proxySandbox/ProxySandbox'),
        'runInSandbox',
      ).mockResolvedValueOnce({
        success: false,
        result: undefined,
        error: undefined,
        executionTime: 0,
      });

      await expect(quickExecute('return 1')).rejects.toThrow(
        'Code execution failed',
      );

      vi.restoreAllMocks();
    });
  });

  describe('safeMathEval', () => {
    it('应该能够计算简单的数学表达式', async () => {
      const result = await safeMathEval('1 + 1');
      expect(result).toBe(2);
    });

    it('应该支持数学函数', async () => {
      const result = await safeMathEval('Math.sqrt(16)');
      expect(result).toBe(4);
    });

    it('应该支持预定义的数学函数', async () => {
      const result1 = await safeMathEval('abs(-5)');
      expect(result1).toBe(5);

      const result2 = await safeMathEval('ceil(4.2)');
      expect(result2).toBe(5);

      const result3 = await safeMathEval('floor(4.8)');
      expect(result3).toBe(4);

      const result4 = await safeMathEval('round(4.6)');
      expect(result4).toBe(5);
    });

    it('应该支持数学常量', async () => {
      const piResult = await safeMathEval('PI');
      expect(piResult).toBeCloseTo(Math.PI);

      const eResult = await safeMathEval('E');
      expect(eResult).toBeCloseTo(Math.E);
    });

    it('应该拒绝包含不安全字符的表达式', async () => {
      await expect(safeMathEval('1 + 1; eval("bad")')).rejects.toThrow(
        'Expression contains unsafe characters',
      );
    });

    it('应该在执行失败时抛出错误', async () => {
      await expect(safeMathEval('invalid expression')).rejects.toThrow();
    });

    it('应该在结果不是有效数字时抛出错误', async () => {
      // 模拟返回非数字结果
      const { runInSandbox } = await import(
        '../../../src/Utils/proxySandbox/ProxySandbox'
      );
      vi.spyOn(
        await import('../../../src/Utils/proxySandbox/ProxySandbox'),
        'runInSandbox',
      ).mockResolvedValueOnce({
        success: true,
        result: 'not a number',
        executionTime: 0,
      });

      await expect(safeMathEval('1 + 1')).rejects.toThrow(
        'Result is not a valid number',
      );

      vi.restoreAllMocks();
    });

    it('应该在结果为 Infinity 时抛出错误', async () => {
      vi.spyOn(
        await import('../../../src/Utils/proxySandbox/ProxySandbox'),
        'runInSandbox',
      ).mockResolvedValueOnce({
        success: true,
        result: Infinity,
        executionTime: 0,
      });

      await expect(safeMathEval('1 / 0')).rejects.toThrow(
        'Result is not a valid number',
      );

      vi.restoreAllMocks();
    });

    it('应该支持复杂的数学表达式', async () => {
      const result = await safeMathEval('(1 + 2) * 3 - 4');
      expect(result).toBe(5);
    });
  });

  describe('SandboxHealthChecker', () => {
    describe('getInstance', () => {
      it('应该返回单例实例', () => {
        const instance1 = SandboxHealthChecker.getInstance();
        const instance2 = SandboxHealthChecker.getInstance();

        expect(instance1).toBe(instance2);
      });
    });

    describe('checkEnvironmentSupport', () => {
      it('应该在支持的环境中返回 supported: true', () => {
        const checker = SandboxHealthChecker.getInstance();
        const result = checker.checkEnvironmentSupport();

        // 在现代浏览器中应该支持
        expect(typeof result.supported).toBe('boolean');
        expect(Array.isArray(result.issues)).toBe(true);
        expect(Array.isArray(result.recommendations)).toBe(true);
      });

      it('应该检查 Proxy 支持', () => {
        const checker = SandboxHealthChecker.getInstance();
        const result = checker.checkEnvironmentSupport();

        // 如果 Proxy 存在，不应该有相关 issue
        if (typeof Proxy !== 'undefined') {
          expect(result.issues).not.toContain(
            'Proxy is not supported in this environment',
          );
        }
      });

      it('应该检查 Performance API 支持', () => {
        const checker = SandboxHealthChecker.getInstance();
        const result = checker.checkEnvironmentSupport();

        // 如果 performance 存在，不应该有相关 issue
        if (typeof performance !== 'undefined') {
          expect(result.issues).not.toContain(
            'Performance API is not available',
          );
        }
      });

      it('应该提供 Worker 支持的建议', () => {
        const checker = SandboxHealthChecker.getInstance();
        const result = checker.checkEnvironmentSupport();

        // 应该包含 recommendations 数组
        expect(Array.isArray(result.recommendations)).toBe(true);
      });
    });

    describe('testBasicFunctionality', () => {
      it('应该测试基本代码执行', async () => {
        const checker = SandboxHealthChecker.getInstance();
        const result = await checker.testBasicFunctionality();

        // 基本执行测试应该存在
        expect(result.results).toHaveProperty('basicExecution');
        expect(typeof result.results.basicExecution).toBe('boolean');
        expect(Array.isArray(result.errors)).toBe(true);
      });

      it('应该测试全局对象隔离', async () => {
        const checker = SandboxHealthChecker.getInstance();
        const result = await checker.testBasicFunctionality();

        // 全局隔离测试应该存在
        expect(result.results).toHaveProperty('globalIsolation');
        expect(typeof result.results.globalIsolation).toBe('boolean');
      });

      it('应该测试超时机制', async () => {
        const checker = SandboxHealthChecker.getInstance();
        const result = await checker.testBasicFunctionality();

        // 超时机制测试应该存在
        expect(result.results).toHaveProperty('timeoutMechanism');
        expect(typeof result.results.timeoutMechanism).toBe('boolean');
      });

      it('应该返回测试结果和错误数组', async () => {
        const checker = SandboxHealthChecker.getInstance();
        const result = await checker.testBasicFunctionality();

        expect(result).toHaveProperty('passed');
        expect(typeof result.passed).toBe('boolean');
        expect(result).toHaveProperty('results');
        expect(typeof result.results).toBe('object');
        expect(result).toHaveProperty('errors');
        expect(Array.isArray(result.errors)).toBe(true);
      });
    });
  });

  describe('sandboxHealthChecker', () => {
    it('应该导出健康检查器实例', () => {
      expect(sandboxHealthChecker).toBeDefined();
      expect(sandboxHealthChecker).toBeInstanceOf(SandboxHealthChecker);
    });

    it('应该能够调用 checkEnvironmentSupport', () => {
      const result = sandboxHealthChecker.checkEnvironmentSupport();
      expect(result).toHaveProperty('supported');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
    });

    it('应该能够调用 testBasicFunctionality', async () => {
      const result = await sandboxHealthChecker.testBasicFunctionality();
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('errors');
    });
  });
});
