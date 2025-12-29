/**
 * 沙箱模块的 TypeScript 类型定义
 *
 * 提供完整的类型定义，确保类型安全和良好的开发体验。
 *
 * @author md-editor
 * @version 1.0.0
 */

/**
 * 沙箱错误类型枚举
 */
export enum SandboxErrorType {
  /** 代码执行超时 */
  TIMEOUT = 'TIMEOUT',
  /** 内存超限 */
  MEMORY_LIMIT = 'MEMORY_LIMIT',
  /** 访问被禁止的全局对象 */
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',
  /** 语法错误 */
  SYNTAX_ERROR = 'SYNTAX_ERROR',
  /** 运行时错误 */
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  /** 安全违规 */
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  /** 资源限制 */
  RESOURCE_LIMIT = 'RESOURCE_LIMIT',
}

/**
 * 沙箱错误类
 */
export class SandboxError extends Error {
  public readonly type: SandboxErrorType;
  public readonly context?: Record<string, any>;
  public readonly timestamp: number;

  constructor(
    message: string,
    type: SandboxErrorType,
    context?: Record<string, any>,
  ) {
    super(message);
    this.name = 'SandboxError';
    this.type = type;
    this.context = context;
    this.timestamp = Date.now();
  }
}

/**
 * 代码执行状态枚举
 */
export enum ExecutionStatus {
  /** 准备中 */
  PENDING = 'PENDING',
  /** 执行中 */
  RUNNING = 'RUNNING',
  /** 执行成功 */
  SUCCESS = 'SUCCESS',
  /** 执行失败 */
  FAILED = 'FAILED',
  /** 已取消 */
  CANCELLED = 'CANCELLED',
  /** 超时 */
  TIMEOUT = 'TIMEOUT',
}

/**
 * 权限级别枚举
 */
export enum PermissionLevel {
  /** 无权限 */
  NONE = 'NONE',
  /** 只读权限 */
  READ_ONLY = 'READ_ONLY',
  /** 受限权限 */
  LIMITED = 'LIMITED',
  /** 完全权限 */
  FULL = 'FULL',
}

/**
 * 监控事件类型
 */
export enum MonitoringEventType {
  /** 执行开始 */
  EXECUTION_START = 'EXECUTION_START',
  /** 执行结束 */
  EXECUTION_END = 'EXECUTION_END',
  /** 内存使用变化 */
  MEMORY_USAGE = 'MEMORY_USAGE',
  /** 性能警告 */
  PERFORMANCE_WARNING = 'PERFORMANCE_WARNING',
  /** 安全事件 */
  SECURITY_EVENT = 'SECURITY_EVENT',
  /** 错误事件 */
  ERROR_EVENT = 'ERROR_EVENT',
}

/**
 * 监控事件接口
 */
export interface MonitoringEvent {
  /** 事件类型 */
  type: MonitoringEventType;
  /** 事件时间戳 */
  timestamp: number;
  /** 上下文ID */
  contextId?: string;
  /** 事件数据 */
  data?: Record<string, any>;
  /** 事件描述 */
  message?: string;
}

/**
 * 监控事件监听器类型
 */
export type MonitoringEventListener = (event: MonitoringEvent) => void;

/**
 * 代码执行上下文
 */
export interface CodeExecutionContext {
  /** 执行ID */
  executionId: string;
  /** 代码内容 */
  code: string;
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime?: number;
  /** 执行状态 */
  status: ExecutionStatus;
  /** 执行结果 */
  result?: any;
  /** 错误信息 */
  error?: SandboxError;
  /** 内存使用情况 */
  memoryUsage?: number;
  /** 自定义元数据 */
  metadata?: Record<string, any>;
}

/**
 * 资源使用统计
 */
export interface ResourceUsageStats {
  /** 内存使用（字节） */
  memoryUsage: number;
  /** 执行时间（毫秒） */
  executionTime: number;
  /** CPU 使用率（0-100） */
  cpuUsage?: number;
  /** 调用栈深度 */
  callStackDepth: number;
  /** 循环次数 */
  loopIterations: number;
  /** 函数调用次数 */
  functionCalls?: number;
}

/**
 * 安全策略配置
 */
export interface SecurityPolicy {
  /** 网络访问权限 */
  network: PermissionLevel;
  /** 文件系统权限 */
  fileSystem: PermissionLevel;
  /** DOM 访问权限 */
  dom: PermissionLevel;
  /** 系统API权限 */
  systemApi: PermissionLevel;
  /** 第三方库权限 */
  thirdPartyLibs: PermissionLevel;
  /** 自定义权限规则 */
  customRules?: Array<{
    name: string;
    pattern: string | RegExp;
    action: 'allow' | 'deny' | 'warn';
  }>;
}

/**
 * 沙箱性能配置
 */
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enableMonitoring: boolean;
  /** 性能数据采样率 (0-1) */
  samplingRate: number;
  /** 内存警告阈值（字节） */
  memoryWarningThreshold: number;
  /** 执行时间警告阈值（毫秒） */
  executionTimeWarningThreshold: number;
  /** 是否启用详细的性能日志 */
  enableDetailedLogging: boolean;
}

/**
 * 扩展的沙箱配置接口
 */
export interface ExtendedSandboxConfig {
  /** 基础沙箱配置 */
  basic: {
    allowedGlobals: string[];
    forbiddenGlobals: string[];
    allowConsole: boolean;
    allowTimers: boolean;
    timeout: number;
    strictMode: boolean;
    customGlobals: Record<string, any>;
    allowDOM: boolean;
    maxMemoryUsage: number;
  };
  /** 安全策略 */
  security: SecurityPolicy;
  /** 性能配置 */
  performance: PerformanceConfig;
  /** 监控配置 */
  monitoring: {
    enablePerformanceMonitoring: boolean;
    enableErrorTracking: boolean;
    enableResourceMonitoring: boolean;
    enableSecurityAuditing: boolean;
    eventListeners: MonitoringEventListener[];
  };
  /** 调试配置 */
  debug: {
    enableDebugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    enableSourceMaps: boolean;
    enableStackTrace: boolean;
  };
}

/**
 * 沙箱实例状态
 */
export interface SandboxInstanceState {
  /** 实例ID */
  instanceId: string;
  /** 创建时间 */
  createdAt: number;
  /** 最后活跃时间 */
  lastActiveAt: number;
  /** 是否处于活跃状态 */
  isActive: boolean;
  /** 已执行的代码数量 */
  executionCount: number;
  /** 累计资源使用 */
  totalResourceUsage: ResourceUsageStats;
  /** 错误计数 */
  errorCount: number;
  /** 当前配置 */
  config: ExtendedSandboxConfig;
}

/**
 * 沙箱管理器接口
 */
export interface ISandboxManager {
  /** 创建沙箱实例 */
  createSandbox(config?: Partial<ExtendedSandboxConfig>): Promise<string>;

  /** 销毁沙箱实例 */
  destroySandbox(instanceId: string): Promise<boolean>;

  /** 执行代码 */
  executeCode(
    instanceId: string,
    code: string,
    context?: Record<string, any>,
  ): Promise<CodeExecutionContext>;

  /** 获取实例状态 */
  getInstanceState(instanceId: string): SandboxInstanceState | null;

  /** 获取所有实例 */
  getAllInstances(): SandboxInstanceState[];

  /** 清理所有实例 */
  cleanup(): Promise<void>;

  /** 添加监控事件监听器 */
  addEventListener(listener: MonitoringEventListener): void;

  /** 移除监控事件监听器 */
  removeEventListener(listener: MonitoringEventListener): void;
}

/**
 * 代码验证器接口
 */
export interface ICodeValidator {
  /** 验证代码语法 */
  validateSyntax(code: string): {
    valid: boolean;
    errors: Array<{
      line: number;
      column: number;
      message: string;
      type: 'error' | 'warning';
    }>;
  };

  /** 检查安全风险 */
  checkSecurity(code: string): {
    safe: boolean;
    risks: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      line?: number;
      suggestion?: string;
    }>;
  };

  /** 估算资源使用 */
  estimateResourceUsage(code: string): {
    estimatedMemory: number;
    estimatedExecutionTime: number;
    complexity: 'low' | 'medium' | 'high';
  };
}

/**
 * 导出的主要类型联合
 */
export type SandboxConfigType =
  | 'basic'
  | 'secure'
  | 'restricted'
  | 'development'
  | 'production'
  | 'custom';

/**
 * 沙箱工厂选项
 */
export interface SandboxFactoryOptions {
  /** 配置类型 */
  type: SandboxConfigType;
  /** 自定义配置 */
  customConfig?: Partial<ExtendedSandboxConfig>;
  /** 是否启用缓存 */
  enableCaching?: boolean;
  /** 实例池大小 */
  poolSize?: number;
}

/**
 * 全局沙箱配置
 */
export interface GlobalSandboxSettings {
  /** 默认超时时间 */
  defaultTimeout: number;
  /** 默认内存限制 */
  defaultMemoryLimit: number;
  /** 全局错误处理器 */
  globalErrorHandler?: (error: SandboxError) => void;
  /** 全局性能监控 */
  globalPerformanceMonitoring: boolean;
  /** 实例清理间隔（毫秒） */
  cleanupInterval: number;
}

/**
 * 沙箱配置类型别名
 */
export type SandboxConfig = ExtendedSandboxConfig;
export type SandboxManager = ISandboxManager;
export type CodeValidator = ICodeValidator;
export type SandboxErrorClass = SandboxError;
export type SandboxEvent = MonitoringEvent;
export type SandboxContext = CodeExecutionContext;
export type SandboxState = SandboxInstanceState;
export type SandboxStats = ResourceUsageStats;
export type SandboxPolicy = SecurityPolicy;
