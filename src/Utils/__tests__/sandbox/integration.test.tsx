/**
 * 沙箱系统集成测试
 *
 * 测试完整的沙箱系统集成，包括多个组件的协同工作。
 */

import { describe, expect, it, vi } from 'vitest';
import {
  createConfiguredSandbox,
  quickExecute,
} from '../../@ant-design/agentic-ui/Utils/proxySandbox';

describe('沙箱系统集成测试', () => {
  describe('预配置沙箱测试', () => {
    it('应该创建基础沙箱', () => {
      const sandbox = createConfiguredSandbox('basic');

      expect(sandbox).toBeDefined();
      expect(sandbox.getConfig().allowConsole).toBe(true);

      sandbox.destroy();
    });

    it('应该创建安全沙箱', () => {
      const sandbox = createConfiguredSandbox('secure');

      expect(sandbox).toBeDefined();
      expect(sandbox.getConfig().allowConsole).toBe(false);
      expect(sandbox.getConfig().timeout).toBe(2000);

      sandbox.destroy();
    });

    it('应该创建受限沙箱', () => {
      const sandbox = createConfiguredSandbox('restricted');

      expect(sandbox).toBeDefined();
      expect(sandbox.getConfig().allowConsole).toBe(false);
      expect(sandbox.getConfig().timeout).toBe(1000);
      expect(sandbox.getConfig().maxMemoryUsage).toBe(1024 * 1024);

      sandbox.destroy();
    });
  });

  describe('边界和错误情况测试', () => {
    it('应该处理空代码', async () => {
      const result = await quickExecute('');
      expect(result).toBeUndefined();
    });

    it('应该处理只有注释的代码', async () => {
      const result = await quickExecute('// just a comment');
      expect(result).toBeUndefined();
    });
  });

  describe('安全的 window 访问集成测试', () => {
    it('应该在集成环境中提供安全的 window 访问', async () => {
      // 测试基本的 window 访问
      const windowTypeResult = await quickExecute('return typeof window');
      expect(windowTypeResult).toBe('object');

      // 测试敏感信息被限制
      const sensitiveDataResult = await quickExecute(`
        return JSON.stringify({
          cookie: window.cookie,
          localStorageLength: window.localStorage.length,
          locationHref: window.location.href,
          navigatorUA: window.navigator.userAgent
        })
      `);

      const parsedResult = JSON.parse(sensitiveDataResult);
      expect(parsedResult.cookie).toBe('');
      expect(parsedResult.localStorageLength).toBe(0);
      expect(parsedResult.locationHref).toBe('about:blank');
      expect(parsedResult.navigatorUA).toBe('Sandbox/1.0');

      // 测试安全功能可用
      const safeFunctionsResult = await quickExecute(`
        return JSON.stringify({
          mathPI: window.Math.PI,
          arrayLength: new window.Array(1, 2, 3).length,
          innerWidth: window.innerWidth
        })
      `);

      const safeParsedResult = JSON.parse(safeFunctionsResult);
      expect(safeParsedResult.mathPI).toBe(Math.PI);
      expect(safeParsedResult.arrayLength).toBe(3);
      expect(safeParsedResult.innerWidth).toBe(1024);

      // 测试安全的 document 访问
      const documentResult = await quickExecute(`
        return JSON.stringify({
          documentType: typeof document,
          documentTitle: document.title,
          documentURL: document.URL,
          documentCookie: document.cookie,
          windowDocumentSame: window.document === document,
          getElementByIdType: typeof document.getElementById,
          createElementType: typeof document.createElement
        })
      `);

      const documentParsedResult = JSON.parse(documentResult);
      expect(documentParsedResult.documentType).toBe('object');
      expect(documentParsedResult.documentTitle).toBe('Sandbox Document');
      expect(documentParsedResult.documentURL).toBe('about:blank');
      expect(documentParsedResult.documentCookie).toBe('');
      expect(documentParsedResult.windowDocumentSame).toBe(true);
      expect(documentParsedResult.getElementByIdType).toBe('function');
      expect(documentParsedResult.createElementType).toBe('function');
    });

    it('应该支持注入 shadowRoot 等自定义参数', async () => {
      // 创建模拟的 shadowRoot 对象
      const mockShadowRoot = {
        innerHTML: '',
        appendChild: vi.fn(),
        querySelector: vi.fn(() => null),
        querySelectorAll: vi.fn(() => []),
      };

      // 测试注入 shadowRoot 参数
      const shadowRootResult = await quickExecute(
        `
        return JSON.stringify({
          shadowRootType: typeof shadowRoot,
          hasAppendChild: typeof shadowRoot.appendChild,
          hasQuerySelector: typeof shadowRoot.querySelector,
          customValue: injectedValue
        })
      `,
        undefined,
        {
          shadowRoot: mockShadowRoot,
          injectedValue: 'test-injection',
        },
      );

      const shadowParsedResult = JSON.parse(shadowRootResult);
      expect(shadowParsedResult.shadowRootType).toBe('object');
      expect(shadowParsedResult.hasAppendChild).toBe('function');
      expect(shadowParsedResult.hasQuerySelector).toBe('function');
      expect(shadowParsedResult.customValue).toBe('test-injection');

      // 测试 shadowRoot 操作
      const operationResult = await quickExecute(
        `
        const div = document.createElement('div');
        div.innerHTML = '<span>Test content</span>';
        shadowRoot.appendChild(div);
        
        const found = shadowRoot.querySelector('span');
        
        return {
          operationCompleted: true,
          queryResult: found
        }
      `,
        undefined,
        {
          shadowRoot: mockShadowRoot,
        },
      );

      expect(operationResult.operationCompleted).toBe(true);
      expect(mockShadowRoot.appendChild).toHaveBeenCalled();
      expect(mockShadowRoot.querySelector).toHaveBeenCalledWith('span');
    });
  });
});
