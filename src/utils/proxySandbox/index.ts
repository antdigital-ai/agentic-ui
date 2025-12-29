import type { SandboxConfig } from './ProxySandbox';
import { ProxySandbox, createSandbox, runInSandbox } from './ProxySandbox';
import type { SecurityContextConfig } from './SecurityContextManager';
import { SecurityContextManager } from './SecurityContextManager';

// 导出主要的沙箱类和工具函数
export { ProxySandbox, createSandbox, runInSandbox } from './ProxySandbox';

export type { SandboxConfig, SandboxResult } from './ProxySandbox';

// 导出安全上下文管理器
export {
  SecurityContextManager,
  createSecurityContextManager,
  runInSecureContext,
} from './SecurityContextManager';

export type {
  ExecutionContext,
  MonitoringConfig,
  PermissionConfig,
  ResourceLimits,
  SecurityContextConfig,
} from './SecurityContextManager';

// 导出工具类型
export type SandboxInstance = ProxySandbox;
export type SecurityManager = SecurityContextManager;

/**
 * 默认的沙箱配置
 */
export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  allowedGlobals: [
    'console',
    'Math',
    'Date',
    'JSON',
    'parseInt',
    'parseFloat',
    'String',
    'Number',
    'Boolean',
    'Array',
    'Object',
    'RegExp',
  ],
  forbiddenGlobals: [
    'eval',
    'Function',
    'constructor',
    'prototype',
    '__proto__',
    'document',
    'window',
    'global',
    'globalThis',
    'XMLHttpRequest',
    'fetch',
    'localStorage',
    'sessionStorage',
  ],
  allowConsole: true,
  allowTimers: false,
  timeout: 3000,
  strictMode: true,
  allowDOM: false,
  maxMemoryUsage: 5 * 1024 * 1024, // 5MB
};

/**
 * 默认的安全上下文配置
 */
export const DEFAULT_SECURITY_CONFIG: SecurityContextConfig = {
  ...DEFAULT_SANDBOX_CONFIG,
  permissions: {
    network: false,
    fileSystem: false,
    media: false,
    geolocation: false,
    notifications: false,
  },
  limits: {
    maxExecutionTime: 3000,
    maxMemoryUsage: 5 * 1024 * 1024,
    maxCallStackDepth: 50,
    maxLoopIterations: 1000,
  },
  monitoring: {
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    enableResourceMonitoring: true,
  },
};

/**
 * 沙箱工厂函数 - 创建配置好的沙箱实例
 */
export function createConfiguredSandbox(
  type: 'basic' | 'secure' | 'restricted' = 'basic',
): ProxySandbox {
  switch (type) {
    case 'basic':
      return createSandbox(DEFAULT_SANDBOX_CONFIG);

    case 'secure':
      return createSandbox({
        ...DEFAULT_SANDBOX_CONFIG,
        allowConsole: false,
        allowTimers: false,
        timeout: 2000,
        strictMode: true,
      });

    case 'restricted':
      return createSandbox({
        allowedGlobals: ['Math', 'JSON', 'String', 'Number'],
        forbiddenGlobals: [
          'console',
          'eval',
          'Function',
          'constructor',
          'prototype',
          '__proto__',
          'document',
          'window',
          'global',
          'globalThis',
        ],
        allowConsole: false,
        allowTimers: false,
        timeout: 1000,
        strictMode: true,
        allowDOM: false,
        maxMemoryUsage: 1024 * 1024, // 1MB
      });

    default:
      return createSandbox(DEFAULT_SANDBOX_CONFIG);
  }
}

/**
 * 快速执行简单代码的便捷函数
 */
export async function quickExecute(
  code: string,
  customGlobals?: Record<string, any>,
  injectedParams?: Record<string, any>,
): Promise<any> {
  const result = await runInSandbox(
    code,
    {
      ...DEFAULT_SANDBOX_CONFIG,
      customGlobals,
    },
    injectedParams,
  );

  if (!result.success) {
    throw result.error || new Error('Code execution failed');
  }

  return result.result;
}

/**
 * 执行数学表达式的安全计算器
 */
export async function safeMathEval(expression: string): Promise<number> {
  // 只允许数学运算和基本函数
  const mathOnlyConfig: SandboxConfig = {
    allowedGlobals: ['Math'],
    forbiddenGlobals: ['console', 'eval', 'Function', 'constructor'],
    allowConsole: false,
    allowTimers: false,
    timeout: 1000,
    strictMode: true,
    customGlobals: {
      // 预定义安全的数学函数
      abs: Math.abs,
      ceil: Math.ceil,
      floor: Math.floor,
      round: Math.round,
      max: Math.max,
      min: Math.min,
      pow: Math.pow,
      sqrt: Math.sqrt,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      PI: Math.PI,
      E: Math.E,
    },
  };

  // 验证表达式只包含安全字符
  const safePattern = /^[0-9+\-*/.() \t\n,a-zA-Z_$]+$/;
  if (!safePattern.test(expression)) {
    throw new Error('Expression contains unsafe characters');
  }

  const result = await runInSandbox(`return ${expression}`, mathOnlyConfig);

  if (!result.success) {
    throw result.error || new Error('Math evaluation failed');
  }

  const value = result.result;
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new Error('Result is not a valid number');
  }

  return value;
}

/**
 * 沙箱状态检查工具
 */
export class SandboxHealthChecker {
  private static instance: SandboxHealthChecker | null = null;

  static getInstance(): SandboxHealthChecker {
    if (!SandboxHealthChecker.instance) {
      SandboxHealthChecker.instance = new SandboxHealthChecker();
    }
    return SandboxHealthChecker.instance;
  }

  /**
   * 检查浏览器环境是否支持沙箱功能
   */
  checkEnvironmentSupport(): {
    supported: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 检查 Proxy 支持
    if (typeof Proxy === 'undefined') {
      issues.push('Proxy is not supported in this environment');
      recommendations.push('Use a modern browser that supports ES6 Proxy');
    }

    // 检查 Performance API
    if (typeof performance === 'undefined') {
      issues.push('Performance API is not available');
      recommendations.push('Performance monitoring will be disabled');
    }

    // 检查 Worker 支持（可选）
    if (typeof Worker === 'undefined') {
      recommendations.push(
        'Web Workers not supported - consider using for heavy computations',
      );
    }

    return {
      supported: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * 测试沙箱基本功能
   */
  async testBasicFunctionality(): Promise<{
    passed: boolean;
    results: Record<string, boolean>;
    errors: string[];
  }> {
    const results: Record<string, boolean> = {};
    const errors: string[] = [];

    try {
      // 测试基本代码执行
      const basicResult = await quickExecute('return 1 + 1');
      results.basicExecution = basicResult === 2;
    } catch (error) {
      results.basicExecution = false;
      errors.push(`Basic execution failed: ${error}`);
    }

    try {
      // 测试全局对象隔离
      await quickExecute('window = {}; return true');
      results.globalIsolation = false; // 应该抛出错误
    } catch (error) {
      results.globalIsolation = true; // 正确阻止了访问
    }

    try {
      // 测试超时机制
      await runInSandbox('while(true) {}', { timeout: 100 });
      results.timeoutMechanism = false; // 应该超时
    } catch (error) {
      results.timeoutMechanism =
        error instanceof Error && error.message.includes('timeout');
    }

    const passed = Object.values(results).every(Boolean);

    return { passed, results, errors };
  }
}

/**
 * 导出健康检查器实例
 */
export const sandboxHealthChecker = SandboxHealthChecker.getInstance();
