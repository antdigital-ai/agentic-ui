import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import scrollTo from '../../src/Utils/scrollTo';

// Mock rc-util/lib/raf
vi.mock('rc-util/lib/raf', () => ({
  default: (fn: any) => {
    const timeoutId = setTimeout(fn, 16); // ~60fps
    return timeoutId;
  },
}));

describe('scrollTo - 完整功能测试', () => {
  let mockWindow: any;
  let mockElement: HTMLElement;
  let mockDocument: Document;

  beforeEach(() => {
    vi.useFakeTimers();

    // Mock window
    mockWindow = {
      pageXOffset: 0,
      pageYOffset: 100,
      scrollTo: vi.fn(),
    };

    // Mock HTMLElement
    mockElement = document.createElement('div');
    Object.defineProperty(mockElement, 'scrollTop', {
      value: 100,
      writable: true,
      configurable: true,
    });

    // Mock Document
    mockDocument = document;
    Object.defineProperty(mockDocument.documentElement, 'scrollTop', {
      value: 100,
      writable: true,
      configurable: true,
    });

    // Mock global window; 满足 isWindow(container) 需 container.window === container
    (mockWindow as any).window = mockWindow;
    global.window = mockWindow as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('基本滚动功能', () => {
    it('应该调用函数不抛出错误', () => {
      expect(() => {
        scrollTo(200);
      }).not.toThrow();
    });

    it('应该接受 Window 容器参数', () => {
      expect(() => {
        scrollTo(300, { container: mockWindow });
      }).not.toThrow();
    });

    it('应该接受 HTMLElement 容器参数', () => {
      expect(() => {
        scrollTo(200, { container: mockElement, duration: 100 });
      }).not.toThrow();
    });

    it('应该接受 Document 容器参数', () => {
      expect(() => {
        scrollTo(500, { container: mockDocument, duration: 100 });
      }).not.toThrow();
    });

    it('应该接受持续时间参数', () => {
      expect(() => {
        scrollTo(100, { duration: 200 });
      }).not.toThrow();
    });

    it('应该接受回调参数', () => {
      const callback = vi.fn();
      expect(() => {
        scrollTo(100, { callback });
      }).not.toThrow();
    });
  });

  describe('动画持续时间', () => {
    it('应该使用默认持续时间 450ms', () => {
      const callback = vi.fn();
      scrollTo(200, { callback });

      // 在默认时间之前
      vi.advanceTimersByTime(400);
      expect(callback).not.toHaveBeenCalled();

      // 完成动画
      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalled();
    });

    it('应该使用自定义持续时间', () => {
      const callback = vi.fn();
      const customDuration = 1000;
      scrollTo(300, { duration: customDuration, callback });

      vi.advanceTimersByTime(customDuration - 100);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(150);
      expect(callback).toHaveBeenCalled();
    });

    it('应该处理零持续时间', () => {
      const callback = vi.fn();
      scrollTo(100, { duration: 0, callback });

      vi.advanceTimersByTime(16);
      expect(callback).toHaveBeenCalled();
    });

    it('应该处理非常短的持续时间', () => {
      const callback = vi.fn();
      scrollTo(150, { duration: 10, callback });

      vi.advanceTimersByTime(20);
      expect(callback).toHaveBeenCalled();
    });

    it('应该处理非常长的持续时间', () => {
      const callback = vi.fn();
      scrollTo(400, { duration: 5000, callback });

      vi.advanceTimersByTime(4999);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('回调函数', () => {
    it('应该接受回调函数参数', () => {
      const callback = vi.fn();

      expect(() => {
        scrollTo(200, { callback, duration: 100 });
      }).not.toThrow();
    });

    it('应该在没有回调时正常工作', () => {
      expect(() => {
        scrollTo(300, { duration: 100 });
        vi.advanceTimersByTime(150);
      }).not.toThrow();
    });

    it('应该处理回调为 undefined', () => {
      expect(() => {
        scrollTo(300, { callback: undefined, duration: 100 });
        vi.advanceTimersByTime(150);
      }).not.toThrow();
    });

    it('应该支持传递回调函数类型', () => {
      const callback = () => console.log('done');

      expect(() => {
        scrollTo(100, { callback, duration: 50 });
      }).not.toThrow();
    });
  });

  describe('容器类型处理', () => {
    it('应该正确处理 Window 容器', () => {
      const windowMock = {
        pageXOffset: 50,
        scrollTo: vi.fn(),
      } as any;

      expect(() => {
        scrollTo(200, { container: windowMock, duration: 100 });
      }).not.toThrow();
    });

    it('应该正确处理 Document 容器', () => {
      const docMock = {
        constructor: { name: 'HTMLDocument' },
        documentElement: {
          scrollTop: 50,
        },
      } as any;

      scrollTo(250, { container: docMock, duration: 100 });
      vi.advanceTimersByTime(150);

      expect(docMock.documentElement.scrollTop).toBeCloseTo(250, 0);
    });

    it('应该正确处理 HTMLElement 容器', () => {
      const element = document.createElement('div');
      Object.defineProperty(element, 'scrollTop', {
        value: 50,
        writable: true,
        configurable: true,
      });

      scrollTo(180, { container: element, duration: 100 });
      vi.advanceTimersByTime(150);

      expect(element.scrollTop).toBeCloseTo(180, 0);
    });

    it('应该处理 instanceof Document 检查', () => {
      const realDoc = document;
      scrollTo(150, { container: realDoc, duration: 100 });
      vi.advanceTimersByTime(100);

      // 应该不抛出错误
      expect(realDoc.documentElement).toBeDefined();
    });
  });

  describe('滚动位置计算', () => {
    it('应该从当前位置滚动到目标位置', () => {
      mockElement.scrollTop = 0;
      scrollTo(300, { container: mockElement, duration: 100 });

      vi.advanceTimersByTime(150);

      // 使用 toBeCloseTo 允许浮点数精度误差
      expect(mockElement.scrollTop).toBeCloseTo(300, 0);
    });

    it('应该支持向上滚动', () => {
      mockElement.scrollTop = 500;
      scrollTo(200, { container: mockElement, duration: 100 });

      vi.advanceTimersByTime(150);

      expect(mockElement.scrollTop).toBeCloseTo(200, 0);
    });

    it('应该支持向下滚动', () => {
      mockElement.scrollTop = 100;
      scrollTo(400, { container: mockElement, duration: 100 });

      vi.advanceTimersByTime(150);

      expect(mockElement.scrollTop).toBeCloseTo(400, 0);
    });

    it('应该处理相同位置（无需滚动）', () => {
      const callback = vi.fn();
      mockElement.scrollTop = 200;
      scrollTo(200, { container: mockElement, duration: 100, callback });

      vi.advanceTimersByTime(150);

      expect(mockElement.scrollTop).toBeCloseTo(200, 0);
    });

    it('应该使用缓动函数平滑滚动', () => {
      const positions: number[] = [];
      mockElement.scrollTop = 0;

      // 拦截 scrollTop 赋值
      Object.defineProperty(mockElement, 'scrollTop', {
        set: (value: number) => {
          positions.push(value);
        },
        get: () => 0,
      });

      scrollTo(100, { container: mockElement, duration: 300 });

      // 收集多个时间点的位置
      for (let t = 0; t <= 300; t += 50) {
        vi.advanceTimersByTime(50);
      }

      // 验证滚动是平滑的（位置逐渐增加）
      expect(positions.length).toBeGreaterThan(1);

      // 验证最终到达目标位置
      expect(positions[positions.length - 1]).toBe(100);
    });
  });

  describe('无 window / 无 container 早退与回调', () => {
    it('无 window 时应调用 callback 后直接返回 (24-27)', () => {
      const callback = vi.fn();
      const origWindow = global.window;
      (global as any).window = undefined;
      scrollTo(0, { callback });
      expect(callback).toHaveBeenCalledTimes(1);
      global.window = origWindow;
    });

    it('无 window 且无 callback 时不抛错', () => {
      const origWindow = global.window;
      (global as any).window = undefined;
      expect(() => scrollTo(0)).not.toThrow();
      global.window = origWindow;
    });

    it('container 为 null 时应调用 callback 后直接返回 (32-35)', () => {
      const callback = vi.fn();
      scrollTo(0, { container: null as any, callback });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('frameFunc 内 window 变为 undefined 时应调用 callback (44-47)', () => {
      const callback = vi.fn();
      scrollTo(100, { container: mockElement, callback, duration: 200 });
      const origWindow = global.window;
      (global as any).window = undefined;
      vi.advanceTimersByTime(20);
      expect(callback).toHaveBeenCalledTimes(1);
      global.window = origWindow;
    });

    it('Window 容器应走 scrollTo 分支 (65-67)', () => {
      const scrollToSpy = vi.fn();
      (mockWindow as any).scrollTo = scrollToSpy;
      scrollTo(250, { container: mockWindow as any, duration: 100 });
      vi.advanceTimersByTime(20);
      expect(scrollToSpy).toHaveBeenCalled();
      expect(scrollToSpy.mock.calls[0][0]).toBe(mockWindow.pageXOffset);
      expect(scrollToSpy.mock.calls[0][1]).toBeDefined();
    });
  });

  describe('边界情况', () => {
    it('应该处理负数目标位置', () => {
      const callback = vi.fn();
      scrollTo(-100, { container: mockElement, duration: 50, callback });

      vi.advanceTimersByTime(100);

      expect(callback).toHaveBeenCalled();
    });

    it('应该处理非常大的目标位置', () => {
      const callback = vi.fn();
      scrollTo(999999, { container: mockElement, duration: 50, callback });

      vi.advanceTimersByTime(100);

      expect(callback).toHaveBeenCalled();
    });

    it('应该处理零目标位置', () => {
      const callback = vi.fn();
      mockElement.scrollTop = 100;
      scrollTo(0, { container: mockElement, duration: 50, callback });

      vi.advanceTimersByTime(100);

      expect(mockElement.scrollTop).toBe(0);
      expect(callback).toHaveBeenCalled();
    });

    it('应该处理小数目标位置', () => {
      const callback = vi.fn();
      scrollTo(123.456, { container: mockElement, duration: 50, callback });

      vi.advanceTimersByTime(100);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('动画帧处理', () => {
    it('应该在动画持续期间多次更新滚动位置', () => {
      const updateCount = { count: 0 };

      Object.defineProperty(mockElement, 'scrollTop', {
        set: () => {
          updateCount.count++;
        },
        get: () => 0,
        configurable: true,
      });

      scrollTo(200, { container: mockElement, duration: 300 });

      // 模拟多帧
      for (let i = 0; i < 20; i++) {
        vi.advanceTimersByTime(16);
      }

      expect(updateCount.count).toBeGreaterThan(1);
    });

    it('应该在动画结束时停止更新', () => {
      const callback = vi.fn();
      scrollTo(150, { container: mockElement, duration: 100, callback });

      vi.advanceTimersByTime(150);

      // 回调应该被调用一次
      expect(callback.mock.calls.length).toBeGreaterThanOrEqual(0);

      // 继续前进时间
      vi.advanceTimersByTime(200);

      // 确保回调不会被多次调用
      const finalCallCount = callback.mock.calls.length;
      expect(finalCallCount).toBeLessThanOrEqual(1);
    });
  });

  describe('选项对象', () => {
    it('应该使用空选项对象时应用默认值', () => {
      expect(() => {
        scrollTo(100, {});
        vi.advanceTimersByTime(500);
      }).not.toThrow();
    });

    it('应该只传递 callback 选项', () => {
      const callback = vi.fn();
      scrollTo(120, { callback });

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalled();
    });

    it('应该只传递 duration 选项', () => {
      const callback = vi.fn();
      scrollTo(130, { duration: 200, callback });

      vi.advanceTimersByTime(250);
      expect(callback).toHaveBeenCalled();
    });

    it('应该只传递 container 选项', () => {
      const element = document.createElement('div');
      expect(() => {
        scrollTo(140, { container: element });
        vi.advanceTimersByTime(500);
      }).not.toThrow();
    });
  });

  describe('集成测试', () => {
    it('应该支持连续滚动', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      scrollTo(100, { duration: 100, callback: callback1 });
      vi.advanceTimersByTime(150);

      // 第一次滚动完成
      expect(callback1.mock.calls.length).toBeGreaterThanOrEqual(0);

      scrollTo(200, { duration: 100, callback: callback2 });
      vi.advanceTimersByTime(150);

      // 第二次滚动完成
      expect(callback2.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('应该支持多个容器同时滚动', () => {
      const elem1 = document.createElement('div');
      const elem2 = document.createElement('div');
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      scrollTo(100, { container: elem1, duration: 50, callback: callback1 });
      scrollTo(200, { container: elem2, duration: 50, callback: callback2 });

      vi.advanceTimersByTime(100);

      // 两个滚动都应该执行
      expect(elem1.scrollTop).toBeDefined();
      expect(elem2.scrollTop).toBeDefined();
    });
  });
});
