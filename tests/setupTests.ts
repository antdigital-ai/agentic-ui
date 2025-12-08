import '@testing-library/jest-dom';
import { MotionGlobalConfig } from 'framer-motion';
import { JSDOM } from 'jsdom';
import MockDate from 'mockdate';
import React from 'react';
import { vi } from 'vitest';
import { setupLottieMock } from './_mocks_/lottieMock';
import { setupGlobalMocks } from './_mocks_/sharedMocks';
MotionGlobalConfig.skipAnimations = true;

// Mock ace-builds 模块，避免在测试环境中加载真实的 ace 库
vi.mock('ace-builds/src-noconflict/ext-modelist', () => ({
  default: {
    modes: [
      { name: 'javascript', extensions: ['js', 'jsx'] },
      { name: 'typescript', extensions: ['ts', 'tsx'] },
      { name: 'python', extensions: ['py'] },
      { name: 'java', extensions: ['java'] },
      { name: 'html', extensions: ['html'] },
      { name: 'css', extensions: ['css'] },
      { name: 'json', extensions: ['json'] },
    ],
    getModeForPath: vi.fn(() => ({ name: 'text' })),
  },
}));

// 设置全局 ace 对象，用于 ace-builds 模块
// ace-builds 的某些模块（如 ext-modelist）期望 ace 全局变量存在
(globalThis as any).ace = {
  define: vi.fn((name: string, deps: string[], factory: any) => {
    // Mock ace.define 函数，正确处理模块导出
    if (typeof factory === 'function') {
      const module = { exports: {} };
      const require = (dep: string) => {
        // Mock require 函数
        return {};
      };
      try {
        factory(require, module.exports, module);
      } catch (e) {
        // 忽略错误，仅用于避免测试环境报错
      }
      return module.exports;
    }
    return {};
  }),
  require: vi.fn((module: string) => {
    // Mock ace.require 函数
    return {};
  }),
};

// Mock @galacean/effects 模块，避免在测试环境中访问 DOM 属性导致错误
vi.mock('@galacean/effects', () => {
  const mockPlayer = vi.fn().mockImplementation(() => ({
    loadScene: vi.fn(),
    dispose: vi.fn(),
    resume: vi.fn(),
    pause: vi.fn(),
    resize: vi.fn(),
  }));

  return {
    Player: mockPlayer,
    Scene: {
      LoadType: {},
    },
  };
});

// 设置全局mocks
setupGlobalMocks();
setupLottieMock();

globalThis.React = React;

//@ts-ignore
globalThis.window = new JSDOM().window;

globalThis.document = window.document;

MockDate.set('2023-12-21 10:30:56');
// 设置正确的文档类型，修复KaTeX警告
Object.defineProperty(document, 'doctype', {
  value: {
    name: 'html',
    publicId: '',
    systemId: '',
  },
});

// 修复canvas相关的问题

global.window.scrollTo = vi.fn();
Element.prototype.scrollTo = vi.fn();

Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'node.js',
  },
});

// Mock requestIdleCallback 和 cancelIdleCallback
// 在测试环境中立即同步执行，避免异步操作导致测试无法结束
let idleCallbackIdCounter = 0;
const idleCallbacks = new Map<number, () => void>();

vi.stubGlobal(
  'requestIdleCallback',
  vi.fn((cb: () => void, options?: { timeout?: number }) => {
    const id = ++idleCallbackIdCounter;
    idleCallbacks.set(id, cb);
    // 在测试环境中立即同步执行，避免异步操作阻塞测试
    // 使用 process.nextTick 确保在当前执行栈完成后执行
    if (typeof process !== 'undefined' && process.nextTick) {
      process.nextTick(() => {
        if (idleCallbacks.has(id)) {
          try {
            cb();
          } catch (e) {
            // 忽略执行错误
          }
          idleCallbacks.delete(id);
        }
      });
    } else {
      // 降级到同步执行
      try {
        cb();
      } catch (e) {
        // 忽略执行错误
      }
      idleCallbacks.delete(id);
    }
    return id;
  }),
);

vi.stubGlobal(
  'cancelIdleCallback',
  vi.fn((id: number) => {
    idleCallbacks.delete(id);
  }),
);

// 重写 console.error 来过滤 act() 警告和其他测试警告
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    (typeof args[0] === 'string' &&
      (args[0].includes('was not wrapped in act') ||
        args[0].includes('inside a test was not wrapped in act') ||
        args[0].includes('Warning: An update to') ||
        args[0].includes('Function components cannot be given refs') ||
        args[0].includes('Invalid DOM property') ||
        args[0].includes('React does not recognize') ||
        args[0].includes("KaTeX doesn't work in quirks mode"))) ||
    args?.[0]?.includes?.('act(...)')
  ) {
    return;
  }
  originalError.call(console, args[0]);
};

// 重写 console.error 来过滤 act() 警告
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    (typeof args[0] === 'string' &&
      (args[0].includes('was not wrapped in act') ||
        args[0].includes('inside a test was not wrapped in act') ||
        args[0].includes('Warning: An update to'))) ||
    args?.[0]?.includes?.('act(...)')
  ) {
    return;
  }
  originalWarn.call(console, args[0]);
};

Object.defineProperty(globalThis, 'cancelAnimationFrame', {
  value: vi.fn(() => null),
  writable: true,
});

// Mock requestAnimationFrame to prevent unhandled errors in tests
Object.defineProperty(globalThis, 'requestAnimationFrame', {
  value: vi.fn((callback) => {
    return setTimeout(callback, 16); // ~60fps
  }),
  writable: true,
});

Object.defineProperty(globalThis.window, 'requestAnimationFrame', {
  value: vi.fn((callback) => {
    return setTimeout(callback, 16); // ~60fps
  }),
  writable: true,
});

Object.defineProperty(globalThis.window, 'cancelAnimationFrame', {
  value: vi.fn((id) => {
    clearTimeout(id);
  }),
  writable: true,
});

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock ResizeObserver
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// ref: https://github.com/ant-design/ant-design/issues/18774
const matchMediaMock = vi.fn(() => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  configurable: true,
  value: matchMediaMock,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: matchMediaMock,
});

vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    key(index: number) {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis.window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis.window, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});
