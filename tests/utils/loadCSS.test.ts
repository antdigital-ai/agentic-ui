import { describe, expect, it, vi, beforeEach } from 'vitest';

// 由于 loadedCSS 是模块私有的，我们需要重新导入模块来进行测试
let loadCSSModule: typeof import('../../src/Utils/loadCSS');
let loadCSS: typeof import('../../src/Utils/loadCSS').loadCSS;
let preloadCSS: typeof import('../../src/Utils/loadCSS').preloadCSS;

describe('loadCSS.ts', () => {
  // 保存原始的 window 对象
  const originalWindow = global.window;

  beforeEach(async () => {
    // 重新加载模块以重置内部状态
    vi.resetModules();
    loadCSSModule = await import('../../src/Utils/loadCSS');
    loadCSS = loadCSSModule.loadCSS;
    preloadCSS = loadCSSModule.preloadCSS;
    
    // 清除所有模拟
    vi.clearAllMocks();
  });

  describe('loadCSS 函数', () => {
    it('应该在非浏览器环境中直接返回', async () => {
      // 模拟非浏览器环境
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const result = await loadCSS('test.css');
      expect(result).toBeUndefined();

      // 恢复原始 window 对象
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });
    }, 10000);

    it('应该处理函数形式的动态 import', async () => {
      // 模拟浏览器环境
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });

      const mockImport = vi.fn().mockResolvedValue({});
      const result = await loadCSS(mockImport);
      
      expect(mockImport).toHaveBeenCalled();
      expect(result).toBeUndefined();
    }, 10000);

    it('应该处理已加载的函数形式 CSS', async () => {
      // 模拟浏览器环境
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });

      const mockImport = vi.fn().mockResolvedValue({});
      // 第一次加载
      await loadCSS(mockImport);
      // 第二次加载同样的函数
      const result = await loadCSS(mockImport);
      
      // 函数应该只被调用一次
      expect(mockImport).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    }, 10000);

    it('应该处理函数形式的动态 import 失败情况', async () => {
      // 模拟浏览器环境
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });

      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = await loadCSS(mockImport);
      
      expect(mockImport).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load CSS:', expect.any(Error));
      expect(result).toBeUndefined();
      
      // 清理
      consoleSpy.mockRestore();
    }, 10000);

    it('应该处理已加载的字符串路径形式 CSS', async () => {
      // 模拟浏览器环境
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });

      // 模拟 document 对象
      const mockCreateElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'link') {
          return {
            rel: '',
            type: '',
            href: '',
            onload: null,
            onerror: null,
            setAttribute: function(key: string, value: string) {
              (this as any)[key] = value;
            }
          };
        }
        return {};
      });
      
      const mockAppendChild = vi.fn().mockImplementation((element) => {
        // 模拟触发 onload 事件
        setTimeout(() => {
          if (element.onload) {
            element.onload();
          }
        }, 0);
      });

      Object.defineProperty(global, 'document', {
        value: {
          querySelector: vi.fn().mockReturnValue(null),
          createElement: mockCreateElement,
          head: {
            appendChild: mockAppendChild,
          },
        },
        writable: true,
      });

      const cssPath = 'https://example.com/test.css';
      // 第一次加载
      await loadCSS(cssPath);
      // 第二次加载同样的 CSS (应该直接返回，因为已加载)
      const result = await loadCSS(cssPath);
      
      expect(result).toBeUndefined();
    }, 10000);

    it('应该处理已存在的 CSS 链接', async () => {
      // 模拟浏览器环境
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });

      // 模拟 document 对象
      const mockQuerySelector = vi.fn().mockReturnValue({
        href: 'https://example.com/test.css',
      });

      Object.defineProperty(global, 'document', {
        value: {
          querySelector: mockQuerySelector,
          head: {
            appendChild: vi.fn(),
          },
        },
        writable: true,
      });

      const cssPath = 'https://example.com/test.css';
      const result = await loadCSS(cssPath);
      
      expect(mockQuerySelector).toHaveBeenCalledWith(`link[href*="${cssPath}"]`);
      expect(result).toBeUndefined();
    }, 10000);
  });

  describe('preloadCSS 函数', () => {
    it('应该在非浏览器环境中直接返回', () => {
      // 模拟非浏览器环境
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const result = preloadCSS('test.css');
      expect(result).toBeUndefined();

      // 恢复原始 window 对象
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });
    }, 10000);

    it('应该处理已加载的 CSS 预加载', async () => {
      // 模拟浏览器环境
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });

      const cssPath = 'https://example.com/test.css';
      
      // 先加载 CSS
      await loadCSS(cssPath);
      
      // 预加载已加载的 CSS
      const result = preloadCSS(cssPath);
      expect(result).toBeUndefined();
    }, 10000);
  });
});