/**
 * 安全上下文管理器
 *
 * 提供更细粒度的安全控制，管理沙箱内的执行上下文，
 * 包括变量作用域、API 权限、资源限制等。
 *
 * @author md-editor
 * @version 1.0.0
 */

import { ProxySandbox, SandboxConfig, SandboxResult } from './ProxySandbox';

/**
 * 权限配置接口
 */
export interface PermissionConfig {
  /** 是否允许网络请求 */
  network: boolean;
  /** 是否允许文件操作 */
  fileSystem: boolean;
  /** 是否允许摄像头/麦克风访问 */
  media: boolean;
  /** 是否允许地理位置访问 */
  geolocation: boolean;
  /** 是否允许通知 */
  notifications: boolean;
}

/**
 * 资源限制接口
 */
export interface ResourceLimits {
  /** 最大执行时间 */
  maxExecutionTime: number;
  /** 最大内存使用 */
  maxMemoryUsage: number;
  /** 最大调用栈深度 */
  maxCallStackDepth: number;
  /** 最大循环次数 */
  maxLoopIterations: number;
}

/**
 * 监控配置接口
 */
export interface MonitoringConfig {
  /** 是否启用性能监控 */
  enablePerformanceMonitoring: boolean;
  /** 是否启用错误追踪 */
  enableErrorTracking: boolean;
  /** 是否启用资源使用监控 */
  enableResourceMonitoring: boolean;
}

/**
 * 安全上下文配置接口
 */
export interface SecurityContextConfig extends SandboxConfig {
  /** API 权限配置 */
  permissions?: Partial<PermissionConfig>;
  /** 资源限制 */
  limits?: Partial<ResourceLimits>;
  /** 监控配置 */
  monitoring?: Partial<MonitoringConfig>;
}

/**
 * 执行上下文信息
 */
export interface ExecutionContext {
  /** 上下文 ID */
  id: string;
  /** 创建时间 */
  createdAt: number;
  /** 变量作用域 */
  scope: Record<string, any>;
  /** 权限设置 */
  permissions: PermissionConfig;
  /** 资源使用情况 */
  resourceUsage: {
    memoryUsage: number;
    executionTime: number;
    callStackDepth: number;
    loopIterations: number;
  };
}

/**
 * 安全上下文管理器类
 */
export class SecurityContextManager {
  private contexts = new Map<string, ExecutionContext>();
  private config: {
    permissions: PermissionConfig;
    limits: ResourceLimits;
    monitoring: MonitoringConfig;
  } & Required<SandboxConfig>;
  private globalMonitors = new Map<string, any>();

  constructor(config: SecurityContextConfig = {}) {
    this.config = this.mergeDefaultConfig(config);
    this.initializeGlobalMonitors();
  }

  /**
   * 合并默认配置
   */
  private mergeDefaultConfig(config: SecurityContextConfig): {
    permissions: PermissionConfig;
    limits: ResourceLimits;
    monitoring: MonitoringConfig;
  } & Required<SandboxConfig> {
    return {
      // 继承沙箱配置
      allowedGlobals: config.allowedGlobals || [],
      forbiddenGlobals: config.forbiddenGlobals || [],
      allowConsole: config.allowConsole ?? true,
      allowTimers: config.allowTimers ?? true,
      timeout: config.timeout || 5000,
      strictMode: config.strictMode ?? true,
      customGlobals: config.customGlobals || {},
      allowDOM: config.allowDOM ?? false,
      maxMemoryUsage: config.maxMemoryUsage || 10 * 1024 * 1024,

      // 权限配置
      permissions: {
        network: config.permissions?.network ?? false,
        fileSystem: config.permissions?.fileSystem ?? false,
        media: config.permissions?.media ?? false,
        geolocation: config.permissions?.geolocation ?? false,
        notifications: config.permissions?.notifications ?? false,
      },

      // 资源限制
      limits: {
        maxExecutionTime: config.limits?.maxExecutionTime || 5000,
        maxMemoryUsage: config.limits?.maxMemoryUsage || 10 * 1024 * 1024,
        maxCallStackDepth: config.limits?.maxCallStackDepth || 100,
        maxLoopIterations: config.limits?.maxLoopIterations || 10000,
      },

      // 监控配置
      monitoring: {
        enablePerformanceMonitoring:
          config.monitoring?.enablePerformanceMonitoring ?? true,
        enableErrorTracking: config.monitoring?.enableErrorTracking ?? true,
        enableResourceMonitoring:
          config.monitoring?.enableResourceMonitoring ?? true,
      },
    };
  }

  /**
   * 初始化全局监控器
   */
  private initializeGlobalMonitors(): void {
    if (this.config.monitoring.enablePerformanceMonitoring) {
      this.globalMonitors.set('performance', this.createPerformanceMonitor());
    }

    if (this.config.monitoring.enableErrorTracking) {
      this.globalMonitors.set('errorTracker', this.createErrorTracker());
    }

    if (this.config.monitoring.enableResourceMonitoring) {
      this.globalMonitors.set('resourceMonitor', this.createResourceMonitor());
    }
  }

  /**
   * 创建性能监控器
   */
  private createPerformanceMonitor() {
    return {
      mark: (name: string) => {
        if (typeof performance !== 'undefined' && performance.mark) {
          performance.mark(`sandbox-${name}`);
        }
      },
      measure: (name: string, startMark: string, endMark: string) => {
        if (typeof performance !== 'undefined' && performance.measure) {
          try {
            performance.measure(
              name,
              `sandbox-${startMark}`,
              `sandbox-${endMark}`,
            );
          } catch (error) {
            console.warn('Performance measurement failed:', error);
          }
        }
      },
    };
  }

  /**
   * 创建错误追踪器
   */
  private createErrorTracker() {
    return {
      captureError: (error: Error, context: string) => {
        console.error(`[Sandbox Error] ${context}:`, error);
        // 这里可以集成第三方错误追踪服务
      },
      captureWarning: (message: string, context: string) => {
        console.warn(`[Sandbox Warning] ${context}: ${message}`);
      },
    };
  }

  /**
   * 创建资源监控器
   */
  private createResourceMonitor() {
    return {
      checkMemoryUsage: () => {
        if (typeof performance !== 'undefined' && (performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      },
      checkCallStackDepth: (stack?: string) => {
        if (stack) {
          return stack.split('\n').length;
        }
        try {
          throw new Error();
        } catch (e) {
          return (e as Error).stack?.split('\n').length || 0;
        }
      },
    };
  }

  /**
   * 创建新的执行上下文
   */
  createContext(contextId?: string): string {
    const id = contextId || this.generateContextId();

    const context: ExecutionContext = {
      id,
      createdAt: Date.now(),
      scope: {},
      permissions: {
        network: this.config.permissions.network,
        fileSystem: this.config.permissions.fileSystem,
        media: this.config.permissions.media,
        geolocation: this.config.permissions.geolocation,
        notifications: this.config.permissions.notifications,
      },
      resourceUsage: {
        memoryUsage: 0,
        executionTime: 0,
        callStackDepth: 0,
        loopIterations: 0,
      },
    };

    this.contexts.set(id, context);
    return id;
  }

  /**
   * 生成上下文 ID
   */
  private generateContextId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取执行上下文
   */
  getContext(contextId: string): ExecutionContext | undefined {
    return this.contexts.get(contextId);
  }

  /**
   * 删除执行上下文
   */
  deleteContext(contextId: string): boolean {
    return this.contexts.delete(contextId);
  }

  /**
   * 在指定上下文中执行代码
   */
  async executeInContext(
    contextId: string,
    code: string,
    additionalScope: Record<string, any> = {},
  ): Promise<SandboxResult> {
    const context = this.getContext(contextId);
    if (!context) {
      throw new Error(`Context ${contextId} not found`);
    }

    // 合并作用域
    const mergedScope = {
      ...context.scope,
      ...additionalScope,
    };

    // 创建沙箱配置
    const sandboxConfig: SandboxConfig = {
      allowedGlobals: this.config.allowedGlobals,
      forbiddenGlobals: this.config.forbiddenGlobals,
      allowConsole: this.config.allowConsole,
      allowTimers: this.config.allowTimers,
      timeout: this.config.limits.maxExecutionTime,
      strictMode: this.config.strictMode,
      customGlobals: {
        ...this.config.customGlobals,
        ...mergedScope,
        // 添加上下文相关的全局变量
        __context: {
          id: contextId,
          permissions: context.permissions,
        },
        // 添加监控功能
        ...(this.config.monitoring.enablePerformanceMonitoring && {
          __performance: this.globalMonitors.get('performance'),
        }),
      },
      allowDOM: this.config.allowDOM,
      maxMemoryUsage: this.config.limits.maxMemoryUsage,
    };

    // 包装代码以添加资源监控
    const wrappedCode = this.wrapCodeWithMonitoring(code);

    // 创建沙箱并执行
    const sandbox = new ProxySandbox(sandboxConfig);
    try {
      const result = await sandbox.execute(wrappedCode);

      // 更新上下文的资源使用情况
      this.updateContextResourceUsage(context, result);

      return result;
    } finally {
      sandbox.destroy();
    }
  }

  /**
   * 包装代码以添加监控
   */
  private wrapCodeWithMonitoring(code: string): string {
    if (!this.config.monitoring.enableResourceMonitoring) {
      return code;
    }

    // 对于简单的 return 语句，直接执行不包装
    // 这是一个简化的处理，对于复杂的监控需求，可以在未来版本中改进
    return code;
  }

  /**
   * 更新上下文的资源使用情况
   */
  private updateContextResourceUsage(
    context: ExecutionContext,
    result: SandboxResult,
  ): void {
    context.resourceUsage.executionTime = result.executionTime;
    context.resourceUsage.memoryUsage = result.memoryUsage || 0;

    // 检查资源限制
    this.checkResourceLimits(context);
  }

  /**
   * 检查资源限制
   */
  private checkResourceLimits(context: ExecutionContext): void {
    const { resourceUsage } = context;
    const { limits } = this.config;

    if (resourceUsage.executionTime > limits.maxExecutionTime) {
      throw new Error(
        `Execution time limit exceeded: ${resourceUsage.executionTime}ms > ${limits.maxExecutionTime}ms`,
      );
    }

    if (resourceUsage.memoryUsage > limits.maxMemoryUsage) {
      throw new Error(
        `Memory usage limit exceeded: ${resourceUsage.memoryUsage} > ${limits.maxMemoryUsage}`,
      );
    }

    if (resourceUsage.callStackDepth > limits.maxCallStackDepth) {
      throw new Error(
        `Call stack depth limit exceeded: ${resourceUsage.callStackDepth} > ${limits.maxCallStackDepth}`,
      );
    }
  }

  /**
   * 设置上下文变量
   */
  setContextVariable(contextId: string, name: string, value: any): boolean {
    const context = this.getContext(contextId);
    if (!context) {
      return false;
    }

    context.scope[name] = value;
    return true;
  }

  /**
   * 获取上下文变量
   */
  getContextVariable(contextId: string, name: string): any {
    const context = this.getContext(contextId);
    return context?.scope[name];
  }

  /**
   * 清理所有上下文
   */
  clearAllContexts(): void {
    this.contexts.clear();
  }

  /**
   * 获取所有上下文的统计信息
   */
  getStatistics() {
    const contexts = Array.from(this.contexts.values());

    return {
      totalContexts: contexts.length,
      totalMemoryUsage: contexts.reduce(
        (sum, ctx) => sum + ctx.resourceUsage.memoryUsage,
        0,
      ),
      totalExecutionTime: contexts.reduce(
        (sum, ctx) => sum + ctx.resourceUsage.executionTime,
        0,
      ),
      averageExecutionTime:
        contexts.length > 0
          ? contexts.reduce(
              (sum, ctx) => sum + ctx.resourceUsage.executionTime,
              0,
            ) / contexts.length
          : 0,
      oldestContext: contexts.reduce(
        (oldest, ctx) => (ctx.createdAt < oldest.createdAt ? ctx : oldest),
        contexts[0],
      ),
    };
  }

  /**
   * 获取管理器配置
   */
  getConfig() {
    return this.config;
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearAllContexts();
    this.globalMonitors.clear();
  }
}

/**
 * 创建安全上下文管理器的工厂函数
 */
export function createSecurityContextManager(
  config?: SecurityContextConfig,
): SecurityContextManager {
  return new SecurityContextManager(config);
}

/**
 * 快速在受控环境中执行代码的工具函数
 */
export async function runInSecureContext(
  code: string,
  config?: SecurityContextConfig,
  contextScope?: Record<string, any>,
): Promise<SandboxResult> {
  const manager = createSecurityContextManager(config);
  const contextId = manager.createContext();

  try {
    return await manager.executeInContext(contextId, code, contextScope);
  } finally {
    manager.destroy();
  }
}
