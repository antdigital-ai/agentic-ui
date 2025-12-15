import { 
  performanceMonitor, 
  withPerformanceMonitoring,
  generateOperationId
} from '@ant-design/agentic-ui/MarkdownEditor/editor/utils/performanceMonitor';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('performanceMonitor', () => {
  // 保存原始的console.log和process.env.NODE_ENV
  const originalLog = console.log;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Mock console.log
    console.log = vi.fn();
    // 重置性能监控器
    (performanceMonitor as any).metrics.clear();
    // 设置为开发环境以启用监控
    process.env.NODE_ENV = 'development';
    // 重新创建实例以确保isEnabled为true
    (performanceMonitor as any).isEnabled = true;
  });

  afterEach(() => {
    // 恢复原始的console.log
    console.log = originalLog;
    // 恢复原始的NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  describe('startMonitoring', () => {
    it('应该正确开始监控', () => {
      const operationId = 'test-op-1';
      const contentType = 'text' as const;
      const contentSize = 1024;

      performanceMonitor.startMonitoring(operationId, contentType, contentSize);

      const metric = (performanceMonitor as any).metrics.get(operationId);
      expect(metric).toBeDefined();
      expect(metric.startTime).toBeTypeOf('number');
      expect(metric.contentSize).toBe(contentSize);
      expect(metric.contentType).toBe(contentType);
      expect(metric.operationType).toBe('total');
      
      // 验证是否调用了console.log
      expect(console.log).toHaveBeenCalledWith(
        `🚀 开始粘贴操作 [${operationId}]:`,
        {
          contentType,
          contentSize: '1.0 KB'
        }
      );
    });

    it('在非开发环境下不应该记录指标', () => {
      process.env.NODE_ENV = 'production';
      // 重新创建实例以更新isEnabled状态
      (performanceMonitor as any).isEnabled = false;
      
      const operationId = 'test-op-2';
      const contentType = 'html' as const;
      const contentSize = 2048;

      performanceMonitor.startMonitoring(operationId, contentType, contentSize);

      const metric = (performanceMonitor as any).metrics.get(operationId);
      expect(metric).toBeUndefined();
    });
  });

  describe('startSubOperation', () => {
    it('应该正确开始子操作', () => {
      const operationId = 'test-op-3';
      const subOperation = 'parse' as const;
      
      // 先开始主监控
      performanceMonitor.startMonitoring(operationId, 'text', 512);
      
      performanceMonitor.startSubOperation(operationId, subOperation);

      const subMetricId = `${operationId}-${subOperation}`;
      const metric = (performanceMonitor as any).metrics.get(subMetricId);
      expect(metric).toBeDefined();
      expect(metric.startTime).toBeTypeOf('number');
      expect(metric.contentSize).toBe(512); // 应该继承自父操作
      expect(metric.contentType).toBe('text'); // 应该继承自父操作
      expect(metric.operationType).toBe(subOperation);
    });

    it('当父操作不存在时不应该创建子操作', () => {
      const operationId = 'non-existent-op';
      const subOperation = 'upload' as const;
      
      performanceMonitor.startSubOperation(operationId, subOperation);

      const subMetricId = `${operationId}-${subOperation}`;
      const metric = (performanceMonitor as any).metrics.get(subMetricId);
      expect(metric).toBeUndefined();
    });
  });

  describe('endSubOperation', () => {
    it('应该正确结束子操作并计算持续时间', () => {
      const operationId = 'test-op-4';
      const subOperation = 'insert' as const;
      
      // 开始主监控和子操作
      performanceMonitor.startMonitoring(operationId, 'files', 1024);
      performanceMonitor.startSubOperation(operationId, subOperation);
      
      performanceMonitor.endSubOperation(operationId, subOperation);

      const subMetricId = `${operationId}-${subOperation}`;
      const metric = (performanceMonitor as any).metrics.get(subMetricId);
      expect(metric).toBeDefined();
      expect(metric.endTime).toBeTypeOf('number');
      expect(metric.duration).toBeTypeOf('number');
      expect(metric.duration).toBeGreaterThanOrEqual(0);
      
      // 验证是否调用了console.log
      expect(console.log).toHaveBeenCalledWith(
        `✅ 内容插入 完成 [${operationId}]:`,
        {
          duration: expect.stringMatching(/^\d+\.\d{2}ms$/),
          contentSize: '1.0 KB'
        }
      );
    });
  });

  describe('endMonitoring', () => {
    it('应该正确结束监控并计算持续时间', () => {
      const operationId = 'test-op-5';
      
      performanceMonitor.startMonitoring(operationId, 'mixed', 2048);
      
      // 清除之前的调用记录
      (console.log as any).mockClear();
      
      performanceMonitor.endMonitoring(operationId);

      // 验证是否调用了console.log（检查最后一次调用）
      expect(console.log).toHaveBeenLastCalledWith(
        `🎉 粘贴操作完成 [${operationId}]:`,
        {
          totalDuration: expect.stringMatching(/^\d+\.\d{2}ms$/),
          contentType: 'mixed',
          contentSize: '2.0 KB',
          performance: expect.any(String) // 改为接受任意字符串
        }
      );
      
      // 验证指标已被删除
      const metricAfterEnd = (performanceMonitor as any).metrics.get(operationId);
      expect(metricAfterEnd).toBeUndefined();
    });
  });

  describe('getPerformanceRating', () => {
    it('应该根据持续时间和内容大小返回正确的性能评级', () => {
      // 优秀的性能 (< 10ms/KB)
      expect((performanceMonitor as any).getPerformanceRating(5, 1024)).toBe('🚀 优秀');
      
      // 良好的性能 (< 50ms/KB)
      expect((performanceMonitor as any).getPerformanceRating(25, 1024)).toBe('✅ 良好');
      
      // 一般的性能 (< 100ms/KB)
      expect((performanceMonitor as any).getPerformanceRating(75, 1024)).toBe('⚠️ 一般');
      
      // 较慢的性能 (>= 100ms/KB)
      expect((performanceMonitor as any).getPerformanceRating(200, 1024)).toBe('🐌 较慢');
    });
  });

  describe('formatSize', () => {
    it('应该正确格式化字节大小', () => {
      // 小于1KB
      expect((performanceMonitor as any).formatSize(512)).toBe('512 B');
      
      // KB范围
      expect((performanceMonitor as any).formatSize(1024)).toBe('1.0 KB');
      expect((performanceMonitor as any).formatSize(1536)).toBe('1.5 KB');
      
      // MB范围
      expect((performanceMonitor as any).formatSize(1024 * 1024)).toBe('1.0 MB');
      expect((performanceMonitor as any).formatSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });
  });

  describe('getOperationName', () => {
    it('应该返回正确的操作名称', () => {
      expect((performanceMonitor as any).getOperationName('parse')).toBe('内容解析');
      expect((performanceMonitor as any).getOperationName('upload')).toBe('文件上传');
      expect((performanceMonitor as any).getOperationName('insert')).toBe('内容插入');
      expect((performanceMonitor as any).getOperationName('total')).toBe('总操作');
    });
  });

  describe('setEnabled', () => {
    it('应该能够启用/禁用监控', () => {
      // 默认应该是启用的（因为我们在beforeEach中设置了）
      expect((performanceMonitor as any).isEnabled).toBe(true);
      
      // 禁用监控
      performanceMonitor.setEnabled(false);
      expect((performanceMonitor as any).isEnabled).toBe(false);
      
      // 启用监控
      performanceMonitor.setEnabled(true);
      expect((performanceMonitor as any).isEnabled).toBe(true);
    });
  });

  describe('getReport', () => {
    it('应该返回正确的性能报告', () => {
      // 直接向metrics中添加一些带有持续时间的指标来测试getReport
      const metrics = (performanceMonitor as any).metrics;
      
      // 添加一些已完成的操作指标（注意：这些不会被endMonitoring自动删除，
      // 因为我们是直接操作metrics）
      metrics.set('op-1', {
        startTime: 1000,
        endTime: 1100,
        duration: 100,
        contentSize: 1024,
        contentType: 'text',
        operationType: 'parse'
      });
      
      metrics.set('op-2', {
        startTime: 2000,
        endTime: 2200,
        duration: 200,
        contentSize: 2048,
        contentType: 'html',
        operationType: 'insert'
      });
      
      const report = performanceMonitor.getReport();
      expect(report.totalOperations).toBe(2);
      expect(report.averageDuration).toBe(150);
    });
  });
});

describe('withPerformanceMonitoring', () => {
  beforeEach(() => {
    // Mock console.log和console.error
    console.log = vi.fn();
    console.error = vi.fn();
    // 设置为开发环境以启用监控
    process.env.NODE_ENV = 'development';
    (performanceMonitor as any).isEnabled = true;
    // 清理指标
    (performanceMonitor as any).metrics.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该正确包装函数并监控其性能', async () => {
    // Mock performance.now 来确保有时间差
    const nowMock = vi.spyOn(performance, 'now');
    let callCount = 0;
    nowMock.mockImplementation(() => {
      callCount++;
      return callCount * 100; // 返回递增的时间戳
    });
    
    const testFn = vi.fn().mockResolvedValue('test-result');
    const monitoredFn = withPerformanceMonitoring('parse', testFn);
    
    // 清除之前的调用记录
    (console.log as any).mockClear();
    (console.error as any).mockClear();
    
    const result = await monitoredFn('arg1', 'arg2');
    
    expect(result).toBe('test-result');
    expect(testFn).toHaveBeenCalledWith('arg1', 'arg2');
    
    // 验证是否调用了console.error（这会在endSubOperation中发生）
    expect(console.error).not.toHaveBeenCalled();
    
    // 恢复mock
    nowMock.mockRestore();
  });

  it('应该正确处理同步函数', async () => {
    const syncFn = vi.fn().mockReturnValue('sync-result');
    const monitoredFn = withPerformanceMonitoring('insert', syncFn);
    
    const result = await monitoredFn('sync-arg');
    
    expect(result).toBe('sync-result');
    expect(syncFn).toHaveBeenCalledWith('sync-arg');
  });

  it('应该正确处理函数抛出的错误', async () => {
    const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));
    const monitoredFn = withPerformanceMonitoring('upload', errorFn);
    
    await expect(monitoredFn('error-arg')).rejects.toThrow('Test error');
    expect(errorFn).toHaveBeenCalledWith('error-arg');
    
    // 验证是否记录了错误日志
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('❌ upload 操作失败:'),
      expect.any(Error)
    );
  });
});

describe('generateOperationId', () => {
  it('应该生成唯一的操作ID', () => {
    const id1 = generateOperationId();
    const id2 = generateOperationId();
    
    expect(id1).toMatch(/^paste-\d+-[a-z0-9]+$/);
    expect(id2).toMatch(/^paste-\d+-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });
});