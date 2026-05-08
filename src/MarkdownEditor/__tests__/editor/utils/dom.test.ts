import {
  getOffsetLeft,
  getOffsetTop,
  slugify,
} from '@ant-design/agentic-ui/MarkdownEditor/editor/utils/dom';
import { describe, expect, it } from 'vitest';

describe('DOM Utils', () => {
  describe('getOffsetTop', () => {
    it('应该计算元素相对于目标元素的偏移顶部距离', () => {
      // 创建模拟DOM结构
      const target = document.createElement('div');
      const parent = document.createElement('div');
      const child = document.createElement('div');

      parent.appendChild(child);
      target.appendChild(parent);
      document.body.appendChild(target);

      // 模拟offsetTop和offsetParent
      Object.defineProperty(child, 'offsetTop', { value: 100, writable: true });
      Object.defineProperty(parent, 'offsetTop', { value: 50, writable: true });
      Object.defineProperty(child, 'offsetParent', {
        value: parent,
        writable: true,
      });
      Object.defineProperty(parent, 'offsetParent', {
        value: target,
        writable: true,
      });

      const result = getOffsetTop(child, target);
      expect(result).toBe(150);

      // 清理
      document.body.removeChild(target);
    });

    it('应该使用document.body作为默认目标', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      Object.defineProperty(element, 'offsetTop', {
        value: 200,
        writable: true,
      });
      Object.defineProperty(element, 'offsetParent', {
        value: document.body,
        writable: true,
      });

      const result = getOffsetTop(element);
      expect(result).toBe(200);

      // 清理
      document.body.removeChild(element);
    });

    it('应该处理元素不在目标容器中的情况', () => {
      const target = document.createElement('div');
      const element = document.createElement('div');
      document.body.appendChild(target);
      document.body.appendChild(element);

      Object.defineProperty(element, 'offsetTop', {
        value: 100,
        writable: true,
      });
      Object.defineProperty(element, 'offsetParent', {
        value: document.body,
        writable: true,
      });

      const result = getOffsetTop(element, target);
      expect(result).toBe(0);

      // 清理
      document.body.removeChild(target);
      document.body.removeChild(element);
    });
  });

  describe('getOffsetLeft', () => {
    it('应该计算元素相对于目标元素的偏移左侧距离', () => {
      // 创建模拟DOM结构
      const target = document.createElement('div');
      const parent = document.createElement('div');
      const child = document.createElement('div');

      parent.appendChild(child);
      target.appendChild(parent);
      document.body.appendChild(target);

      // 模拟offsetLeft和offsetParent
      Object.defineProperty(child, 'offsetLeft', {
        value: 100,
        writable: true,
      });
      Object.defineProperty(parent, 'offsetLeft', {
        value: 50,
        writable: true,
      });
      Object.defineProperty(child, 'offsetParent', {
        value: parent,
        writable: true,
      });
      Object.defineProperty(parent, 'offsetParent', {
        value: target,
        writable: true,
      });

      const result = getOffsetLeft(child, target);
      expect(result).toBe(150);

      // 清理
      document.body.removeChild(target);
    });

    it('应该使用document.body作为默认目标', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      Object.defineProperty(element, 'offsetLeft', {
        value: 200,
        writable: true,
      });
      Object.defineProperty(element, 'offsetParent', {
        value: document.body,
        writable: true,
      });

      const result = getOffsetLeft(element);
      expect(result).toBe(200);

      // 清理
      document.body.removeChild(element);
    });

    it('应该处理元素不在目标容器中的情况', () => {
      const target = document.createElement('div');
      const element = document.createElement('div');
      document.body.appendChild(target);
      document.body.appendChild(element);

      Object.defineProperty(element, 'offsetLeft', {
        value: 100,
        writable: true,
      });
      Object.defineProperty(element, 'offsetParent', {
        value: document.body,
        writable: true,
      });

      const result = getOffsetLeft(element, target);
      expect(result).toBe(0);

      // 清理
      document.body.removeChild(target);
      document.body.removeChild(element);
    });
  });

  describe('slugify', () => {
    it('应该将字符串转换为slug格式', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test String 123')).toBe('test-string-123');
      expect(slugify('Special@Characters#Test')).toBe(
        'special-characters-test',
      );
    });

    it('应该处理中文字符', () => {
      expect(slugify('你好世界')).toBe('你好世界');
      expect(slugify('Hello 你好 World')).toBe('hello-你好-world');
    });

    it('应该处理空字符串', () => {
      expect(slugify('')).toBe('');
    });

    it('应该处理只包含特殊字符的字符串', () => {
      expect(slugify('!@#$%^&*()')).toBe('');
    });

    it('应该处理连续的空格和特殊字符', () => {
      expect(slugify('Hello    World!!!')).toBe('hello-world');
      expect(slugify('Test---String')).toBe('test-string');
    });

    it('应该处理控制字符', () => {
      expect(slugify('Hello\tWorld\nTest')).toBe('helloworldtest');
    });

    it('应该处理重音字符', () => {
      expect(slugify('Café')).toBe('cafe');
      expect(slugify('naïve')).toBe('naive');
    });

    it('应该处理数字', () => {
      expect(slugify('Test123')).toBe('test123');
      expect(slugify('123Test')).toBe('_123test');
    });

    it('应该处理混合字符', () => {
      expect(slugify('Hello-World_Test.123')).toBe('hello-world-test-123');
    });
  });
});
