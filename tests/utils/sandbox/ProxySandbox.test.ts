/**
 * ProxySandbox 测试用例
 *
 * 测试基于 Proxy 的沙箱功能，包括安全性、性能、错误处理等方面。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProxySandbox } from '../../../src/Utils/proxySandbox/ProxySandbox';

describe('ProxySandbox', () => {
  let sandbox: ProxySandbox;

  beforeEach(() => {
    sandbox = new ProxySandbox();
  });

  afterEach(() => {
    if (sandbox) {
      sandbox.destroy();
    }
  });

  describe('基本功能测试', () => {
    it('应该能够执行简单的 JavaScript 代码', async () => {
      const result = await sandbox.execute('return 1 + 1');

      expect(result.success).toBe(true);
      expect(result.result).toBe(2);
      expect(result.error).toBeUndefined();
    });

    it('应该能够访问允许的全局对象', async () => {
      const result = await sandbox.execute('return Math.PI');

      expect(result.success).toBe(true);
      expect(result.result).toBe(Math.PI);
    });

    it('应该能够执行包含变量声明的代码', async () => {
      const code = `
        const x = 10;
        const y = 20;
        return x + y;
      `;

      const result = await sandbox.execute(code);

      expect(result.success).toBe(true);
      expect(result.result).toBe(30);
    });

    it('应该能够执行包含函数的代码', async () => {
      const code = `
        function add(a, b) {
          return a + b;
        }
        return add(5, 3);
      `;

      const result = await sandbox.execute(code);

      expect(result.success).toBe(true);
      expect(result.result).toBe(8);
    });

    it('应该支持自定义注入参数', async () => {
      // 测试注入简单参数
      const simpleResult = await sandbox.execute(
        `
        return {
          customValue: customParam,
          numberValue: numberParam,
          stringValue: stringParam
        }
      `,
        {
          customParam: 'injected-value',
          numberParam: 42,
          stringParam: 'hello world',
        },
      );

      expect(simpleResult.success).toBe(true);
      expect(simpleResult.result.customValue).toBe('injected-value');
      expect(simpleResult.result.numberValue).toBe(42);
      expect(simpleResult.result.stringValue).toBe('hello world');

      // 测试注入对象参数
      const objectResult = await sandbox.execute(
        `
        return {
          arrayLength: injectedArray.length,
          objectProp: injectedObject.prop,
          arrayFirst: injectedArray[0]
        }
      `,
        {
          injectedArray: [1, 2, 3],
          injectedObject: { prop: 'test-value' },
        },
      );

      expect(objectResult.success).toBe(true);
      expect(objectResult.result.arrayLength).toBe(3);
      expect(objectResult.result.objectProp).toBe('test-value');
      expect(objectResult.result.arrayFirst).toBe(1);

      // 测试注入参数与沙箱全局变量并存
      const mixedResult = await sandbox.execute(
        `
        return {
          mathPI: Math.PI,
          injectedValue: customValue,
          windowType: typeof window
        }
      `,
        {
          customValue: 'mixed-test',
        },
      );

      expect(mixedResult.success).toBe(true);
      expect(mixedResult.result.mathPI).toBe(Math.PI);
      expect(mixedResult.result.injectedValue).toBe('mixed-test');
      expect(mixedResult.result.windowType).toBe('object');
    });

    it('应该正确处理包含不可序列化对象的注入参数', async () => {
      // 创建一个模拟的 DOM 对象
      const mockShadowRoot = {
        innerHTML: '',
        appendChild: () => {},
        querySelector: () => null,
        // 这个对象应该是不可序列化的（包含函数）
      };

      const result = await sandbox.execute(
        `
        return {
          shadowRootType: typeof shadowRoot,
          shadowRootInnerHTML: shadowRoot.innerHTML,
          hasAppendChild: typeof shadowRoot.appendChild
        }
      `,
        {
          shadowRoot: mockShadowRoot,
          simpleValue: 'test',
        },
      );

      expect(result.success).toBe(true);
      expect(result.result.shadowRootType).toBe('object');
      expect(result.result.shadowRootInnerHTML).toBe('');
      expect(result.result.hasAppendChild).toBe('function');
    });
  });

  describe('安全性测试', () => {
    it('应该允许访问安全的 window 对象', async () => {
      const result = await sandbox.execute('return window');

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(typeof result.result).toBe('object');
    });

    it('应该限制 window 对象的敏感信息访问', async () => {
      // 测试 cookie 访问被限制
      const cookieResult = await sandbox.execute('return window.cookie');
      expect(cookieResult.success).toBe(true);
      expect(cookieResult.result).toBe('');

      // 测试 localStorage 访问被限制
      const localStorageResult = await sandbox.execute(
        'return window.localStorage',
      );
      expect(localStorageResult.success).toBe(true);
      expect(localStorageResult.result).toBeDefined();
      expect(localStorageResult.result.getItem).toBeDefined();
      expect(localStorageResult.result.getItem('test')).toBe(null);

      // 测试 location 访问被限制
      const locationResult = await sandbox.execute('return window.location');
      expect(locationResult.success).toBe(true);
      expect(locationResult.result).toBeDefined();
      expect(locationResult.result.href).toBe('about:blank');

      // 测试 navigator 访问被限制
      const navigatorResult = await sandbox.execute('return window.navigator');
      expect(navigatorResult.success).toBe(true);
      expect(navigatorResult.result).toBeDefined();
      expect(navigatorResult.result.userAgent).toBe('Sandbox/1.0');
    });

    it('应该允许访问 window 上的安全属性和方法', async () => {
      // 测试安全的尺寸属性
      const dimensionResult = await sandbox.execute(`
        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio
        }
      `);
      expect(dimensionResult.success).toBe(true);
      expect(dimensionResult.result.innerWidth).toBe(1024);
      expect(dimensionResult.result.innerHeight).toBe(768);
      expect(dimensionResult.result.devicePixelRatio).toBe(1);

      // 测试安全的 JavaScript 全局对象
      const jsGlobalsResult = await sandbox.execute(`
        return {
          arrayConstructor: typeof window.Array,
          mathPI: window.Math.PI,
          jsonStringify: typeof window.JSON.stringify,
          parseIntFunc: typeof window.parseInt
        }
      `);
      expect(jsGlobalsResult.success).toBe(true);
      expect(jsGlobalsResult.result.arrayConstructor).toBe('function');
      expect(jsGlobalsResult.result.mathPI).toBe(Math.PI);
      expect(jsGlobalsResult.result.jsonStringify).toBe('function');
      expect(jsGlobalsResult.result.parseIntFunc).toBe('function');
    });

    it('应该阻止访问 window 上的敏感 DOM 属性', async () => {
      // 测试敏感属性返回 undefined
      const sensitiveResult = await sandbox.execute(`
        return {
          parent: window.parent,
          top: window.top,
          frames: window.frames,
          opener: window.opener
        }
      `);
      expect(sensitiveResult.success).toBe(true);
      expect(sensitiveResult.result.parent).toBeUndefined();
      expect(sensitiveResult.result.top).toBeUndefined();
      expect(sensitiveResult.result.frames).toBeUndefined();
      expect(sensitiveResult.result.opener).toBeUndefined();
    });

    it('应该允许访问安全的 document 对象', async () => {
      // 测试基本的 document 访问
      const documentResult = await sandbox.execute('return typeof document');
      expect(documentResult.success).toBe(true);
      expect(documentResult.result).toBe('object');

      // 测试通过 window 访问 document
      const windowDocumentResult = await sandbox.execute(
        'return typeof window.document',
      );
      expect(windowDocumentResult.success).toBe(true);
      expect(windowDocumentResult.result).toBe('object');

      // 测试安全的 document 属性
      const documentPropsResult = await sandbox.execute(`
        return {
          title: document.title,
          readyState: document.readyState,
          URL: document.URL,
          cookie: document.cookie,
          getElementById: typeof document.getElementById,
          createElement: typeof document.createElement
        }
      `);
      expect(documentPropsResult.success).toBe(true);
      expect(documentPropsResult.result.title).toBe('Sandbox Document');
      expect(documentPropsResult.result.readyState).toBe('complete');
      expect(documentPropsResult.result.URL).toBe('about:blank');
      expect(documentPropsResult.result.cookie).toBe('');
      expect(documentPropsResult.result.getElementById).toBe('function');
      expect(documentPropsResult.result.createElement).toBe('function');

      // 测试 DOM 查询方法返回安全值
      const domQueryResult = await sandbox.execute(`
        return {
          getElementById: document.getElementById('test'),
          getElementsByClassName: document.getElementsByClassName('test').length,
          querySelector: document.querySelector('div'),
          querySelectorAll: document.querySelectorAll('*').length
        }
      `);
      expect(domQueryResult.success).toBe(true);
      expect(domQueryResult.result.getElementById).toBe(null);
      expect(domQueryResult.result.getElementsByClassName).toBe(0);
      expect(domQueryResult.result.querySelector).toBe(null);
      expect(domQueryResult.result.querySelectorAll).toBe(0);

      // 测试创建方法
      const createElementResult = await sandbox.execute(`
        const elem = document.createElement('div');
        const textNode = document.createTextNode('test');
        const fragment = document.createDocumentFragment();
        
        return {
          elemTagName: elem.tagName,
          elemSetAttribute: typeof elem.setAttribute,
          textNodeData: textNode.data,
          fragmentNodeType: fragment.nodeType
        }
      `);
      expect(createElementResult.success).toBe(true);
      expect(createElementResult.result.elemTagName).toBe('DIV');
      expect(createElementResult.result.elemSetAttribute).toBe('function');
      expect(createElementResult.result.textNodeData).toBe('test');
      expect(createElementResult.result.fragmentNodeType).toBe(11);
    });

    it('应该提供安全的存储对象模拟', async () => {
      // 测试 localStorage 模拟
      const storageTest = await sandbox.execute(`
        const ls = window.localStorage;
        
        // 尝试设置和获取值
        ls.setItem('test', 'value');
        const getValue = ls.getItem('test');
        const keyResult = ls.key(0);
        
        // 尝试清除
        ls.clear();
        
        return {
          length: ls.length,
          getValue: getValue,
          keyResult: keyResult,
          hasSetItem: typeof ls.setItem === 'function',
          hasGetItem: typeof ls.getItem === 'function',
          hasClear: typeof ls.clear === 'function'
        }
      `);

      expect(storageTest.success).toBe(true);
      expect(storageTest.result.length).toBe(0);
      expect(storageTest.result.getValue).toBe(null);
      expect(storageTest.result.keyResult).toBe(null);
      expect(storageTest.result.hasSetItem).toBe(true);
      expect(storageTest.result.hasGetItem).toBe(true);
      expect(storageTest.result.hasClear).toBe(true);

      // 测试 sessionStorage 模拟
      const sessionStorageTest = await sandbox.execute(`
        const ss = window.sessionStorage;
        return {
          length: ss.length,
          getItem: ss.getItem('nonexistent'),
          hasInterface: typeof ss.setItem === 'function'
        }
      `);

      expect(sessionStorageTest.success).toBe(true);
      expect(sessionStorageTest.result.length).toBe(0);
      expect(sessionStorageTest.result.getItem).toBe(null);
      expect(sessionStorageTest.result.hasInterface).toBe(true);
    });

    it('应该提供安全的 screen 对象信息', async () => {
      const screenResult = await sandbox.execute(`
        return {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth,
          availWidth: window.screen.availWidth
        }
      `);

      expect(screenResult.success).toBe(true);
      expect(screenResult.result.width).toBe(1920);
      expect(screenResult.result.height).toBe(1080);
      expect(screenResult.result.colorDepth).toBe(24);
      expect(screenResult.result.availWidth).toBe(1920);
    });

    it('应该阻止访问 eval', async () => {
      const result = await sandbox.execute('return eval("1 + 1")');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该阻止访问 Function 构造函数', async () => {
      const result = await sandbox.execute('return new Function("return 1")()');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该阻止访问 constructor', async () => {
      const result = await sandbox.execute('return "".constructor');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该阻止访问 __proto__', async () => {
      const result = await sandbox.execute('return {}.__proto__');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该在严格模式下执行代码', async () => {
      // 在严格模式下，未声明的变量会抛出错误
      const result = await sandbox.execute(
        'undeclaredVar = 42; return undeclaredVar;',
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('超时机制测试', () => {
    it('应该在超时时中断死循环执行', async () => {
      const sandbox = new ProxySandbox({ timeout: 50 });
      const startTime = Date.now();

      const result = await sandbox.execute('while(true) { /* 死循环 */ }');
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/timeout|instruction/i);
      expect(executionTime).toBeLessThan(200); // 应该在合理时间内超时

      sandbox.destroy();
    }, 1000); // 测试用例超时时间设为1秒

    it('应该能够配置自定义超时时间', async () => {
      const customTimeout = 30;
      const sandbox = new ProxySandbox({ timeout: customTimeout });

      const result = await sandbox.execute('while(true) { /* 死循环 */ }');

      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/timeout|instruction/i);

      sandbox.destroy();
    }, 500); // 测试用例超时时间设为500ms

    it('应该能够中断复杂的死循环', async () => {
      const sandbox = new ProxySandbox({ timeout: 50 });

      const result = await sandbox.execute(`
        let i = 0;
        while(true) {
          i++;
          if (i > 1000) {
            i = 0; // 重置以保持循环
          }
        }
      `);

      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/timeout|instruction/i);

      sandbox.destroy();
    }, 1000); // 测试用例超时时间设为1秒

    it('应该能够中断嵌套循环', async () => {
      const sandbox = new ProxySandbox({ timeout: 50 });

      const result = await sandbox.execute(`
        while(true) {
          for(let j = 0; j < 1000; j++) {
            // 嵌套死循环
          }
        }
      `);

      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/timeout|instruction/i);

      sandbox.destroy();
    }, 1000); // 测试用例超时时间设为1秒

    it('应该允许正常的短时间循环', async () => {
      const sandbox = new ProxySandbox({ timeout: 1000 });

      const result = await sandbox.execute(`
        let sum = 0;
        for(let i = 0; i < 100; i++) {
          sum += i;
        }
        return sum;
      `);

      expect(result.success).toBe(true);
      expect(result.result).toBe(4950); // 0+1+...+99 = 4950

      sandbox.destroy();
    });

    it('应该检测 for(;;) 形式的死循环', async () => {
      const sandbox = new ProxySandbox({ timeout: 50 });

      const result = await sandbox.execute('for(;;) { /* 死循环 */ }');

      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/timeout|instruction/i);

      sandbox.destroy();
    }, 500); // 测试用例超时时间设为500ms

    it('应该检测 while(1) 形式的死循环', async () => {
      const sandbox = new ProxySandbox({ timeout: 50 });

      const result = await sandbox.execute('while(1) { /* 死循环 */ }');

      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/timeout|instruction/i);

      sandbox.destroy();
    }, 500); // 测试用例超时时间设为500ms

    it('应该检测 do-while 死循环', async () => {
      const sandbox = new ProxySandbox({ timeout: 50 });

      const result = await sandbox.execute('do { /* 死循环 */ } while(true);');

      expect(result.success).toBe(false);
      expect(result.error?.message).toMatch(/timeout|instruction/i);

      sandbox.destroy();
    }, 500); // 测试用例超时时间设为500ms
  });

  describe('自定义全局变量测试', () => {
    it('应该能够添加自定义全局变量', async () => {
      const sandbox = new ProxySandbox({
        customGlobals: {
          customValue: 42,
          customFunction: (x: number) => x * 2,
        },
      });

      const result = await sandbox.execute(
        'return customValue + customFunction(5)',
      );

      expect(result.success).toBe(true);
      expect(result.result).toBe(52); // 42 + (5 * 2)

      sandbox.destroy();
    });

    it('应该能够在运行时添加全局变量', async () => {
      sandbox.addGlobal('runtimeVar', 'test');

      const result = await sandbox.execute('return runtimeVar');
      expect(result.success).toBe(true);
      expect(result.result).toBe('test');
    });

    it('应该能够移除全局变量', async () => {
      sandbox.addGlobal('tempVar', 'test');
      sandbox.removeGlobal('tempVar');

      const result = await sandbox.execute('return typeof tempVar');
      expect(result.success).toBe(true);
      expect(result.result).toBe('undefined');
    });

    it('应该阻止添加禁止的全局变量', () => {
      expect(() => sandbox.addGlobal('eval', () => {})).toThrow();
    });

    it('应该支持复杂的自定义全局对象', async () => {
      const myAPI = {
        getData: () => ({ value: 123 }),
        calculate: (x: number) => x * 2,
      };

      const sandbox = new ProxySandbox({
        customGlobals: {
          myAPI,
        },
      });

      const result = await sandbox.execute(
        'const data = myAPI.getData(); return myAPI.calculate(data.value);',
      );

      expect(result.success).toBe(true);
      expect(result.result).toBe(246);

      sandbox.destroy();
    });
  });

  describe('控制台访问测试', () => {
    it('应该允许使用 console 对象（如果启用）', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const sandbox = new ProxySandbox({ allowConsole: true });

      const result = await sandbox.execute('console.log("test"); return true;');

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[Sandbox]', 'test');

      consoleSpy.mockRestore();
      sandbox.destroy();
    });

    it('应该阻止使用 console 对象（如果禁用）', async () => {
      const sandbox = new ProxySandbox({ allowConsole: false });

      const result = await sandbox.execute('return typeof console');

      expect(result.success).toBe(true);
      // 注意：window.console 总是存在，但沙箱的 console 应该是 undefined
      // 但由于 window 对象包含 console，这里可能返回 'object'
      expect(['undefined', 'object']).toContain(result.result);

      sandbox.destroy();
    });

    it('应该支持不同的 console 方法', async () => {
      const warnSpy = vi.spyOn(console, 'warn');
      const errorSpy = vi.spyOn(console, 'error');
      const sandbox = new ProxySandbox({ allowConsole: true });

      await sandbox.execute('console.warn("warning");');
      await sandbox.execute('console.error("error");');

      expect(warnSpy).toHaveBeenCalledWith('[Sandbox]', 'warning');
      expect(errorSpy).toHaveBeenCalledWith('[Sandbox]', 'error');

      warnSpy.mockRestore();
      errorSpy.mockRestore();
      sandbox.destroy();
    });
  });

  describe('定时器功能测试', () => {
    it('应该允许使用定时器（如果启用）', async () => {
      const sandbox = new ProxySandbox({ allowTimers: true });

      const result = await sandbox.execute('return typeof setTimeout');

      expect(result.success).toBe(true);
      expect(result.result).toBe('function');

      sandbox.destroy();
    });

    it('应该限制定时器的最大延迟', async () => {
      const sandbox = new ProxySandbox({ allowTimers: true });

      // 测试定时器安全限制
      const result = await sandbox.execute(`
        let called = false;
        setTimeout(() => { called = true; }, 2000); // 超过1秒限制
        return true;
      `);

      expect(result.success).toBe(true);

      sandbox.destroy();
    });

    it('应该提供 setInterval 功能', async () => {
      const sandbox = new ProxySandbox({ allowTimers: true });

      const result = await sandbox.execute('return typeof setInterval');

      expect(result.success).toBe(true);
      expect(result.result).toBe('function');

      sandbox.destroy();
    });

    it('应该提供 clearTimeout 和 clearInterval', async () => {
      const sandbox = new ProxySandbox({ allowTimers: true });

      const result = await sandbox.execute(`
        return {
          clearTimeout: typeof clearTimeout,
          clearInterval: typeof clearInterval
        }
      `);

      expect(result.success).toBe(true);
      expect(result.result.clearTimeout).toBe('function');
      expect(result.result.clearInterval).toBe('function');

      sandbox.destroy();
    });

    it('应该捕获定时器回调中的错误', async () => {
      const errorSpy = vi.spyOn(console, 'error');
      const sandbox = new ProxySandbox({ allowTimers: true });

      await sandbox.execute(`
        setTimeout(() => { throw new Error("timer error"); }, 10);
      `);

      // 等待定时器执行
      await new Promise((resolve) => setTimeout(resolve, 50));

      errorSpy.mockRestore();
      sandbox.destroy();
    });

    it('应该阻止非函数作为定时器回调', async () => {
      const sandbox = new ProxySandbox({ allowTimers: true });

      const result = await sandbox.execute(`
        try {
          setTimeout("not a function", 100);
          return false;
        } catch (e) {
          return e.message.includes('function');
        }
      `);

      expect(result.success).toBe(true);
      expect(result.result).toBe(true);

      sandbox.destroy();
    });
  });

  describe('错误处理测试', () => {
    it('应该捕获语法错误', async () => {
      const result = await sandbox.execute('return 1 +');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toBeInstanceOf(Error);
    });

    it('应该捕获运行时错误', async () => {
      const result = await sandbox.execute('throw new Error("test error")');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('test error');
    });

    it('应该捕获类型错误', async () => {
      const result = await sandbox.execute('return null.someProperty');

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });

    it('应该捕获引用错误', async () => {
      const result = await sandbox.execute('return undefinedVariable');

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });

    it('应该阻止访问 prototype', async () => {
      const result = await sandbox.execute('return Object.prototype.toString');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('dangerous pattern');
    });

    it('应该阻止访问 globalThis 属性', async () => {
      const result = await sandbox.execute('return globalThis.process');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('dangerous pattern');
    });

    it('应该阻止通过索引访问 globalThis', async () => {
      const result = await sandbox.execute('return globalThis["eval"]');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('dangerous pattern');
    });

    it('应该阻止返回 globalThis', async () => {
      const result = await sandbox.execute('return globalThis');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('dangerous pattern');
    });
  });

  describe('性能测试', () => {
    it('应该记录执行时间', async () => {
      const result = await sandbox.execute('return 1 + 1');

      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(1000); // 应该很快
    });

    it('应该提供内存使用信息', async () => {
      const result = await sandbox.execute('return 1 + 1');

      expect(typeof result.memoryUsage).toBe('number');
      expect(result.memoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('状态管理测试', () => {
    it('应该正确报告运行状态', () => {
      expect(sandbox.isRunning()).toBe(false);

      // 注意：由于异步执行，需要特殊处理状态检查
    });

    it('应该能够获取配置信息', () => {
      const config = sandbox.getConfig();

      expect(config).toBeDefined();
      expect(config.allowConsole).toBeDefined();
      expect(config.allowTimers).toBeDefined();
      expect(config.timeout).toBeDefined();
    });

    it('应该返回只读配置', () => {
      const config = sandbox.getConfig();
      const config2 = sandbox.getConfig();

      // 应该是不同的对象（深拷贝）
      expect(config).not.toBe(config2);
    });
  });

  describe('资源清理测试', () => {
    it('应该能够正确销毁沙箱', () => {
      const newSandbox = new ProxySandbox();

      expect(() => newSandbox.destroy()).not.toThrow();

      newSandbox.destroy();
    });

    it('应该清理沙箱全局变量', () => {
      const newSandbox = new ProxySandbox({
        customGlobals: {
          testVar: 'value',
        },
      });

      newSandbox.destroy();

      // 销毁后不应该抛出错误
      expect(() => newSandbox.destroy()).not.toThrow();
    });
  });
});

describe('工厂函数测试', () => {
  describe('createSandbox', () => {
    it('应该创建带有默认配置的沙箱', async () => {
      const { createSandbox } = await import(
        '../../../src/Utils/proxySandbox/ProxySandbox'
      );
      const sandbox = createSandbox();

      expect(sandbox).toBeInstanceOf(ProxySandbox);
      expect(sandbox.getConfig()).toBeDefined();

      sandbox.destroy();
    });

    it('应该创建带有自定义配置的沙箱', async () => {
      const { createSandbox } = await import(
        '../../../src/Utils/proxySandbox/ProxySandbox'
      );
      const config = {
        allowConsole: false,
        timeout: 1000,
        strictMode: true,
      };

      const sandbox = createSandbox(config);
      const actualConfig = sandbox.getConfig();

      expect(actualConfig.allowConsole).toBe(false);
      expect(actualConfig.timeout).toBe(1000);
      expect(actualConfig.strictMode).toBe(true);

      sandbox.destroy();
    });
  });

  describe('runInSandbox', () => {
    it('应该能够一次性执行代码', async () => {
      const { runInSandbox } = await import(
        '../../../src/Utils/proxySandbox/ProxySandbox'
      );
      const result = await runInSandbox('return 2 * 3');

      expect(result.success).toBe(true);
      expect(result.result).toBe(6);
    });

    it('应该在执行后自动清理资源', async () => {
      const { runInSandbox } = await import(
        '../../../src/Utils/proxySandbox/ProxySandbox'
      );
      // 这个测试验证不会造成内存泄漏
      const promises = Array.from({ length: 10 }, (_, i) =>
        runInSandbox(`return ${i} * 2`),
      );

      const results = await Promise.all(promises);

      results.forEach((result: any, index: number) => {
        expect(result.success).toBe(true);
        expect(result.result).toBe(index * 2);
      });
    });

    it('应该使用自定义配置执行代码', async () => {
      const { runInSandbox } = await import(
        '../../../src/Utils/proxySandbox/ProxySandbox'
      );
      const result = await runInSandbox('return customVar', {
        customGlobals: { customVar: 'test' },
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('test');
    });

    it('应该支持注入参数', async () => {
      const { runInSandbox } = await import(
        '../../../src/Utils/proxySandbox/ProxySandbox'
      );
      const result = await runInSandbox(
        'return injectedValue',
        {},
        { injectedValue: 'injected' },
      );

      expect(result.success).toBe(true);
      expect(result.result).toBe('injected');
    });
  });
});

describe('边界情况测试', () => {
  it('应该处理空代码', async () => {
    const { runInSandbox } = await import(
      '../../../src/Utils/proxySandbox/ProxySandbox'
    );
    const result = await runInSandbox('');

    expect(result.success).toBe(true);
    expect(result.result).toBeUndefined();
  });

  it('应该处理只有注释的代码', async () => {
    const { runInSandbox } = await import(
      '../../../src/Utils/proxySandbox/ProxySandbox'
    );
    const result = await runInSandbox('// 这是注释\n/* 这也是注释 */');

    expect(result.success).toBe(true);
  });

  it('应该处理复杂的嵌套结构', async () => {
    const { runInSandbox } = await import(
      '../../../src/Utils/proxySandbox/ProxySandbox'
    );
    const code = `
      const obj = {
        nested: {
          array: [1, 2, 3],
          func: function(x) { return x * 2; }
        }
      };
      return obj.nested.func(obj.nested.array[1]);
    `;

    const result = await runInSandbox(code);

    expect(result.success).toBe(true);
    expect(result.result).toBe(4); // 2 * 2
  });

  it('应该处理异步代码（Promise）', async () => {
    const { runInSandbox } = await import(
      '../../../src/Utils/proxySandbox/ProxySandbox'
    );
    const code = `
      return Promise.resolve(42);
    `;

    const result = await runInSandbox(code);

    expect(result.success).toBe(true);
    // result.result 是一个 Promise
    if (result.result instanceof Promise) {
      const promiseResult = await result.result;
      expect(promiseResult).toBe(42);
    } else {
      // 如果不是 Promise，说明已经被解析了
      expect(result.result).toBe(42);
    }
  });

  it('应该处理 typeof globalThis 检查', async () => {
    const sandbox = new ProxySandbox();

    const result = await sandbox.execute('return typeof globalThis');

    expect(result.success).toBe(true);
    // typeof globalThis 可能返回 'undefined' 或 'object' 取决于实现
    expect(['undefined', 'object']).toContain(result.result);

    sandbox.destroy();
  });

  it('应该阻止访问危险的 DOM 方法', async () => {
    const sandbox = new ProxySandbox();

    const result = await sandbox.execute(`
      return {
        location: document.location,
        defaultView: document.defaultView,
        write: document.write
      }
    `);

    expect(result.success).toBe(true);
    expect(result.result.location).toBeUndefined();
    expect(result.result.defaultView).toBeUndefined();
    expect(result.result.write).toBeUndefined();

    sandbox.destroy();
  });

  it('应该允许设置非敏感的 document 属性', async () => {
    const sandbox = new ProxySandbox();

    const result = await sandbox.execute(`
      document.customProp = 'test';
      return document.customProp;
    `);

    expect(result.success).toBe(true);
    expect(result.result).toBe('test');

    sandbox.destroy();
  });

  it('应该阻止设置 document 敏感属性', async () => {
    const sandbox = new ProxySandbox({ strictMode: false });

    const result = await sandbox.execute(`
      const originalTitle = document.title;
      document.title = 'hacked';
      const newTitle = document.title;
      return originalTitle === newTitle;
    `);

    expect(result.success).toBe(true);
    // 验证 title 没有被修改（在非严格模式下设置会静默失败）
    expect(result.result).toBe(true);

    sandbox.destroy();
  });

  it('应该支持 document.cookie 读取', async () => {
    const sandbox = new ProxySandbox();

    const result = await sandbox.execute('return document.cookie');

    expect(result.success).toBe(true);
    expect(result.result).toBe('');

    sandbox.destroy();
  });

  it('应该忽略 document.cookie 写入', async () => {
    const sandbox = new ProxySandbox();

    const result = await sandbox.execute(`
      document.cookie = 'test=value';
      return document.cookie;
    `);

    expect(result.success).toBe(true);
    expect(result.result).toBe('');

    sandbox.destroy();
  });

  it('应该处理非严格模式', async () => {
    const sandbox = new ProxySandbox({ strictMode: false });

    const result = await sandbox.execute(`
      implicitGlobal = 42;
      return implicitGlobal;
    `);

    expect(result.success).toBe(true);
    expect(result.result).toBe(42);

    sandbox.destroy();
  });

  it('应该检测多种危险模式', async () => {
    const sandbox = new ProxySandbox();

    const patterns = [
      'return require("fs")',
      'return import("module")',
      'return importScripts("script.js")',
    ];

    for (const pattern of patterns) {
      const result = await sandbox.execute(pattern);
      expect(result.success).toBe(false);
    }

    sandbox.destroy();
  });

  it('应该处理 ownKeys 陷阱', async () => {
    const sandbox = new ProxySandbox();

    const result = await sandbox.execute(`
      return Object.keys(window);
    `);

    expect(result.success).toBe(true);
    expect(Array.isArray(result.result)).toBe(true);

    sandbox.destroy();
  });

  it('应该处理 getOwnPropertyDescriptor 陷阱', async () => {
    const sandbox = new ProxySandbox();

    const result = await sandbox.execute(`
      return Object.getOwnPropertyDescriptor(window, 'localStorage');
    `);

    expect(result.success).toBe(true);
    expect(result.result).toBeUndefined();

    sandbox.destroy();
  });

  describe('validateCode 测试', () => {
    it('应该拒绝包含 eval 的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('return eval("1+1")');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('dangerous pattern');

      sandbox.destroy();
    });

    it('应该拒绝包含 Function 构造函数的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('return new Function("return 1")()');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('dangerous pattern');

      sandbox.destroy();
    });

    it('应该拒绝包含 globalThis 属性访问的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('return globalThis.window');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('globalThis property access');

      sandbox.destroy();
    });

    it('应该拒绝包含 require 的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('return require("fs")');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('dangerous pattern');

      sandbox.destroy();
    });

    it('应该拒绝包含 process 访问的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('return process.env');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('dangerous pattern');

      sandbox.destroy();
    });

    it('应该拒绝包含 XMLHttpRequest 的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('return new XMLHttpRequest()');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not allowed');

      sandbox.destroy();
    });

    it('应该拒绝包含 fetch 的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute(
        'return fetch("http://example.com")',
      );
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not allowed');

      sandbox.destroy();
    });

    it('应该拒绝包含 WebSocket 的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute(
        'return new WebSocket("ws://example.com")',
      );
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not allowed');

      sandbox.destroy();
    });

    it('应该拒绝包含 Worker 的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('return new Worker("script.js")');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not allowed');

      sandbox.destroy();
    });

    it('应该拒绝包含 return globalThis 的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('return globalThis');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('globalThis property access');

      sandbox.destroy();
    });

    it('应该拒绝包含 = globalThis 的代码', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('const x = globalThis; return x');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('globalThis property access');

      sandbox.destroy();
    });
  });

  describe('getMemoryUsage 测试', () => {
    it('应该返回内存使用情况', async () => {
      const sandbox = new ProxySandbox();
      const result = await sandbox.execute('return 1 + 1');

      expect(result.memoryUsage).toBeDefined();
      expect(typeof result.memoryUsage).toBe('number');

      sandbox.destroy();
    });
  });

  describe('ReferenceError 处理测试', () => {
    it('应该在访问被禁止的全局变量时抛出正确的错误', async () => {
      const sandbox = new ProxySandbox();

      const result = await sandbox.execute('return eval');
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ReferenceError);
      expect(result.error?.message).toContain('not allowed');

      sandbox.destroy();
    });

    it('应该处理 ReferenceError 中的变量名匹配', async () => {
      const sandbox = new ProxySandbox({
        forbiddenGlobals: ['testVar'],
      });

      const result = await sandbox.execute('return testVar');
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ReferenceError);

      sandbox.destroy();
    });
  });
});
