import { describe, expect, it } from 'vitest';
import getScroll, {
  getScrollRailHeight,
  isWindow,
} from '../@ant-design/agentic-ui/Utils/getScroll';

describe('getScroll 工具函数 - 简化测试', () => {
  describe('isWindow', () => {
    it('应该识别 window 对象', () => {
      expect(isWindow(window)).toBe(true);
    });

    it('应该拒绝 null', () => {
      expect(isWindow(null)).toBe(false);
    });

    it('应该拒绝 undefined', () => {
      expect(isWindow(undefined)).toBe(false);
    });

    it('应该拒绝普通对象', () => {
      expect(isWindow({})).toBe(false);
    });
  });

  describe('getScroll', () => {
    it('应该返回数字', () => {
      const scroll = getScroll(window);
      expect(typeof scroll).toBe('number');
    });

    it('应该处理 null 值', () => {
      const scroll = getScroll(null);
      expect(scroll).toBe(0);
    });

    it('应该处理 HTMLElement', () => {
      const div = document.createElement('div');
      const scroll = getScroll(div);
      expect(typeof scroll).toBe('number');
    });

    it('应该处理 Document', () => {
      const scroll = getScroll(document);
      expect(typeof scroll).toBe('number');
    });
  });

  describe('getScrollRailHeight', () => {
    it('应该返回数字', () => {
      const height = getScrollRailHeight(window);
      expect(typeof height).toBe('number');
    });

    it('应该处理 null 值', () => {
      const height = getScrollRailHeight(null);
      expect(height).toBe(0);
    });

    it('应该处理 HTMLElement', () => {
      const div = document.createElement('div');
      const height = getScrollRailHeight(div);
      expect(typeof height).toBe('number');
    });

    it('应该处理 Document', () => {
      const height = getScrollRailHeight(document);
      expect(typeof height).toBe('number');
    });
  });

  describe('getScroll - 边界情况测试', () => {
    it('应该处理带有 ownerDocument 的元素', () => {
      const div = document.createElement('div');
      Object.defineProperty(div, 'scrollTop', {
        value: 'not-a-number',
        configurable: true,
      });
      const scroll = getScroll(div);
      expect(typeof scroll).toBe('number');
    });

    it('应该处理模拟对象（松散模式）', () => {
      const mockTarget = { scrollTop: 100 } as any;
      const scroll = getScroll(mockTarget);
      expect(scroll).toBe(100);
    });

    it('应该处理带有 documentElement.scrollTop 的对象', () => {
      const mockTarget = {
        scrollTop: 'not-a-number',
        ownerDocument: {
          documentElement: {
            scrollTop: 200,
          },
        },
      } as any;
      const scroll = getScroll(mockTarget);
      expect(scroll).toBe(200);
    });

    it('应该处理 Window 对象的 pageYOffset', () => {
      const originalPageYOffset = window.pageYOffset;
      // 测试 pageYOffset 的存在性
      const scroll = getScroll(window);
      expect(typeof scroll).toBe('number');
      expect(scroll).toBeGreaterThanOrEqual(0);
    });

    it('应该处理 Document 对象的 scrollTop', () => {
      const scroll = getScroll(document);
      expect(typeof scroll).toBe('number');
      expect(scroll).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getScrollRailHeight - 边界情况测试', () => {
    it('应该计算 Window 的滚动轨道高度', () => {
      const height = getScrollRailHeight(window);
      expect(typeof height).toBe('number');
      expect(height).toBeGreaterThanOrEqual(0);
    });

    it('应该计算 Document 的滚动轨道高度', () => {
      const height = getScrollRailHeight(document);
      expect(typeof height).toBe('number');
      expect(height).toBeGreaterThanOrEqual(0);
    });

    it('应该计算 HTMLElement 的滚动轨道高度', () => {
      const div = document.createElement('div');
      // 在 jsdom 环境中模拟滚动属性
      Object.defineProperty(div, 'scrollHeight', {
        value: 1000,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(div, 'offsetHeight', {
        value: 500,
        writable: true,
        configurable: true,
      });
      const height = getScrollRailHeight(div);
      // jsdom 中 offsetHeight 默认为 0，所以结果是 scrollHeight - 0
      expect(typeof height).toBe('number');
      expect(height).toBeGreaterThanOrEqual(0);
    });

    it('应该处理未知类型返回 0', () => {
      const height = getScrollRailHeight({} as any);
      expect(height).toBe(0);
    });
  });

  describe('isWindow - 完整测试', () => {
    it('应该识别具有 window 属性的对象', () => {
      const mockWindow = { window: null as any };
      mockWindow.window = mockWindow;
      expect(isWindow(mockWindow)).toBe(true);
    });

    it('应该拒绝数字', () => {
      expect(isWindow(123)).toBe(false);
    });

    it('应该拒绝字符串', () => {
      expect(isWindow('window')).toBe(false);
    });

    it('应该拒绝数组', () => {
      expect(isWindow([])).toBe(false);
    });
  });
});
