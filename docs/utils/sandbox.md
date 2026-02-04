---
nav:
  title: 基础能力
  order: 5
group:
  title: 基础能力
  order: 8
---

# 沙箱系统 (ProxySandbox)

## 概述

ProxySandbox 是一个强大的 JavaScript 代码执行沙箱系统，提供安全、受控的代码执行环境。它支持多种安全特性，包括代码注入防护、访问控制、资源限制和自定义参数注入等功能。

### 核心特性

- 🔒 **安全执行环境** - 防止恶意代码访问敏感 API
- ⏱️ **超时保护** - 防止无限循环和长时间运行的代码
- 🚀 **高性能** - 支持 Worker 线程执行和主线程降级
- 🔧 **参数注入** - 支持自定义对象注入，如 shadowRoot
- 🛡️ **访问控制** - 提供安全的 window 和 document 代理
- 📊 **资源监控** - 内存使用限制和性能监控

## 快速开始

### 基本使用

```tsx | pure
import { quickExecute } from '@/utils/sandbox/proxySandbox';

// 执行简单的 JavaScript 代码
const result = await quickExecute('return 1 + 1');
console.log(result); // 2

// 使用变量
const result2 = await quickExecute(`
  const message = 'Hello, Sandbox!';
  return message.toUpperCase();
`);
console.log(result2); // 'HELLO, SANDBOX!'
```

### 使用 ProxySandbox 实例

```tsx | pure
import { ProxySandbox } from '@/utils/sandbox/proxySandbox';

const sandbox = new ProxySandbox({
  timeout: 5000,
  allowConsole: true,
  enableSafeWindow: true,
});

try {
  const result = await sandbox.execute(`
    console.log('代码开始执行');
    
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    return fibonacci(10);
  `);

  console.log('执行结果:', result.result); // 55
} finally {
  sandbox.destroy(); // 清理资源
}
```

## 安全特性

### 1. 代码注入防护

沙箱会自动阻止危险的代码执行：

```tsx | pure
// 这些代码会被阻止执行
await quickExecute('eval("malicious code")'); // ❌ 被阻止
await quickExecute('new Function("return 1")()'); // ❌ 被阻止
await quickExecute('this.constructor.constructor'); // ❌ 被阻止
```

### 2. 安全的全局对象

提供安全的 `window` 和 `document` 代理：

```tsx | pure
const result = await quickExecute(`
  return {
    // 允许访问的安全属性
    userAgent: window.navigator.userAgent,
    windowWidth: window.innerWidth,
    documentTitle: document.title,
    
    // 敏感信息被清空
    cookies: document.cookie,        // 返回空字符串
    storage: window.localStorage,    // 返回安全的模拟对象
  }
`);

console.log(result.cookies); // ''（空字符串，保护隐私）
```

### 3. 资源限制

```tsx | pure
const sandbox = new ProxySandbox({
  timeout: 1000, // 1秒超时
  maxInstructions: 10000, // 最大指令数
  memoryLimit: 50 * 1024 * 1024, // 50MB 内存限制
});

// 超时的代码会被自动终止
try {
  await sandbox.execute('while(true) {}'); // 1秒后超时
} catch (error) {
  console.log('代码执行超时');
}
```

## 自定义参数注入

### shadowRoot 注入

ProxySandbox 支持注入自定义参数，特别适用于 Shadow DOM 操作：

### shadowRoot 注入使用示例

#### 1. 基本 shadowRoot 操作

```tsx | pure
import { ProxySandbox } from '@/utils/sandbox/proxySandbox';

// 创建沙箱实例
const sandbox = new ProxySandbox();

// 创建或获取 shadowRoot
const shadowRoot = someElement.attachShadow({ mode: 'open' });

// 在沙箱中执行代码并注入 shadowRoot
const result = await sandbox.execute(
  `
  // 创建内容元素
  const div = document.createElement('div');
  div.className = 'content';
  div.innerHTML = '<h1>Hello Shadow DOM!</h1>';
  
  // 添加到 shadowRoot
  shadowRoot.appendChild(div);
  
  // 查询元素
  const heading = shadowRoot.querySelector('h1');
  
  return {
    success: true,
    elementCount: shadowRoot.children.length,
    headingText: heading?.textContent
  };
`,
  {
    shadowRoot: shadowRoot,
  },
);

console.log(result.result);
// 输出: { success: true, elementCount: 1, headingText: 'Hello Shadow DOM!' }
```

#### 2. 使用 quickExecute 便捷函数

```tsx | pure
import { quickExecute } from '@/utils/sandbox/proxySandbox';

const shadowRoot = someElement.attachShadow({ mode: 'open' });

const result = await quickExecute(
  `
  // 创建样式
  const style = document.createElement('style');
  style.textContent = \`
    .container {
      padding: 12px;
      background: #f0f0f0;
      border-radius: 8px;
    }
  \`;
  shadowRoot.appendChild(style);
  
  // 创建内容
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = '<p>Styled content in Shadow DOM</p>';
  shadowRoot.appendChild(container);
  
  return 'Content added successfully';
`,
  undefined,
  {
    shadowRoot: shadowRoot,
  },
);

console.log(result); // 'Content added successfully'
```

#### 3. 在 React 组件中使用

```tsx | pure
import React, { useEffect, useRef } from 'react';
import { quickExecute } from '@/utils/sandbox/proxySandbox';

const ShadowDOMComponent: React.FC = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !shadowRootRef.current) {
      // 创建 Shadow DOM
      shadowRootRef.current = hostRef.current.attachShadow({ mode: 'open' });

      // 用户自定义的脚本
      const userScript = `
        // 用户可以安全地操作 shadowRoot
        const template = document.createElement('template');
        template.innerHTML = \`
          <style>
            :host {
              display: block;
              padding: 16px;
              border: 2px solid #007acc;
              border-radius: 8px;
            }
            .user-content {
              color: #333;
              font-family: Arial, sans-serif;
            }
          </style>
          <div class="user-content">
            <h2>用户自定义内容</h2>
            <p>这是在沙箱中安全创建的内容</p>
            <button id="clickMe">点击我</button>
          </div>
        \`;

        shadowRoot.appendChild(template.content.cloneNode(true));

        // 添加事件监听器
        const button = shadowRoot.getElementById('clickMe');
        if (button) {
          button.addEventListener('click', () => {
            alert('按钮被点击了！');
          });
        }

        return 'Shadow DOM content created';
      `;

      // 在沙箱中执行用户脚本
      quickExecute(userScript, undefined, {
        shadowRoot: shadowRootRef.current,
      })
        .then((result) => {
          console.log('用户脚本执行结果:', result);
        })
        .catch((error) => {
          console.error('用户脚本执行失败:', error);
        });
    }
  }, []);

  return <div ref={hostRef} />;
};

export default ShadowDOMComponent;
```

## 高级功能

### 1. 动态主题系统

```tsx | pure
const applyTheme = async (shadowRoot: ShadowRoot, themeConfig: any) => {
  await quickExecute(
    `
    // 移除旧主题
    const oldStyles = shadowRoot.querySelectorAll('style[data-theme]');
    oldStyles.forEach(style => style.remove());
    
    // 创建新主题样式
    const themeStyle = document.createElement('style');
    themeStyle.setAttribute('data-theme', 'true');
    themeStyle.textContent = \`
      :host {
        --primary-color: \${primaryColor};
        --secondary-color: \${secondaryColor};
        --background-color: \${backgroundColor};
      }
      
      .themed-element {
        color: var(--primary-color);
        background-color: var(--background-color);
        border: 1px solid var(--secondary-color);
      }
    \`;
    
    shadowRoot.appendChild(themeStyle);
    
    return 'Theme applied successfully';
  `,
    undefined,
    {
      shadowRoot: shadowRoot,
      primaryColor: themeConfig.primary,
      secondaryColor: themeConfig.secondary,
      backgroundColor: themeConfig.background,
    },
  );
};
```

### 2. 动态组件生成器

```tsx | pure
const generateComponent = async (
  shadowRoot: ShadowRoot,
  componentSpec: any,
) => {
  return await quickExecute(
    `
    // 根据规格创建组件
    const wrapper = document.createElement('div');
    wrapper.className = 'dynamic-component';
    
    // 创建标题
    if (spec.title) {
      const title = document.createElement('h3');
      title.textContent = spec.title;
      wrapper.appendChild(title);
    }
    
    // 创建内容区域
    if (spec.content) {
      const content = document.createElement('div');
      content.innerHTML = spec.content;
      wrapper.appendChild(content);
    }
    
    // 创建按钮
    if (spec.buttons) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      
      spec.buttons.forEach(btnSpec => {
        const button = document.createElement('button');
        button.textContent = btnSpec.text;
        button.className = btnSpec.className || 'default-btn';
        buttonContainer.appendChild(button);
      });
      
      wrapper.appendChild(buttonContainer);
    }
    
    shadowRoot.appendChild(wrapper);
    
    return {
      success: true,
      elementCount: wrapper.children.length
    };
  `,
    undefined,
    {
      shadowRoot: shadowRoot,
      spec: componentSpec,
    },
  );
};
```

## 配置选项

### SandboxConfig 接口

```tsx | pure
interface SandboxConfig {
  // 执行超时时间（毫秒）
  timeout?: number;

  // 是否允许 console 输出
  allowConsole?: boolean;

  // 是否启用安全的 window 对象
  enableSafeWindow?: boolean;

  // 是否启用安全的 document 对象
  enableSafeDocument?: boolean;

  // 最大指令执行数
  maxInstructions?: number;

  // 内存限制（字节）
  memoryLimit?: number;

  // 自定义全局变量
  customGlobals?: Record<string, any>;

  // 是否使用 Worker 线程
  useWorker?: boolean;
}
```

### 预设配置

系统提供了几种预设配置：

```tsx | pure
import { createConfiguredSandbox } from '@/utils/sandbox/proxySandbox';

// 基础配置 - 适用于一般用途
const basicSandbox = createConfiguredSandbox('basic');

// 安全配置 - 更严格的安全限制
const secureSandbox = createConfiguredSandbox('secure');

// 受限配置 - 最严格的限制
const restrictedSandbox = createConfiguredSandbox('restricted');
```

## API 参考

### quickExecute

快速执行简单代码的便捷函数：

```tsx | pure
function quickExecute(
  code: string,
  customGlobals?: Record<string, any>,
  injectedParams?: Record<string, any>,
): Promise<any>;
```

### runInSandbox

在沙箱中执行代码的通用函数：

```tsx | pure
function runInSandbox(
  code: string,
  config?: SandboxConfig,
  injectedParams?: Record<string, any>,
): Promise<SandboxResult>;
```

### ProxySandbox 类

完整的沙箱类，提供更多控制选项：

```tsx | pure
class ProxySandbox {
  constructor(config?: SandboxConfig);

  execute(
    code: string,
    injectedParams?: Record<string, any>,
  ): Promise<SandboxResult>;

  getConfig(): SandboxConfig;
  destroy(): void;
}
```

## 错误处理

### 常见错误类型

```tsx | pure
try {
  const result = await quickExecute(userCode);
} catch (error) {
  if (error.name === 'SandboxTimeoutError') {
    console.log('代码执行超时');
  } else if (error.name === 'SandboxSecurityError') {
    console.log('代码包含不安全的操作');
  } else if (error.name === 'SandboxMemoryError') {
    console.log('代码超出内存限制');
  } else {
    console.log('代码执行错误:', error.message);
  }
}
```

### 结果类型

```tsx | pure
interface SandboxResult {
  success: boolean;
  result?: any;
  error?: Error;
  executionTime?: number;
  memoryUsage?: number;
}
```

## 性能优化

### 1. Worker 线程使用

默认情况下，沙箱会尝试使用 Worker 线程执行代码：

```tsx | pure
const sandbox = new ProxySandbox({
  useWorker: true, // 默认为 true
});
```

### 2. 批量执行

对于多个代码片段，建议复用沙箱实例：

```tsx | pure
const sandbox = new ProxySandbox();

try {
  const results = await Promise.all([
    sandbox.execute(code1),
    sandbox.execute(code2),
    sandbox.execute(code3),
  ]);
} finally {
  sandbox.destroy();
}
```

### 3. 内存管理

```tsx | pure
// 设置合理的内存限制
const sandbox = new ProxySandbox({
  memoryLimit: 10 * 1024 * 1024, // 10MB
});

// 及时清理大型对象
await sandbox.execute(`
  const largeArray = new Array(1000000);
  // ... 使用数组
  largeArray.length = 0; // 清理
  return result;
`);
```

## 监控和调试

### 执行统计

```tsx | pure
const result = await sandbox.execute(code);

console.log('执行时间:', result.executionTime, 'ms');
console.log('内存使用:', result.memoryUsage, 'bytes');
console.log('执行成功:', result.success);
```

### 调试模式

```tsx | pure
const sandbox = new ProxySandbox({
  allowConsole: true, // 允许 console 输出用于调试
});

await sandbox.execute(`
  console.log('调试信息: 变量值为', someVariable);
  console.warn('警告: 可能的性能问题');
  return result;
`);
```

## 安全最佳实践

### 1. 输入验证

始终验证用户输入的代码：

```tsx | pure
function validateUserCode(code: string): boolean {
  // 检查代码长度
  if (code.length > 10000) {
    throw new Error('代码过长');
  }

  // 检查危险模式
  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /constructor/,
    /__proto__/,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(code));
}
```

### 2. 权限最小化

只提供必要的功能：

```tsx | pure
const restrictedSandbox = new ProxySandbox({
  allowConsole: false, // 生产环境关闭
  enableSafeWindow: false, // 如不需要则关闭
  enableSafeDocument: false, // 如不需要则关闭
  timeout: 1000, // 短超时
  maxInstructions: 5000, // 限制指令数
});
```

### 3. 资源监控

监控沙箱使用情况：

```tsx | pure
class SandboxMonitor {
  private executionCount = 0;
  private totalExecutionTime = 0;

  async executeWithMonitoring(code: string) {
    const startTime = Date.now();

    try {
      const result = await quickExecute(code);
      this.executionCount++;
      this.totalExecutionTime += Date.now() - startTime;

      // 检查是否需要限制
      if (this.executionCount > 100) {
        throw new Error('执行次数超限');
      }

      return result;
    } catch (error) {
      this.logSuspiciousActivity(code, error);
      throw error;
    }
  }

  private logSuspiciousActivity(code: string, error: Error) {
    console.warn('可疑代码执行:', { code, error: error.message });
  }
}
```

## 常见使用场景

### 1. 用户自定义脚本

```tsx | pure
// 允许用户编写自定义逻辑
const userScript = `
  function processData(data) {
    return data.map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }));
  }
  
  return processData(inputData);
`;

const result = await quickExecute(userScript, {
  inputData: userData,
});
```

### 2. 动态表达式求值

```tsx | pure
// 计算用户输入的数学表达式
const expression = '(a + b) * c - d / 2';
const variables = { a: 10, b: 5, c: 3, d: 8 };

const result = await quickExecute(
  `
  const { a, b, c, d } = variables;
  return ${expression};
`,
  { variables },
);
```

### 3. 模板引擎

```tsx | pure
// 简单的模板处理
const template = `
  const output = [];
  for (const item of data) {
    output.push(\`<div class="item">
      <h3>\${item.title}</h3>
      <p>\${item.description}</p>
    </div>\`);
  }
  return output.join('');
`;

const html = await quickExecute(template, {
  data: templateData,
});
```

## 迁移指南

### 从传统 eval 迁移

```tsx | pure
// 之前: 不安全的 eval
const result = eval(userCode);

// 现在: 安全的沙箱
const result = await quickExecute(userCode);
```

### 从 Function 构造函数迁移

```tsx | pure
// 之前: 使用 Function 构造函数
const fn = new Function('data', userCode);
const result = fn(data);

// 现在: 使用沙箱
const result = await quickExecute(userCode, { data });
```

## 故障排除

### 常见问题

1. **代码执行超时**
   - 检查是否有无限循环
   - 增加 timeout 配置
   - 优化算法复杂度

2. **内存不足**
   - 检查是否创建了大量对象
   - 增加 memoryLimit 配置
   - 及时清理不需要的变量

3. **Worker 不可用**
   - 沙箱会自动降级到主线程
   - 检查浏览器兼容性
   - 确保 Worker 脚本正确加载

### 调试技巧

```tsx | pure
// 启用详细日志
const sandbox = new ProxySandbox({
  allowConsole: true,
});

// 添加调试信息
const debugCode = `
  console.log('开始执行:', Date.now());
  ${userCode}
  console.log('执行完成:', Date.now());
`;

await sandbox.execute(debugCode);
```

这样，ProxySandbox 为开发者提供了一个功能强大、安全可靠的 JavaScript 代码执行环境，适用于各种需要动态代码执行的场景。
