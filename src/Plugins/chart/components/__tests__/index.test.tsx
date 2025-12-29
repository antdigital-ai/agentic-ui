import { downloadChart } from '@ant-design/agentic-ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();

// Mock document
Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true,
});

describe('Chart Components Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Date.getTime() to return a fixed timestamp
    vi.spyOn(Date.prototype, 'getTime').mockReturnValue(1234567890);

    // Mock link element
    const mockLink = {
      download: '',
      href: '',
      click: mockClick,
    };

    mockCreateElement.mockReturnValue(mockLink);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadChart', () => {
    it('应该成功下载图表', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      const result = downloadChart(mockChartInstance, 'test-chart', 'png', 1);

      expect(result).toBe(true);
      expect(mockChartInstance.toBase64Image).toHaveBeenCalledWith(
        'image/png',
        1,
      );
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it('应该使用默认参数', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      const result = downloadChart(mockChartInstance);

      expect(result).toBe(true);
      expect(mockChartInstance.toBase64Image).toHaveBeenCalledWith(
        'image/png',
        1,
      );
    });

    it('应该支持 JPEG 格式', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/jpeg;base64,mock-data'),
      };

      const result = downloadChart(
        mockChartInstance,
        'test-chart',
        'jpeg',
        0.8,
      );

      expect(result).toBe(true);
      expect(mockChartInstance.toBase64Image).toHaveBeenCalledWith(
        'image/jpeg',
        0.8,
      );
    });

    it('应该生成带时间戳的文件名', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      // Mock Date.now to return a fixed timestamp
      const mockTimestamp = 1234567890;
      vi.spyOn(Date.prototype, 'getTime').mockReturnValue(mockTimestamp);

      downloadChart(mockChartInstance, 'test-chart', 'png', 1);

      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toBe(`test-chart-${mockTimestamp}.png`);

      vi.restoreAllMocks();
    });

    it('应该处理图表实例为空的情况', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = downloadChart(null);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Chart instance is not available',
      );

      consoleSpy.mockRestore();
    });

    it('应该处理图表实例为 undefined 的情况', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = downloadChart(undefined);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Chart instance is not available',
      );

      consoleSpy.mockRestore();
    });

    it('应该处理 toBase64Image 抛出错误的情况', () => {
      const mockChartInstance = {
        toBase64Image: vi.fn().mockImplementation(() => {
          throw new Error('Chart rendering failed');
        }),
      };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = downloadChart(mockChartInstance);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error downloading chart:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('应该处理 toBase64Image 返回无效数据的情况', () => {
      const mockChartInstance = {
        toBase64Image: vi.fn().mockReturnValue(''),
      };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = downloadChart(mockChartInstance);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error downloading chart:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('应该记录成功下载的日志', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      downloadChart(mockChartInstance, 'test-chart', 'png', 1);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Chart downloaded successfully as PNG',
      );

      consoleSpy.mockRestore();
    });

    it('应该记录 JPEG 格式的成功下载日志', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/jpeg;base64,mock-data'),
      };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      downloadChart(mockChartInstance, 'test-chart', 'jpeg', 1);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Chart downloaded successfully as JPEG',
      );

      consoleSpy.mockRestore();
    });

    it('应该处理 DOM 操作失败的情况', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      // Mock appendChild to throw an error
      mockAppendChild.mockImplementation(() => {
        throw new Error('DOM operation failed');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = downloadChart(mockChartInstance);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error downloading chart:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('应该处理不同的质量参数', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      downloadChart(mockChartInstance, 'test-chart', 'png', 0.5);

      expect(mockChartInstance.toBase64Image).toHaveBeenCalledWith(
        'image/png',
        0.5,
      );
    });

    it('应该处理质量参数为 0 的情况', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      downloadChart(mockChartInstance, 'test-chart', 'png', 0);

      expect(mockChartInstance.toBase64Image).toHaveBeenCalledWith(
        'image/png',
        0,
      );
    });

    it('应该处理质量参数大于 1 的情况', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      downloadChart(mockChartInstance, 'test-chart', 'png', 1.5);

      expect(mockChartInstance.toBase64Image).toHaveBeenCalledWith(
        'image/png',
        1.5,
      );
    });

    it('应该处理空文件名的情况', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      downloadChart(mockChartInstance, '', 'png', 1);

      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toMatch(/^-1234567890\.png$/);
    });

    it('应该处理特殊字符的文件名', () => {
      const mockChartInstance = {
        toBase64Image: vi
          .fn()
          .mockReturnValue('data:image/png;base64,mock-data'),
      };

      downloadChart(mockChartInstance, 'test/chart:name', 'png', 1);

      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.download).toMatch(
        /^test\/chart:name-1234567890\.png$/,
      );
    });
  });

  // describe('导出测试', () => {
  //   it('应该正确导出所有组件和类型', () => {
  //     // 测试模块导出
  //     const components = require('..');

  //     expect(components).toHaveProperty('ChartToolBar');
  //     expect(components).toHaveProperty('ChartFilter');
  //     expect(components).toHaveProperty('downloadChart');
  //     expect(typeof components.downloadChart).toBe('function');
  //   });
  // });
});
