import * as utils from '@ant-design/agentic-ui/MarkdownEditor/editor/utils';
import { describe, expect, it, vi } from 'vitest';

describe('MarkdownEditor Utils', () => {
  describe('sizeUnit', () => {
    it('应该正确转换字节大小为合适的单位', () => {
      expect(utils.sizeUnit(512)).toBe('512 B');
      expect(utils.sizeUnit(1024)).toBe('1024 B'); // 1024 不大于 1024，所以还是 B
      expect(utils.sizeUnit(1025)).toBe('1.00 KB'); // 1025 大于 1024，转换为 KB
      expect(utils.sizeUnit(1024 * 1024)).toBe('1024.00 KB'); // 1048576 不大于 1048576，所以是 KB
      expect(utils.sizeUnit(1024 * 1024 + 1)).toBe('1.00 MB'); // 1048577 大于 1048576，转换为 MB
      expect(utils.sizeUnit(1024 * 1024 * 1024)).toBe('1024.00 MB'); // 1073741824 不大于 1073741824，所以是 MB
      expect(utils.sizeUnit(1024 * 1024 * 1024 + 1)).toBe('1.00 GB'); // 1073741825 大于 1073741824，转换为 GB
      expect(utils.sizeUnit(1024 * 1024 * 1024 * 2.5)).toBe('2.50 GB');
    });
  });

  describe('copy', () => {
    it('应该正确深拷贝对象', () => {
      const original = { a: 1, b: { c: 2 } };
      const copied = utils.copy(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied.b).not.toBe(original.b);
    });

    it('应该正确深拷贝数组', () => {
      const original = [1, 2, [3, 4]];
      const copied = utils.copy(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied[2]).not.toBe(original[2]);
    });
  });

  describe('isMod', () => {
    it('应该检测 Ctrl 键', () => {
      const event = { ctrlKey: true, metaKey: false } as any;
      expect(utils.isMod(event)).toBe(true);
    });

    it('应该检测 Cmd 键 (Mac)', () => {
      const event = { ctrlKey: false, metaKey: true } as any;
      expect(utils.isMod(event)).toBe(true);
    });

    it('应该在没有修饰键时返回 false', () => {
      const event = { ctrlKey: false, metaKey: false } as any;
      expect(utils.isMod(event)).toBe(false);
    });
  });

  describe('base64ToArrayBuffer', () => {
    it('应该正确将 base64 字符串转换为 ArrayBuffer', () => {
      // Base64 编码的 "hello"
      const base64 = btoa('hello');
      const arrayBuffer = utils.base64ToArrayBuffer(base64);

      expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
      expect(arrayBuffer.byteLength).toBe(5);

      // 验证内容
      const uint8Array = new Uint8Array(arrayBuffer);
      const decoded = String.fromCharCode(...uint8Array);
      expect(decoded).toBe('hello');
    });
  });

  describe('getImageData', () => {
    it('应该返回以 data:image 开头的图像数据', () => {
      const imageData =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      expect(utils.getImageData(imageData)).toBe(imageData);
    });

    it('应该返回普通文件路径', () => {
      const filePath = '/images/test.png';
      expect(utils.getImageData(filePath)).toBe(filePath);
    });

    it('应该处理空字符串', () => {
      expect(utils.getImageData()).toBe('');
    });
  });

  describe('toArrayBuffer', () => {
    it('应该正确将 Buffer 转换为 ArrayBuffer', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);
      const arrayBuffer = utils.toArrayBuffer(buffer);

      expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
      expect(arrayBuffer.byteLength).toBe(5);

      // 验证内容
      const result = new Uint8Array(arrayBuffer);
      expect(Array.from(result)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('download', () => {
    it('应该创建下载链接并触发点击事件', () => {
      // 模拟 DOM API
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');
      const mockRevokeObjectURL = vi.fn();

      // @ts-ignore
      global.URL.createObjectURL = mockCreateObjectURL;
      // @ts-ignore
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const mockLink = document.createElement('a');
      mockLink.setAttribute = vi.fn();
      mockLink.addEventListener = vi.fn();
      mockLink.click = vi.fn();
      Object.defineProperty(mockLink, 'style', {
        value: { visibility: '' },
        writable: true,
      });

      mockCreateElement.mockImplementation((tagName) => {
        if (tagName === 'a') return mockLink as any;
        return document.createElement(tagName);
      });

      const mockAppendChild = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(vi.fn());
      const mockRemoveChild = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(vi.fn());

      // 测试 Blob 数据下载
      const blob = new Blob(['test'], { type: 'text/plain' });
      utils.download(blob, 'test.txt');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        'test.txt',
      );
      expect(mockLink.style.visibility).toBe('hidden');
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);

      // 清理模拟
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });

    it('应该处理 Uint8Array 数据', () => {
      // 模拟 DOM API
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');

      // @ts-ignore
      global.URL.createObjectURL = mockCreateObjectURL;

      const mockLink = document.createElement('a');
      mockLink.setAttribute = vi.fn();
      mockLink.addEventListener = vi.fn();
      mockLink.click = vi.fn();
      Object.defineProperty(mockLink, 'style', {
        value: { visibility: '' },
        writable: true,
      });

      mockCreateElement.mockImplementation((tagName) => {
        if (tagName === 'a') return mockLink as any;
        return document.createElement(tagName);
      });

      const mockAppendChild = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(vi.fn());
      const mockRemoveChild = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(vi.fn());

      // 测试 Uint8Array 数据下载
      const uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
      utils.download(uint8Array, 'test.bin');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        'test.bin',
      );
      expect(mockLink.click).toHaveBeenCalled();

      // 清理模拟
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });
  });

  describe('encodeHtml', () => {
    it('应该正确编码 HTML 特殊字符', () => {
      expect(utils.encodeHtml('<div>Hello & "World" ></div>')).toBe(
        '&#60;div&#62;Hello &#38; &#34;World&#34; &#62;&#60;&#47;div&#62;',
      );

      expect(utils.encodeHtml("It's a 'test'")).toBe(
        'It&#39;s a &#39;test&#39;',
      );
    });

    it('应该处理不包含特殊字符的字符串', () => {
      expect(utils.encodeHtml('Hello World')).toBe('Hello World');
    });

    it('应该处理空字符串', () => {
      expect(utils.encodeHtml('')).toBe('');
    });
  });

  describe('debounce', () => {
    it('应该防抖执行函数', () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = utils.debounce(mockFn, 100);

      // 连续调用多次
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // 函数不应该立即执行
      expect(mockFn).not.toHaveBeenCalled();

      // 快进时间
      vi.advanceTimersByTime(100);

      // 函数应该只执行一次
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('应该支持 flush 方法立即执行', () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = utils.debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      // 立即执行
      debouncedFn.flush();
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('应该支持 cancel 方法取消执行', () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = utils.debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      // 取消执行
      debouncedFn.cancel();

      // 快进时间
      vi.advanceTimersByTime(100);

      // 函数不应该被执行
      expect(mockFn).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('throttle', () => {
    it('应该节流执行函数', () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const throttledFn = utils.throttle(mockFn, 100);

      // 第一次调用不会立即执行，因为初始时间差为0
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(0);

      // 快进时间超过节流时间
      vi.advanceTimersByTime(100);
      throttledFn();

      // 函数应该执行一次
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 再次快进时间
      vi.advanceTimersByTime(100);
      throttledFn();

      // 函数应该再次执行
      expect(mockFn).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it('应该支持 flush 方法立即执行', () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const throttledFn = utils.throttle(mockFn, 100);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(0);

      // 立即执行
      throttledFn.flush();
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('应该支持 cancel 方法重置节流', () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const throttledFn = utils.throttle(mockFn, 100);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(0);

      // 快进时间超过节流时间
      vi.advanceTimersByTime(100);
      throttledFn();

      // 函数应该执行一次
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 重置节流
      throttledFn.cancel();

      // 快进时间超过节流时间
      vi.advanceTimersByTime(100);

      // 再次调用
      throttledFn();

      // 函数应该再次执行
      expect(mockFn).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe('debugLog', () => {
    it('应该在 window.debug 为 true 时输出日志', () => {
      const originalLog = console.log;
      console.log = vi.fn();

      // 模拟 window.debug 为 true
      (window as any).debug = true;

      utils.debugLog('test', 'message');

      expect(console.log).toHaveBeenCalledWith('debug「test」--->', 'message');

      console.log = originalLog;
      delete (window as any).debug;
    });

    it('应该在 window.debug 为 false 时不输出日志', () => {
      const originalLog = console.log;
      console.log = vi.fn();

      // window.debug 默认为 undefined
      utils.debugLog('test', 'message');

      expect(console.log).not.toHaveBeenCalled();

      console.log = originalLog;
    });

    it('应该在服务端环境中不输出日志', () => {
      // 模拟服务端环境
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const originalLog = console.log;
      console.log = vi.fn();

      utils.debugLog('test', 'message');

      expect(console.log).not.toHaveBeenCalled();

      // 恢复原始值
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });
      console.log = originalLog;
    });
  });

  describe('MARKDOWN_EDITOR_EVENTS', () => {
    it('应该包含正确的事件常量', () => {
      expect(utils.MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE).toBe(
        'md-editor-selectionchange',
      );
      expect(utils.MARKDOWN_EDITOR_EVENTS.FOCUS).toBe('md-editor-focus');
      expect(utils.MARKDOWN_EDITOR_EVENTS.BLUR).toBe('md-editor-blur');
    });
  });
});
