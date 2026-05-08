import '@testing-library/jest-dom/vitest';
import { MotionGlobalConfig } from 'framer-motion';
import MockDate from 'mockdate';
import React from 'react';
import { vi } from 'vitest';
import { setupLottieMock } from './_mocks_/lottieMock';
import { setupGlobalMocks } from './_mocks_/sharedMocks';

// happy-dom 会自动创建完整的 window/document，无需手动覆盖。
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
  const mockPlayer = vi.fn(function MockPlayer(this: unknown) {
    return {
      loadScene: vi.fn(),
      dispose: vi.fn(),
      resume: vi.fn(),
      pause: vi.fn(),
      resize: vi.fn(),
    };
  });

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

MockDate.set('2023-12-21 10:30:56');
// 修复 canvas 相关的问题：BarChart 等组件会调用 canvas.getContext('2d') 测量文本
// 同时 patch window.HTMLCanvasElement，确保 document.createElement('canvas') 使用的构造器被 mock
const installCanvasMock = () => {
  const mockContext = {
    measureText: vi.fn(() => ({ width: 50 })),
    fillText: vi.fn(),
    font: '',
    canvas: null as unknown as HTMLCanvasElement,
  };
  const getContextFn = vi.fn(function (this: HTMLCanvasElement) {
    mockContext.canvas = this;
    return mockContext;
  }) as any;
  if (
    typeof (globalThis as any).window?.HTMLCanvasElement?.prototype !==
    'undefined'
  ) {
    (globalThis as any).window.HTMLCanvasElement.prototype.getContext =
      getContextFn;
  }
  if (typeof (globalThis as any).HTMLCanvasElement?.prototype !== 'undefined') {
    (globalThis as any).HTMLCanvasElement.prototype.getContext = getContextFn;
  }
};
installCanvasMock();

global.window.scrollTo = vi.fn();
Element.prototype.scrollTo = vi.fn();

Object.defineProperty(window, 'open', {
  writable: true,
  configurable: true,
  value: vi.fn(() => null),
});

// happy-dom 的 HTMLAnchorElement.prototype.click 会 dispatch 一个 PointerEvent，
// 并在 anchor 自身的 dispatchEvent override 里调用 window.open(href, ...)，
// 而 detached frame 中的 URL 构造函数无法工作，导致 stderr 抛出 "URL is not a constructor"。
// 测试环境里我们只关心点击事件被触发，不关心导航行为，因此用一个 MouseEvent 模拟点击，
// 跳过 happy-dom 的 navigate 副作用。
if (typeof globalThis.HTMLAnchorElement !== 'undefined') {
  globalThis.HTMLAnchorElement.prototype.click =
    function patchedAnchorClick() {
      const event =
        typeof MouseEvent === 'function'
          ? new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              composed: true,
            })
          : new Event('click', { bubbles: true, cancelable: true });
      // 直接走 Node.prototype.dispatchEvent，避免触发 happy-dom HTMLAnchorElement
      // 覆写的 dispatchEvent 中调用 window.open 的逻辑
      Object.getPrototypeOf(HTMLElement.prototype).dispatchEvent.call(
        this,
        event,
      );
    };
}

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
  vi.fn(function requestIdleCallbackStub(cb: () => void) {
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
  vi.fn(function cancelIdleCallbackStub(id: number) {
    idleCallbacks.delete(id);
  }),
);

/** React 等库常以 `console.error` / `console.warn` 输出 `Warning: ...`，测试输出里默认静默 */
const shouldSuppressLeadingWarning = (...args: unknown[]): boolean => {
  const first = args[0];
  return typeof first === 'string' && first.startsWith('Warning:');
};

// 重写 console.error 来过滤 act() 警告和其他测试警告
const originalError = console.error;
console.error = (...args: any[]) => {
  if (shouldSuppressLeadingWarning(...args)) {
    return;
  }
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
  originalError.apply(console, args);
};

// 重写 console.warn 来过滤 act() 警告
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (shouldSuppressLeadingWarning(...args)) {
    return;
  }
  if (
    (typeof args[0] === 'string' &&
      (args[0].includes('was not wrapped in act') ||
        args[0].includes('inside a test was not wrapped in act') ||
        args[0].includes('Warning: An update to'))) ||
    args?.[0]?.includes?.('act(...)')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

Object.defineProperty(globalThis, 'cancelAnimationFrame', {
  value: vi.fn(() => null),
  writable: true,
});

// Mock requestAnimationFrame to prevent unhandled errors in tests
Object.defineProperty(globalThis, 'requestAnimationFrame', {
  value: vi.fn(function requestAnimationFrameStub(
    callback: FrameRequestCallback,
  ) {
    return setTimeout(callback, 16); // ~60fps
  }),
  writable: true,
});

Object.defineProperty(globalThis.window, 'requestAnimationFrame', {
  value: vi.fn(function windowRequestAnimationFrameStub(
    callback: FrameRequestCallback,
  ) {
    return setTimeout(callback, 16); // ~60fps
  }),
  writable: true,
});

Object.defineProperty(globalThis.window, 'cancelAnimationFrame', {
  value: vi.fn(function cancelAnimationFrameStub(id: number) {
    clearTimeout(id);
  }),
  writable: true,
});

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: vi.fn(function MockIntersectionObserver() {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }),
});

// Mock ResizeObserver
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: vi.fn(function MockResizeObserver() {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }),
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

// 历史包袱说明：
// 此处曾经有一段 mockSelection 把 window.getSelection / document.getSelection
// 全部替换成 noop stub，理由是"Slate 在 happy-dom 下因 selectionchange 死循环
// 导致测试卡死"。经实测验证（2026-05），该诊断完全错误：
//   1) 纯 <Editable /> 在 happy-dom 下 11ms 渲染完成，无任何死循环
//   2) happy-dom 的 selectionchange 事件不会因读/写 selection 重复触发
// 真正的死循环源在 src/MarkdownInputField/Suggestion/index.tsx：
// 解构默认值 `items = []` 每次渲染生成新数组引用，触发 useEffect → setState →
// re-render 的无限循环。该 bug 已被 happy-dom 的快速调度暴露并修复。
// 移除 mockSelection 的好处：editorUtils.test.ts 等检测真实 Selection 异常的
// 用例不再失效；Slate selection 相关代码路径恢复真实测试覆盖。

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
