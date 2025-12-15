/**
 * proxySandbox/types.ts 测试用例
 *
 * 测试沙箱模块的 TypeScript 类型定义，包括枚举、类和接口
 */

import { describe, expect, it } from 'vitest';
import {
  SandboxErrorType,
  SandboxError,
  ExecutionStatus,
  PermissionLevel,
  MonitoringEventType,
  MonitoringEvent,
  MonitoringEventListener,
  CodeExecutionContext,
  ResourceUsageStats,
  SecurityPolicy,
  PerformanceConfig,
  ExtendedSandboxConfig,
  SandboxInstanceState,
  // ISandboxManager,
  // ICodeValidator,
  SandboxConfigType,
  SandboxFactoryOptions,
  GlobalSandboxSettings
} from '../../../src/Utils/proxySandbox/types';

describe('proxySandbox/types.ts', () => {
  describe('SandboxErrorType 枚举测试', () => {
    it('应该包含所有定义的错误类型', () => {
      expect(SandboxErrorType.TIMEOUT).toBe('TIMEOUT');
      expect(SandboxErrorType.MEMORY_LIMIT).toBe('MEMORY_LIMIT');
      expect(SandboxErrorType.FORBIDDEN_ACCESS).toBe('FORBIDDEN_ACCESS');
      expect(SandboxErrorType.SYNTAX_ERROR).toBe('SYNTAX_ERROR');
      expect(SandboxErrorType.RUNTIME_ERROR).toBe('RUNTIME_ERROR');
      expect(SandboxErrorType.SECURITY_VIOLATION).toBe('SECURITY_VIOLATION');
      expect(SandboxErrorType.RESOURCE_LIMIT).toBe('RESOURCE_LIMIT');
    });
  });

  describe('SandboxError 类测试', () => {
    it('应该正确创建 SandboxError 实例', () => {
      const error = new SandboxError('测试错误', SandboxErrorType.RUNTIME_ERROR, { test: 'data' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SandboxError);
      expect(error.message).toBe('测试错误');
      expect(error.type).toBe(SandboxErrorType.RUNTIME_ERROR);
      expect(error.context).toEqual({ test: 'data' });
      expect(typeof error.timestamp).toBe('number');
      expect(error.name).toBe('SandboxError');
    });

    it('应该在没有上下文时正确创建 SandboxError 实例', () => {
      const error = new SandboxError('测试错误', SandboxErrorType.SYNTAX_ERROR);
      
      expect(error.message).toBe('测试错误');
      expect(error.type).toBe(SandboxErrorType.SYNTAX_ERROR);
      expect(error.context).toBeUndefined();
      expect(typeof error.timestamp).toBe('number');
    });
  });

  describe('ExecutionStatus 枚举测试', () => {
    it('应该包含所有定义的执行状态', () => {
      expect(ExecutionStatus.PENDING).toBe('PENDING');
      expect(ExecutionStatus.RUNNING).toBe('RUNNING');
      expect(ExecutionStatus.SUCCESS).toBe('SUCCESS');
      expect(ExecutionStatus.FAILED).toBe('FAILED');
      expect(ExecutionStatus.CANCELLED).toBe('CANCELLED');
      expect(ExecutionStatus.TIMEOUT).toBe('TIMEOUT');
    });
  });

  describe('PermissionLevel 枚举测试', () => {
    it('应该包含所有定义的权限级别', () => {
      expect(PermissionLevel.NONE).toBe('NONE');
      expect(PermissionLevel.READ_ONLY).toBe('READ_ONLY');
      expect(PermissionLevel.LIMITED).toBe('LIMITED');
      expect(PermissionLevel.FULL).toBe('FULL');
    });
  });

  describe('MonitoringEventType 枚举测试', () => {
    it('应该包含所有定义的监控事件类型', () => {
      expect(MonitoringEventType.EXECUTION_START).toBe('EXECUTION_START');
      expect(MonitoringEventType.EXECUTION_END).toBe('EXECUTION_END');
      expect(MonitoringEventType.MEMORY_USAGE).toBe('MEMORY_USAGE');
      expect(MonitoringEventType.PERFORMANCE_WARNING).toBe('PERFORMANCE_WARNING');
      expect(MonitoringEventType.SECURITY_EVENT).toBe('SECURITY_EVENT');
      expect(MonitoringEventType.ERROR_EVENT).toBe('ERROR_EVENT');
    });
  });

  describe('类型接口测试', () => {
    it('应该正确定义 MonitoringEvent 接口', () => {
      const event: MonitoringEvent = {
        type: MonitoringEventType.EXECUTION_START,
        timestamp: Date.now(),
        contextId: 'test-context',
        data: { test: 'data' },
        message: '测试事件'
      };
      
      expect(event.type).toBe(MonitoringEventType.EXECUTION_START);
      expect(typeof event.timestamp).toBe('number');
      expect(event.contextId).toBe('test-context');
      expect(event.data).toEqual({ test: 'data' });
      expect(event.message).toBe('测试事件');
    });

    it('应该正确定义 MonitoringEventListener 类型', () => {
      const listener: MonitoringEventListener = () => {
        // 空实现，仅用于测试类型
      };
      
      expect(typeof listener).toBe('function');
    });

    it('应该正确定义 CodeExecutionContext 接口', () => {
      const context: CodeExecutionContext = {
        executionId: 'test-execution',
        code: 'console.log("test");',
        startTime: Date.now(),
        status: ExecutionStatus.RUNNING,
        result: 'test result',
        error: new SandboxError('测试错误', SandboxErrorType.RUNTIME_ERROR),
        memoryUsage: 1024,
        metadata: { test: 'metadata' }
      };
      
      expect(context.executionId).toBe('test-execution');
      expect(context.code).toBe('console.log("test");');
      expect(typeof context.startTime).toBe('number');
      expect(context.status).toBe(ExecutionStatus.RUNNING);
      expect(context.result).toBe('test result');
      expect(context.error).toBeInstanceOf(SandboxError);
      expect(context.memoryUsage).toBe(1024);
      expect(context.metadata).toEqual({ test: 'metadata' });
    });

    it('应该正确定义 ResourceUsageStats 接口', () => {
      const stats: ResourceUsageStats = {
        memoryUsage: 1024,
        executionTime: 50,
        cpuUsage: 75,
        callStackDepth: 3,
        loopIterations: 100,
        functionCalls: 20
      };
      
      expect(stats.memoryUsage).toBe(1024);
      expect(stats.executionTime).toBe(50);
      expect(stats.cpuUsage).toBe(75);
      expect(stats.callStackDepth).toBe(3);
      expect(stats.loopIterations).toBe(100);
      expect(stats.functionCalls).toBe(20);
    });

    it('应该正确定义 SecurityPolicy 接口', () => {
      const policy: SecurityPolicy = {
        network: PermissionLevel.LIMITED,
        fileSystem: PermissionLevel.NONE,
        dom: PermissionLevel.READ_ONLY,
        systemApi: PermissionLevel.NONE,
        thirdPartyLibs: PermissionLevel.LIMITED,
        customRules: [
          {
            name: 'test-rule',
            pattern: 'test-pattern',
            action: 'deny'
          }
        ]
      };
      
      expect(policy.network).toBe(PermissionLevel.LIMITED);
      expect(policy.fileSystem).toBe(PermissionLevel.NONE);
      expect(policy.dom).toBe(PermissionLevel.READ_ONLY);
      expect(policy.systemApi).toBe(PermissionLevel.NONE);
      expect(policy.thirdPartyLibs).toBe(PermissionLevel.LIMITED);
      expect(policy.customRules).toHaveLength(1);
      expect(policy.customRules?.[0].name).toBe('test-rule');
    });

    it('应该正确定义 PerformanceConfig 接口', () => {
      const config: PerformanceConfig = {
        enableMonitoring: true,
        samplingRate: 0.5,
        memoryWarningThreshold: 1024 * 1024,
        executionTimeWarningThreshold: 1000,
        enableDetailedLogging: false
      };
      
      expect(config.enableMonitoring).toBe(true);
      expect(config.samplingRate).toBe(0.5);
      expect(config.memoryWarningThreshold).toBe(1024 * 1024);
      expect(config.executionTimeWarningThreshold).toBe(1000);
      expect(config.enableDetailedLogging).toBe(false);
    });

    it('应该正确定义 ExtendedSandboxConfig 接口', () => {
      const config: ExtendedSandboxConfig = {
        basic: {
          allowedGlobals: ['Math'],
          forbiddenGlobals: ['eval'],
          allowConsole: true,
          allowTimers: true,
          timeout: 3000,
          strictMode: false,
          customGlobals: {},
          allowDOM: false,
          maxMemoryUsage: 1024 * 1024
        },
        security: {
          network: PermissionLevel.LIMITED,
          fileSystem: PermissionLevel.NONE,
          dom: PermissionLevel.READ_ONLY,
          systemApi: PermissionLevel.NONE,
          thirdPartyLibs: PermissionLevel.LIMITED
        },
        performance: {
          enableMonitoring: true,
          samplingRate: 0.5,
          memoryWarningThreshold: 1024 * 1024,
          executionTimeWarningThreshold: 1000,
          enableDetailedLogging: false
        },
        monitoring: {
          enablePerformanceMonitoring: true,
          enableErrorTracking: true,
          enableResourceMonitoring: true,
          enableSecurityAuditing: true,
          eventListeners: []
        },
        debug: {
          enableDebugMode: false,
          logLevel: 'info',
          enableSourceMaps: true,
          enableStackTrace: true
        }
      };
      
      expect(Array.isArray(config.basic.allowedGlobals)).toBe(true);
      expect(config.security.network).toBe(PermissionLevel.LIMITED);
      expect(config.performance.enableMonitoring).toBe(true);
      expect(config.monitoring.enablePerformanceMonitoring).toBe(true);
      expect(config.debug.enableDebugMode).toBe(false);
    });

    it('应该正确定义 SandboxInstanceState 接口', () => {
      const state: SandboxInstanceState = {
        instanceId: 'test-instance',
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        isActive: true,
        executionCount: 5,
        totalResourceUsage: {
          memoryUsage: 1024,
          executionTime: 50,
          callStackDepth: 3,
          loopIterations: 100
        },
        errorCount: 2,
        config: {
          basic: {
            allowedGlobals: ['Math'],
            forbiddenGlobals: ['eval'],
            allowConsole: true,
            allowTimers: true,
            timeout: 3000,
            strictMode: false,
            customGlobals: {},
            allowDOM: false,
            maxMemoryUsage: 1024 * 1024
          },
          security: {
            network: PermissionLevel.LIMITED,
            fileSystem: PermissionLevel.NONE,
            dom: PermissionLevel.READ_ONLY,
            systemApi: PermissionLevel.NONE,
            thirdPartyLibs: PermissionLevel.LIMITED
          },
          performance: {
            enableMonitoring: true,
            samplingRate: 0.5,
            memoryWarningThreshold: 1024 * 1024,
            executionTimeWarningThreshold: 1000,
            enableDetailedLogging: false
          },
          monitoring: {
            enablePerformanceMonitoring: true,
            enableErrorTracking: true,
            enableResourceMonitoring: true,
            enableSecurityAuditing: true,
            eventListeners: []
          },
          debug: {
            enableDebugMode: false,
            logLevel: 'info',
            enableSourceMaps: true,
            enableStackTrace: true
          }
        }
      };
      
      expect(state.instanceId).toBe('test-instance');
      expect(typeof state.createdAt).toBe('number');
      expect(typeof state.lastActiveAt).toBe('number');
      expect(state.isActive).toBe(true);
      expect(state.executionCount).toBe(5);
      expect(state.totalResourceUsage.memoryUsage).toBe(1024);
      expect(state.errorCount).toBe(2);
    });

    it('应该正确定义 SandboxConfigType 类型', () => {
      const types: SandboxConfigType[] = [
        'basic',
        'secure',
        'restricted',
        'development',
        'production',
        'custom'
      ];
      
      expect(types).toHaveLength(6);
      expect(types.includes('basic')).toBe(true);
      expect(types.includes('secure')).toBe(true);
      expect(types.includes('restricted')).toBe(true);
      expect(types.includes('development')).toBe(true);
      expect(types.includes('production')).toBe(true);
      expect(types.includes('custom')).toBe(true);
    });

    it('应该正确定义 SandboxFactoryOptions 接口', () => {
      const options: SandboxFactoryOptions = {
        type: 'secure',
        customConfig: {
          basic: {
            allowedGlobals: ['Math'],
            forbiddenGlobals: ['eval'],
            allowConsole: false,
            allowTimers: false,
            timeout: 2000,
            strictMode: true,
            customGlobals: {},
            allowDOM: false,
            maxMemoryUsage: 1024 * 1024
          },
          security: {
            network: PermissionLevel.NONE,
            fileSystem: PermissionLevel.NONE,
            dom: PermissionLevel.NONE,
            systemApi: PermissionLevel.NONE,
            thirdPartyLibs: PermissionLevel.NONE
          },
          performance: {
            enableMonitoring: true,
            samplingRate: 0.5,
            memoryWarningThreshold: 1024 * 1024,
            executionTimeWarningThreshold: 1000,
            enableDetailedLogging: false
          },
          monitoring: {
            enablePerformanceMonitoring: true,
            enableErrorTracking: true,
            enableResourceMonitoring: true,
            enableSecurityAuditing: true,
            eventListeners: []
          },
          debug: {
            enableDebugMode: false,
            logLevel: 'info',
            enableSourceMaps: true,
            enableStackTrace: true
          }
        },
        enableCaching: true,
        poolSize: 5
      };
      
      expect(options.type).toBe('secure');
      expect(options.enableCaching).toBe(true);
      expect(options.poolSize).toBe(5);
    });

    it('应该正确定义 GlobalSandboxSettings 接口', () => {
      const settings: GlobalSandboxSettings = {
        defaultTimeout: 3000,
        defaultMemoryLimit: 1024 * 1024,
        globalErrorHandler: () => {
          // 空实现，仅用于测试类型
        },
        globalPerformanceMonitoring: true,
        cleanupInterval: 60000
      };
      
      expect(settings.defaultTimeout).toBe(3000);
      expect(settings.defaultMemoryLimit).toBe(1024 * 1024);
      expect(typeof settings.globalErrorHandler).toBe('function');
      expect(settings.globalPerformanceMonitoring).toBe(true);
      expect(settings.cleanupInterval).toBe(60000);
    });
  });
});