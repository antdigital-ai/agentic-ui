/**
 * 基于 Proxy 的沙箱实现
 *
 * 这个模块提供了一个安全的代码执行环境，通过 Proxy 劫持全局对象的访问，
 * 防止恶意代码对宿主环境造成破坏，同时提供受控的 API 访问。
 *
 * 主要特性：
 * - 全局对象隔离
 * - API 访问控制
 * - 内存管理
 * - 错误捕获和处理
 * - 执行超时控制
 *
 * @author md-editor
 * @version 1.0.0
 */

/**
 * 沙箱配置接口
 */
export interface SandboxConfig {
  /** 允许访问的全局对象白名单 */
  allowedGlobals?: string[];
  /** 禁止访问的全局对象黑名单 */
  forbiddenGlobals?: string[];
  /** 是否允许访问 console API */
  allowConsole?: boolean;
  /** 是否允许访问 setTimeout/setInterval */
  allowTimers?: boolean;
  /** 代码执行超时时间（毫秒） */
  timeout?: number;
  /** 是否启用严格模式 */
  strictMode?: boolean;
  /** 自定义的全局变量 */
  customGlobals?: Record<string, any>;
  /** 是否允许访问 DOM API */
  allowDOM?: boolean;
  /** 最大内存使用限制（字节） */
  maxMemoryUsage?: number;
}

/**
 * 沙箱执行结果接口
 */
export interface SandboxResult {
  /** 执行结果 */
  result: any;
  /** 是否执行成功 */
  success: boolean;
  /** 错误信息 */
  error?: Error;
  /** 执行时间（毫秒） */
  executionTime: number;
  /** 内存使用情况 */
  memoryUsage?: number;
}

/**
 * 默认的危险全局对象列表
 */
// 危险的全局变量（完全禁止访问）
const DANGEROUS_GLOBALS = [
  'eval',
  'Function',
  'constructor',
  '__proto__',
  'prototype',
  'global',
  'globalThis',
  'self',
  'parent',
  'top',
  'frames',
  'location',
  'history',
  'navigator',
  'screen',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'WebSocket',
  'XMLHttpRequest',
  'fetch',
  'Request',
  'Response',
  'Headers',
  'URL',
  'URLSearchParams',
  'Blob',
  'File',
  'FileReader',
  'FormData',
  'Worker',
  'SharedWorker',
  'ServiceWorker',
  'MessageChannel',
  'MessagePort',
  'BroadcastChannel',
  'WebRTC',
  'MediaStream',
  'process',
  'require',
  'module',
  'exports',
  'Buffer',
  'global',
  'setImmediate',
  'clearImmediate',
  'setInterval',
  'clearInterval',
  'setTimeout',
  'clearTimeout',
  'queueMicrotask',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'requestIdleCallback',
  'cancelIdleCallback',
  'crypto',
  'SubtleCrypto',
  'performance',
  'PerformanceObserver',
  'IntersectionObserver',
  'MutationObserver',
  'ResizeObserver',
  'AbortController',
  'AbortSignal',
  'EventSource',
  'CloseEvent',
  'CustomEvent',
  'ErrorEvent',
  'Event',
  'EventTarget',
  'MessageEvent',
  'ProgressEvent',
  'PromiseRejectionEvent',
  'alert',
  'confirm',
  'prompt',
  'open',
  'close',
  'print',
  'focus',
  'blur',
  'getSelection',
  'getComputedStyle',
  'matchMedia',
  'moveBy',
  'moveTo',
  'resizeBy',
  'resizeTo',
  'scroll',
  'scrollBy',
  'scrollTo',
  'stop',
  'Notification',
  'webkitNotifications',
  'external',
  'chrome',
  'safari',
  'opera',
  'moz',
];

/**
 * 安全的全局对象列表
 */
const SAFE_GLOBALS = [
  'console',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'Math',
  'Date',
  'JSON',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURIComponent',
  'decodeURIComponent',
  'encodeURI',
  'decodeURI',
  'String',
  'Number',
  'Boolean',
  'Array',
  'Object',
  'RegExp',
  'Error',
  'TypeError',
  'ReferenceError',
  'SyntaxError',
];

/**
 * 基于 Proxy 的沙箱类
 */
export class ProxySandbox {
  private config: Required<SandboxConfig>;
  private globalProxy: any;
  private sandboxGlobal: Record<string, any>;
  private isActive = false;
  private timeoutId: number | null = null;
  private startTime = 0;

  constructor(config: SandboxConfig = {}) {
    this.config = {
      allowedGlobals: config.allowedGlobals || SAFE_GLOBALS,
      forbiddenGlobals: config.forbiddenGlobals || DANGEROUS_GLOBALS,
      allowConsole: config.allowConsole ?? true,
      allowTimers: config.allowTimers ?? true,
      timeout: config.timeout || 5000,
      strictMode: config.strictMode ?? true,
      customGlobals: config.customGlobals || {},
      allowDOM: config.allowDOM ?? false,
      maxMemoryUsage: config.maxMemoryUsage || 10 * 1024 * 1024, // 10MB
    };

    this.sandboxGlobal = this.createSandboxGlobal();
    this.globalProxy = this.createGlobalProxy();
  }

  /**
   * 创建安全的 document 代理对象
   * 允许访问 document 但限制敏感操作
   */
  private createSafeDocument(): any {
    // 创建基础的安全 document 对象
    const safeDocument: any = {};

    // 安全的只读属性
    safeDocument.title = 'Sandbox Document';
    safeDocument.readyState = 'complete';
    safeDocument.documentURI = 'about:blank';
    safeDocument.URL = 'about:blank';
    safeDocument.domain = '';
    safeDocument.origin = 'null';

    // 安全的文档信息
    safeDocument.doctype = null;
    safeDocument.documentElement = null;
    safeDocument.body = null;
    safeDocument.head = null;

    // 模拟安全的 cookie（空）
    Object.defineProperty(safeDocument, 'cookie', {
      get: () => '',
      set: () => {}, // 静默忽略设置
      enumerable: true,
      configurable: false,
    });

    // 提供安全的查询方法（返回 null 或空结果）
    safeDocument.getElementById = () => null;
    safeDocument.getElementsByClassName = () => [];
    safeDocument.getElementsByTagName = () => [];
    safeDocument.getElementsByName = () => [];
    safeDocument.querySelector = () => null;
    safeDocument.querySelectorAll = () => [];

    // 提供安全的创建方法（返回模拟元素）
    safeDocument.createElement = (tagName: string) => ({
      tagName: tagName.toUpperCase(),
      id: '',
      className: '',
      innerHTML: '',
      textContent: '',
      setAttribute: () => {},
      getAttribute: () => null,
      removeAttribute: () => {},
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    });

    safeDocument.createTextNode = (data: string) => ({
      nodeType: 3,
      textContent: data,
      data: data,
    });

    safeDocument.createDocumentFragment = () => ({
      nodeType: 11,
      appendChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
    });

    // 创建代理来拦截其他属性访问
    return new Proxy(safeDocument, {
      get: (target, prop, receiver) => {
        const propStr = String(prop);

        // 阻止访问危险属性
        const dangerousDocumentProps = [
          'location',
          'defaultView',
          'parentWindow',
          'implementation',
          'documentURI',
          'execCommand',
          'write',
          'writeln',
          'open',
          'close',
          'evaluate',
          'createRange',
          'getSelection',
          'elementsFromPoint',
          'elementFromPoint',
          'hasFocus',
          'hidden',
          'visibilityState',
        ];

        if (dangerousDocumentProps.includes(propStr)) {
          return undefined;
        }

        // 对于已定义的安全属性，返回实际值
        if (propStr in target) {
          return Reflect.get(target, prop, receiver);
        }

        // 对于其他属性，返回 undefined
        return undefined;
      },

      set: (target, prop, value, receiver) => {
        const propStr = String(prop);

        // 阻止设置敏感属性
        const readOnlyProps = [
          'title',
          'readyState',
          'documentURI',
          'URL',
          'domain',
          'origin',
        ];
        if (readOnlyProps.includes(propStr)) {
          return false; // 静默失败
        }

        // 允许设置其他属性（在沙箱对象内）
        return Reflect.set(target, prop, value, receiver);
      },

      has: (target, prop) => {
        const propStr = String(prop);

        // 危险属性始终返回 false
        const dangerousDocumentProps = [
          'location',
          'defaultView',
          'parentWindow',
          'implementation',
          'execCommand',
          'write',
          'writeln',
          'open',
          'close',
        ];

        if (dangerousDocumentProps.includes(propStr)) {
          return false;
        }

        return Reflect.has(target, prop);
      },
    });
  }

  /**
   * 创建安全的 window 代理对象
   * 允许访问 window 但限制敏感信息
   */
  private createSafeWindow(safeDocument?: any): any {
    // 敏感属性列表（将被设置为空或限制访问）
    const sensitiveProperties = [
      'cookie',
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'location',
      'history',
      'navigator',
      'parent',
      'top',
      'frames',
      'opener',
      'external',
      'chrome',
      'safari',
      'opera',
      'moz',
    ];

    // 创建基础的安全对象
    const safeWindow: any = {};

    // 如果在浏览器环境中，添加一些安全的 window 属性
    if (typeof window !== 'undefined') {
      // 添加安全的尺寸信息
      safeWindow.innerWidth = 1024; // 默认值
      safeWindow.innerHeight = 768;
      safeWindow.outerWidth = 1024;
      safeWindow.outerHeight = 768;
      safeWindow.devicePixelRatio = 1;

      // 添加安全的 screen 信息（静态值）
      safeWindow.screen = {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        colorDepth: 24,
        pixelDepth: 24,
      };
    }

    // 添加标准的 JavaScript 全局对象
    safeWindow.Array = Array;
    safeWindow.Object = Object;
    safeWindow.String = String;
    safeWindow.Number = Number;
    safeWindow.Boolean = Boolean;
    safeWindow.Date = Date;
    safeWindow.Math = Math;
    safeWindow.JSON = JSON;
    safeWindow.RegExp = RegExp;
    safeWindow.Error = Error;
    safeWindow.TypeError = TypeError;
    safeWindow.ReferenceError = ReferenceError;
    safeWindow.SyntaxError = SyntaxError;
    safeWindow.parseInt = parseInt;
    safeWindow.parseFloat = parseFloat;
    safeWindow.isNaN = isNaN;
    safeWindow.isFinite = isFinite;
    safeWindow.encodeURIComponent = encodeURIComponent;
    safeWindow.decodeURIComponent = decodeURIComponent;
    safeWindow.encodeURI = encodeURI;
    safeWindow.decodeURI = decodeURI;

    // 添加安全的 document 对象（使用传入的或创建新的）
    safeWindow.document = safeDocument || this.createSafeDocument();

    // 提供安全的控制台（如果允许）
    if (this.config.allowConsole) {
      safeWindow.console = {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        info: console.info.bind(console),
        debug: console.debug.bind(console),
      };
    }

    // 创建代理来拦截属性访问
    return new Proxy(safeWindow, {
      get: (target, prop, receiver) => {
        const propStr = String(prop);

        // 检查是否是敏感属性
        if (sensitiveProperties.includes(propStr)) {
          // 为敏感属性返回空或安全的默认值
          switch (propStr) {
            case 'cookie':
              return ''; // 空 cookie
            case 'localStorage':
            case 'sessionStorage':
              // 返回一个模拟的空存储对象
              return {
                length: 0,
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
                clear: () => {},
                key: () => null,
              };
            case 'location':
              return {
                href: 'about:blank',
                origin: 'null',
                protocol: 'about:',
                host: '',
                hostname: '',
                port: '',
                pathname: 'blank',
                search: '',
                hash: '',
              };
            case 'navigator':
              return {
                userAgent: 'Sandbox/1.0',
                language: 'en-US',
                languages: ['en-US'],
                platform: 'Sandbox',
                cookieEnabled: false,
                onLine: true,
              };
            default:
              return undefined;
          }
        }

        // 对于安全属性，返回实际值
        if (propStr in target) {
          return Reflect.get(target, prop, receiver);
        }

        // 对于其他属性，返回 undefined
        return undefined;
      },

      set: (target, prop, value, receiver) => {
        const propStr = String(prop);

        // 禁止设置敏感属性
        if (sensitiveProperties.includes(propStr)) {
          return false; // 静默失败
        }

        // 允许设置其他属性（在沙箱对象内）
        return Reflect.set(target, prop, value, receiver);
      },

      has: (target, prop) => {
        const propStr = String(prop);

        // 敏感属性始终返回 false
        if (sensitiveProperties.includes(propStr)) {
          return false;
        }

        return Reflect.has(target, prop);
      },

      ownKeys: (target) => {
        // 只返回安全属性的键
        const allKeys = Reflect.ownKeys(target);
        return allKeys.filter(
          (key) => !sensitiveProperties.includes(String(key)),
        );
      },

      getOwnPropertyDescriptor: (target, prop) => {
        const propStr = String(prop);

        if (sensitiveProperties.includes(propStr)) {
          return undefined;
        }

        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
    });
  }

  /**
   * 创建安全的沙箱全局对象
   */
  private createSandboxGlobal(): Record<string, any> {
    const sandboxGlobal: Record<string, any> = {};

    // 添加允许的全局对象
    for (const globalName of this.config.allowedGlobals) {
      if (globalName in globalThis) {
        sandboxGlobal[globalName] = (globalThis as any)[globalName];
      }
    }

    // 添加自定义全局变量
    Object.assign(sandboxGlobal, this.config.customGlobals);

    // 创建安全的 document 对象（确保只创建一次）
    const safeDocument = this.createSafeDocument();

    // 添加安全的 window 对象（总是可用）
    const safeWindow = this.createSafeWindow(safeDocument);
    sandboxGlobal.window = safeWindow;

    // 添加安全的 document 对象（总是可用）
    sandboxGlobal.document = safeDocument;

    // 条件性添加 console
    if (this.config.allowConsole) {
      sandboxGlobal.console = this.createSafeConsole();
    }

    // 条件性添加定时器
    if (this.config.allowTimers) {
      sandboxGlobal.setTimeout = this.createSafeTimeout();
      sandboxGlobal.setInterval = this.createSafeInterval();
      sandboxGlobal.clearTimeout = clearTimeout;
      sandboxGlobal.clearInterval = clearInterval;
    }

    // 添加指令检查函数（用于超时控制）
    sandboxGlobal.__checkInstructions = () => {
      // 这个函数会在 executeWithInstructionLimit 中被替换
    };

    return sandboxGlobal;
  }

  /**
   * 创建安全的 console 对象
   */
  private createSafeConsole() {
    return {
      log: (...args: any[]) => console.log('[Sandbox]', ...args),
      warn: (...args: any[]) => console.warn('[Sandbox]', ...args),
      error: (...args: any[]) => console.error('[Sandbox]', ...args),
      info: (...args: any[]) => console.info('[Sandbox]', ...args),
      debug: (...args: any[]) => console.debug('[Sandbox]', ...args),
    };
  }

  /**
   * 创建安全的 setTimeout
   */
  private createSafeTimeout() {
    return (
      callback: (...args: any[]) => any,
      delay: number,
      ...args: any[]
    ) => {
      if (typeof callback !== 'function') {
        throw new TypeError('Callback must be a function');
      }

      const safeCallback = () => {
        try {
          callback.apply(null, args);
        } catch (error) {
          console.error('[Sandbox] Timer callback error:', error);
        }
      };

      return setTimeout(safeCallback, Math.min(delay, 1000)); // 最大延迟1秒
    };
  }

  /**
   * 创建安全的 setInterval
   */
  private createSafeInterval() {
    return (
      callback: (...args: any[]) => any,
      delay: number,
      ...args: any[]
    ) => {
      if (typeof callback !== 'function') {
        throw new TypeError('Callback must be a function');
      }

      const safeCallback = () => {
        try {
          callback.apply(null, args);
        } catch (error) {
          console.error('[Sandbox] Interval callback error:', error);
        }
      };

      return setInterval(safeCallback, Math.max(delay, 100)); // 最小间隔100ms
    };
  }

  /**
   * 创建全局对象的 Proxy
   */
  private createGlobalProxy() {
    return new Proxy(this.sandboxGlobal, {
      get: (target, prop, receiver) => {
        const propStr = String(prop);

        // 检查是否在禁止列表中
        if (this.config.forbiddenGlobals.includes(propStr)) {
          throw new ReferenceError(
            `Access to '${propStr}' is not allowed in sandbox`,
          );
        }

        // 允许访问内部功能函数
        if (propStr === '__checkInstructions') {
          return Reflect.get(target, prop, receiver);
        }

        // 检查是否在允许列表中
        if (this.config.allowedGlobals.includes(propStr)) {
          if (propStr in target) {
            return Reflect.get(target, prop, receiver);
          }

          // 某些特殊的全局对象需要特殊处理
          if (
            propStr === 'window' ||
            propStr === 'global' ||
            propStr === 'globalThis'
          ) {
            return receiver; // 返回代理对象本身
          }
        }

        // 检查自定义全局变量
        if (propStr in this.config.customGlobals) {
          return Reflect.get(target, prop, receiver);
        }

        // 如果不在任何允许的列表中，返回 undefined
        return undefined;
      },

      set: (target, prop, value, receiver) => {
        const propStr = String(prop);

        // 检查是否在禁止列表中
        if (this.config.forbiddenGlobals.includes(propStr)) {
          throw new ReferenceError(
            `Setting '${propStr}' is not allowed in sandbox`,
          );
        }

        // 只允许设置已存在的属性或新的变量
        return Reflect.set(target, prop, value, receiver);
      },

      has: (target, prop) => {
        const propStr = String(prop);

        // 如果在禁止列表中，返回 false
        if (this.config.forbiddenGlobals.includes(propStr)) {
          return false;
        }

        // 如果在允许列表中或目标对象中，返回 true
        return (
          this.config.allowedGlobals.includes(propStr) ||
          Reflect.has(target, prop)
        );
      },

      ownKeys: (target) => {
        // 只返回允许的属性键
        const allKeys = Reflect.ownKeys(target);
        return allKeys.filter(
          (key) => !this.config.forbiddenGlobals.includes(String(key)),
        );
      },

      getOwnPropertyDescriptor: (target, prop) => {
        const propStr = String(prop);

        if (this.config.forbiddenGlobals.includes(propStr)) {
          return undefined;
        }

        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
    });
  }

  /**
   * 在沙箱中执行代码
   */
  async execute(
    code: string,
    injectedParams?: Record<string, any>,
  ): Promise<SandboxResult> {
    this.startTime = performance.now();
    this.isActive = true;

    let result: any;
    let error: Error | undefined;
    let success = false;

    try {
      // 尝试使用 Worker 执行（适用于支持的环境）
      if (typeof Worker !== 'undefined' && typeof URL !== 'undefined') {
        result = await this.executeWithWorker(code, injectedParams);
      } else {
        // 检查是否是明显的死循环
        if (this.isObviousInfiniteLoop(code)) {
          // 只对明显的死循环使用指令计数
          result = await this.executeWithInstructionLimit(code, injectedParams);
        } else {
          // 对正常代码直接执行，但有超时保护
          result = await this.executeWithTimeout(code, injectedParams);
        }
      }
      success = true;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      success = false;
    } finally {
      this.cleanup();
    }

    const executionTime = performance.now() - this.startTime;

    return {
      result,
      success,
      error,
      executionTime,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * 检查是否是明显的死循环
   */
  private isObviousInfiniteLoop(code: string): boolean {
    // 简单的模式匹配检测明显的死循环
    const infiniteLoopPatterns = [
      /while\s*\(\s*true\s*\)/,
      /for\s*\(\s*;\s*;\s*\)/,
      /while\s*\(\s*1\s*\)/,
      /while\s*\(\s*!false\s*\)/,
      /do\s*\{[^}]*\}\s*while\s*\(\s*true\s*\)/,
      /do\s*\{[^}]*\}\s*while\s*\(\s*1\s*\)/,
    ];

    return infiniteLoopPatterns.some((pattern) => pattern.test(code));
  }

  /**
   * 带超时的普通执行
   * 注意：对于同步死循环，setTimeout 无法中断，需要使用 Worker 或指令计数
   * 这个方法只适用于不包含死循环的代码
   */
  private async executeWithTimeout(
    code: string,
    injectedParams?: Record<string, any>,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new Error(`Code execution timeout after ${this.config.timeout}ms`),
        );
      }, this.config.timeout);

      try {
        const result = this.executeCode(code, injectedParams);
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * 使用指令计数限制执行时间
   * 这是处理同步死循环的唯一方法（在不使用 Worker 的情况下）
   */
  private async executeWithInstructionLimit(
    code: string,
    injectedParams?: Record<string, any>,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const maxInstructions = 10000; // 降低最大指令数，更快检测死循环
      let instructionCount = 0;
      const startTime = performance.now();
      let timeoutId: NodeJS.Timeout | null = null;

      // 注入指令计数器
      const instrumentedCode = this.instrumentCode(code);

      // 创建全局计数器函数
      const originalGlobal = this.sandboxGlobal.__checkInstructions;
      this.sandboxGlobal.__checkInstructions = () => {
        instructionCount++;
        const elapsed = performance.now() - startTime;

        // 检查时间超时
        if (elapsed > this.config.timeout) {
          throw new Error(
            `Code execution timeout after ${this.config.timeout}ms`,
          );
        }

        // 如果指令数超过限制，说明可能是死循环
        if (instructionCount > maxInstructions) {
          throw new Error(
            `Code execution exceeded maximum instruction limit (${maxInstructions})`,
          );
        }
      };

      // 设置超时保护，防止指令检查没有被调用
      timeoutId = setTimeout(() => {
        reject(
          new Error(`Code execution timeout after ${this.config.timeout}ms`),
        );
      }, this.config.timeout);

      try {
        const result = this.executeCode(instrumentedCode, injectedParams);
        if (timeoutId) clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      } finally {
        // 恢复原始状态
        if (originalGlobal) {
          this.sandboxGlobal.__checkInstructions = originalGlobal;
        } else {
          delete this.sandboxGlobal.__checkInstructions;
        }
      }
    });
  }

  /**
   * 在代码中注入指令计数器
   * 在循环体内部注入检查点，确保死循环能够被检测到
   */
  private instrumentCode(code: string): string {
    // 简化的指令注入，在循环结构中添加检查
    let instrumented = code;

    // 为 for 循环体注入检查（在开括号后）
    instrumented = instrumented.replace(
      /(\bfor\s*\([^)]*\)\s*\{)/g,
      '$1\n  __checkInstructions();',
    );

    // 为 while 循环体注入检查（在开括号后）
    instrumented = instrumented.replace(
      /(\bwhile\s*\([^)]*\)\s*\{)/g,
      '$1\n  __checkInstructions();',
    );

    // 为 do-while 循环体注入检查
    instrumented = instrumented.replace(
      /(\bdo\s*\{)/g,
      '$1\n  __checkInstructions();',
    );

    // 在代码开始处插入检查，确保即使没有循环也能检测超时
    return `__checkInstructions();\n${instrumented}`;
  }

  /**
   * 使用 Worker 执行代码以实现真正的超时控制
   */
  private executeWithWorker(
    code: string,
    injectedParams?: Record<string, any>,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // 尝试序列化参数，失败则回退
      const serializableParams = this.trySerializeParams(
        injectedParams,
        code,
        resolve,
        reject,
      );
      if (!serializableParams) return; // 已经回退处理

      // 创建 Worker
      const { worker, workerUrl, timeoutId } = this.createWorkerInstance(
        code,
        serializableParams,
        resolve,
        reject,
      );

      // Worker 创建失败，已经回退
      if (!worker) return;

      // 设置消息处理
      this.setupWorkerHandlers(worker, workerUrl, timeoutId, resolve, reject);
    });
  }

  /**
   * 尝试序列化参数，失败则回退到同步执行
   */
  private trySerializeParams(
    injectedParams: Record<string, any> | undefined,
    code: string,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
  ): Record<string, any> | null {
    if (!injectedParams) return {};

    const serializableParams: Record<string, any> = {};

    for (const [key, value] of Object.entries(injectedParams)) {
      try {
        JSON.stringify(value);
        serializableParams[key] = value;
      } catch {
        console.warn(`无法序列化注入参数 "${key}"，回退到同步执行`);
        this.fallbackToSyncExecution(code, injectedParams, resolve, reject);
        return null;
      }
    }

    return serializableParams;
  }

  /**
   * 回退到同步执行
   */
  private fallbackToSyncExecution(
    code: string,
    injectedParams: Record<string, any>,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
  ): void {
    // 检查是否是死循环，如果是则使用指令计数方法
    if (this.isObviousInfiniteLoop(code)) {
      this.executeWithInstructionLimit(code, injectedParams)
        .then(resolve)
        .catch(reject);
      return;
    }

    // 对正常代码使用超时保护
    this.executeWithTimeout(code, injectedParams).then(resolve).catch(reject);
  }

  /**
   * 创建 Worker 实例
   */
  private createWorkerInstance(
    code: string,
    serializableParams: Record<string, any>,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
  ): { worker: Worker | null; workerUrl: string; timeoutId: number } {
    const workerCode = this.generateWorkerCode();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    try {
      const worker = new Worker(workerUrl);
      const timeoutId = this.setupWorkerTimeout(worker, workerUrl, reject);

      // 发送代码到 Worker
      worker.postMessage({
        code,
        config: this.config,
        injectedParams: serializableParams,
      });

      return { worker, workerUrl, timeoutId };
    } catch (error) {
      URL.revokeObjectURL(workerUrl);
      console.warn('Worker 创建失败，回退到同步执行');
      this.fallbackToSyncExecution(code, serializableParams, resolve, reject);
      return { worker: null, workerUrl, timeoutId: 0 };
    }
  }

  /**
   * 生成 Worker 代码
   */
  private generateWorkerCode(): string {
    return `
      self.onmessage = function(e) {
        const { code, config, injectedParams } = e.data;
        
        try {
          // 创建安全的执行环境
          const safeGlobals = {
            Math, Date, JSON, parseInt, parseFloat, isNaN, isFinite,
            encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
            String, Number, Boolean, Array, Object, RegExp,
            Error, TypeError, ReferenceError, SyntaxError
          };
          
          // 添加自定义全局变量
          Object.assign(safeGlobals, config.customGlobals || {});
          
          // 添加注入的参数
          Object.assign(safeGlobals, injectedParams || {});
          
          // 添加 console（如果允许）
          if (config.allowConsole) {
            safeGlobals.console = {
              log: (...args) => self.postMessage({ type: 'log', data: args }),
              warn: (...args) => self.postMessage({ type: 'warn', data: args }),
              error: (...args) => self.postMessage({ type: 'error', data: args }),
              info: (...args) => self.postMessage({ type: 'info', data: args }),
              debug: (...args) => self.postMessage({ type: 'debug', data: args })
            };
          }
          
          // 创建执行函数
          const wrappedCode = config.strictMode ? "'use strict';\\n" + code : code;
          const func = new Function(...Object.keys(safeGlobals), 'return (function() { ' + wrappedCode + ' })()');
          
          // 执行代码
          const result = func(...Object.values(safeGlobals));
          
          self.postMessage({ type: 'result', data: result });
        } catch (error) {
          self.postMessage({ type: 'error', data: { message: error.message, stack: error.stack } });
        }
      };
    `;
  }

  /**
   * 设置 Worker 超时
   */
  private setupWorkerTimeout(
    worker: Worker,
    workerUrl: string,
    reject: (reason?: any) => void,
  ): number {
    return window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      reject(
        new Error(`Code execution timeout after ${this.config.timeout}ms`),
      );
    }, this.config.timeout);
  }

  /**
   * 设置 Worker 消息处理器
   */
  private setupWorkerHandlers(
    worker: Worker,
    workerUrl: string,
    timeoutId: number,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
  ): void {
    worker.onmessage = (e) => {
      const { type, data } = e.data;

      if (type === 'result') {
        this.cleanupWorker(worker, workerUrl, timeoutId);
        resolve(data);
        return;
      }

      if (type === 'error') {
        this.cleanupWorker(worker, workerUrl, timeoutId);
        reject(new Error(data.message));
        return;
      }

      // 处理控制台输出
      this.handleConsoleMessage(type, data);
    };

    worker.onerror = (error) => {
      this.cleanupWorker(worker, workerUrl, timeoutId);
      reject(new Error(`Worker error: ${error.message}`));
    };
  }

  /**
   * 处理控制台消息
   */
  private handleConsoleMessage(type: string, data: any): void {
    if (!this.config.allowConsole) return;

    const consoleTypes = ['log', 'warn', 'error', 'info', 'debug'];
    if (!consoleTypes.includes(type)) return;

    const consoleMethod = console[type as keyof Console] as (
      ...args: any[]
    ) => void;

    if (typeof consoleMethod === 'function') {
      consoleMethod('[Sandbox]', ...data);
    }
  }

  /**
   * 清理 Worker 资源
   */
  private cleanupWorker(
    worker: Worker,
    workerUrl: string,
    timeoutId: number,
  ): void {
    clearTimeout(timeoutId);
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
  }

  /**
   * 执行代码的核心方法（同步版本）
   */
  private executeCode(code: string, injectedParams?: Record<string, any>): any {
    // 添加严格模式
    const wrappedCode = this.config.strictMode
      ? `'use strict';\n${code}`
      : code;

    // 预处理代码以检测和阻止危险操作
    this.validateCode(wrappedCode);

    // 获取允许的全局变量名和值
    // 合并沙箱全局变量、自定义全局变量和注入参数
    const allGlobals = {
      ...this.sandboxGlobal,
      ...this.config.customGlobals, // 确保包含所有自定义全局变量
      ...(injectedParams || {}), // 添加注入的参数
    };

    const allowedKeys = Object.keys(allGlobals);
    const allowedValues = allowedKeys.map((key) => allGlobals[key]);

    // 创建安全的执行环境
    // 通过参数传递的方式提供沙箱全局变量，而不是通过全局对象访问
    const funcCode = `
      return (function(${allowedKeys.join(', ')}) {
        ${wrappedCode}
      })(${allowedKeys.map((_, index) => `arguments[${index}]`).join(', ')});
    `;

    try {
      // 使用 Function 构造函数创建执行函数
      // 不传递任何全局变量名，强制代码只能使用参数提供的变量
      const func = new Function(funcCode);

      // 执行函数，传入沙箱全局变量
      return func.apply(null, allowedValues);
    } catch (error) {
      // 检查是否是因为试图访问被禁止的全局变量
      if (error instanceof ReferenceError) {
        const match = error.message.match(/(\w+) is not defined/);
        if (match) {
          const varName = match[1];
          if (this.config.forbiddenGlobals.includes(varName)) {
            throw new ReferenceError(
              `Access to '${varName}' is not allowed in sandbox`,
            );
          }
        }
      }
      throw error;
    }
  }

  /**
   * 验证代码安全性
   */
  private validateCode(code: string): void {
    // 检查是否包含危险的模式
    const dangerousPatterns = [
      /\beval\s*\(/,
      /\bFunction\s*\(/,
      /new\s+Function\s*\(/,
      /\.constructor/, // 直接检查 .constructor 访问
      /\.__proto__/,
      /\.prototype\./,
      /\bglobal\s*[.[]/,
      /\bself\s*[.[]/,
      /\bprocess\s*[.[]/,
      /\brequire\s*\(/,
      /\bimport\s*\(/,
      /\bimportScripts\s*\(/,
    ];

    // 对于 globalThis，只在直接访问属性时才阻止，允许 typeof 检查
    // 检查是否有恶意的 globalThis 访问（排除 typeof 检查）
    const globalThisPatterns = [
      /\bglobalThis\s*\.\s*[a-zA-Z_$]/, // globalThis.someProperty
      /\bglobalThis\s*\[/, // globalThis[someIndex]
      /=\s*globalThis\b/, // = globalThis
      /\breturn\s+globalThis\b/, // return globalThis
    ];

    for (const pattern of globalThisPatterns) {
      if (pattern.test(code)) {
        throw new Error(
          'Code contains dangerous pattern: globalThis property access',
        );
      }
    }

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Code contains dangerous pattern: ${pattern.source}`);
      }
    }

    // 检查特定的被禁止的全局变量名（只检查明确的危险变量）
    const criticalForbiddenGlobals = [
      'eval',
      'Function',
      'constructor',
      '__proto__',
      'global',
      'self',
      'process',
      'require',
      'module',
      'exports',
      'Buffer',
      'XMLHttpRequest',
      'fetch',
      'WebSocket',
      'Worker',
      'SharedArrayBuffer',
      'Atomics',
      'WebAssembly',
    ];

    for (const forbiddenGlobal of criticalForbiddenGlobals) {
      // 只检查作为独立标识符或对象访问的情况
      const patterns = [
        new RegExp(`\\b${forbiddenGlobal}\\s*\\(`, 'g'), // 函数调用
        new RegExp(`\\b${forbiddenGlobal}\\s*\\.`, 'g'), // 属性访问
        new RegExp(`\\b${forbiddenGlobal}\\s*\\[`, 'g'), // 索引访问
        new RegExp(`\\breturn\\s+${forbiddenGlobal}\\b`, 'g'), // 直接返回
        new RegExp(`=\\s*${forbiddenGlobal}\\b`, 'g'), // 赋值
      ];

      for (const pattern of patterns) {
        if (pattern.test(code)) {
          throw new ReferenceError(
            `Access to '${forbiddenGlobal}' is not allowed in sandbox`,
          );
        }
      }
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    this.isActive = false;

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * 销毁沙箱
   */
  destroy(): void {
    this.cleanup();

    // 清理全局对象
    Object.keys(this.sandboxGlobal).forEach((key) => {
      delete this.sandboxGlobal[key];
    });
  }

  /**
   * 检查沙箱是否处于活动状态
   */
  isRunning(): boolean {
    return this.isActive;
  }

  /**
   * 添加自定义全局变量
   */
  addGlobal(name: string, value: any): void {
    if (this.config.forbiddenGlobals.includes(name)) {
      throw new Error(`Cannot add forbidden global: ${name}`);
    }

    this.sandboxGlobal[name] = value;
    this.config.customGlobals[name] = value;
  }

  /**
   * 移除自定义全局变量
   */
  removeGlobal(name: string): void {
    delete this.sandboxGlobal[name];
    delete this.config.customGlobals[name];
  }

  /**
   * 获取沙箱配置
   */
  getConfig(): Readonly<Required<SandboxConfig>> {
    return { ...this.config };
  }
}

/**
 * 创建沙箱实例的工厂函数
 */
export function createSandbox(config?: SandboxConfig): ProxySandbox {
  return new ProxySandbox(config);
}

/**
 * 快速执行代码的工具函数
 */
export async function runInSandbox(
  code: string,
  config?: SandboxConfig,
  injectedParams?: Record<string, any>,
): Promise<SandboxResult> {
  const sandbox = createSandbox(config);
  try {
    return await sandbox.execute(code, injectedParams);
  } finally {
    sandbox.destroy();
  }
}
