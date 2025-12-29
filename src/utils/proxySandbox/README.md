# 基于 Proxy 的沙箱机制

这是一个基于 ES6 Proxy 实现的安全代码执行沙箱，为 md-editor 项目提供安全的脚本执行环境。

## 🚀 功能特点

- **安全隔离**: 通过 Proxy 劫持全局对象访问，防止恶意代码对宿主环境造成破坏
- **权限控制**: 细粒度的 API 访问控制，支持自定义权限策略
- **资源限制**: 内存使用、执行时间、调用栈深度等多维度资源限制
- **监控功能**: 实时性能监控、错误追踪、资源使用统计
- **类型安全**: 完整的 TypeScript 类型定义，提供良好的开发体验
- **易于集成**: 简洁的 API 设计，支持多种使用模式

## 📦 模块结构

```
src/utils/sandbox/
├── ProxySandbox.ts          # 核心沙箱实现
├── SecurityContextManager.ts # 安全上下文管理器
├── types.ts                 # TypeScript 类型定义
├── index.ts                 # 统一导出入口
└── README.md               # 使用文档
```

## 🔧 基本使用

### 1. 快速开始

```typescript
import { runInSandbox } from '@/utils/sandbox/proxySandbox';

// 执行简单代码
const result = await runInSandbox('return 1 + 1');
console.log(result.result); // 2

// 使用自定义全局变量
const result2 = await runInSandbox('return customVar * 2', {
  customGlobals: { customVar: 5 },
});
console.log(result2.result); // 10
```

### 2. 创建持久沙箱实例

```typescript
import { createSandbox } from '@/utils/sandbox/proxySandbox';

const sandbox = createSandbox({
  allowConsole: true,
  allowTimers: false,
  timeout: 5000,
  customGlobals: {
    myAPI: {
      getData: () => ({ message: 'Hello' }),
    },
  },
});

// 执行多次代码
const result1 = await sandbox.execute('return myAPI.getData()');
const result2 = await sandbox.execute('console.log("test"); return 42');

// 清理资源
sandbox.destroy();
```

### 3. 预配置沙箱

```typescript
import { createConfiguredSandbox } from '@/utils/sandbox/proxySandbox';

// 基础配置 - 适合一般用途
const basicSandbox = createConfiguredSandbox('basic');

// 安全配置 - 更严格的安全限制
const secureSandbox = createConfiguredSandbox('secure');

// 受限配置 - 最小权限，适合不信任的代码
const restrictedSandbox = createConfiguredSandbox('restricted');
```

### 4. 安全数学计算

```typescript
import { safeMathEval } from '@/utils/sandbox/proxySandbox';

// 安全地执行数学表达式
const result = await safeMathEval('2 + 3 * Math.sin(PI/2)');
console.log(result); // 5

// 支持预定义函数
const result2 = await safeMathEval('sqrt(16) + pow(2, 3)');
console.log(result2); // 12
```

## 🔒 安全特性

### 全局对象隔离

沙箱默认阻止访问危险的全局对象：

```typescript
// ❌ 被阻止的访问
await runInSandbox('return window.location'); // 抛出错误
await runInSandbox('return eval("1+1")'); // 抛出错误
await runInSandbox('return new Function("return 1")()'); // 抛出错误

// ✅ 允许的访问
await runInSandbox('return Math.PI'); // 正常执行
await runInSandbox('return JSON.stringify({a: 1})'); // 正常执行
```

### 超时控制

```typescript
// 设置超时时间
const result = await runInSandbox(
  'while(true) {}', // 无限循环
  { timeout: 1000 }, // 1秒后超时
);
// 抛出超时错误
```

### 内存限制

```typescript
const sandbox = createSandbox({
  maxMemoryUsage: 5 * 1024 * 1024, // 5MB 限制
});
```

## 🏗️ 在 SchemaRenderer 中使用

SchemaRenderer 组件已经集成了沙箱机制：

```tsx
<SchemaRenderer
  schema={schema}
  values={values}
  sandboxConfig={{
    enabled: true, // 启用沙箱
    allowDOM: true, // 允许 DOM 访问
    timeout: 3000, // 3秒超时
    strictMode: true, // 严格模式
  }}
/>
```

## ⚡ 高级功能

### 安全上下文管理器

```typescript
import { SecurityContextManager } from '@/utils/sandbox/proxySandbox';

const manager = new SecurityContextManager({
  permissions: {
    network: false,
    fileSystem: false,
    media: false,
  },
  limits: {
    maxExecutionTime: 2000,
    maxMemoryUsage: 5 * 1024 * 1024,
    maxCallStackDepth: 50,
  },
  monitoring: {
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
  },
});

// 创建执行上下文
const contextId = manager.createContext();

// 设置上下文变量
manager.setContextVariable(contextId, 'userData', { name: 'Alice' });

// 在上下文中执行代码
const result = await manager.executeInContext(
  contextId,
  'return userData.name.toUpperCase()',
);

console.log(result.result); // "ALICE"

// 清理
manager.destroy();
```

### 监控和统计

```typescript
const manager = new SecurityContextManager();

// 创建多个上下文
const ctx1 = manager.createContext();
const ctx2 = manager.createContext();

// 执行一些代码...
await manager.executeInContext(ctx1, 'return 1 + 1');
await manager.executeInContext(ctx2, 'return 2 * 3');

// 获取统计信息
const stats = manager.getStatistics();
console.log({
  totalContexts: stats.totalContexts,
  totalMemoryUsage: stats.totalMemoryUsage,
  averageExecutionTime: stats.averageExecutionTime,
});
```

### 健康检查

```typescript
import { sandboxHealthChecker } from '@/utils/sandbox/proxySandbox';

// 检查环境支持
const support = sandboxHealthChecker.checkEnvironmentSupport();
if (!support.supported) {
  console.warn('沙箱功能不完全支持:', support.issues);
}

// 测试基本功能
const testResult = await sandboxHealthChecker.testBasicFunctionality();
if (!testResult.passed) {
  console.error('沙箱功能测试失败:', testResult.errors);
}
```

## 🔧 配置选项

### SandboxConfig

```typescript
interface SandboxConfig {
  allowedGlobals?: string[]; // 允许访问的全局对象
  forbiddenGlobals?: string[]; // 禁止访问的全局对象
  allowConsole?: boolean; // 是否允许 console
  allowTimers?: boolean; // 是否允许定时器
  timeout?: number; // 超时时间（毫秒）
  strictMode?: boolean; // 是否启用严格模式
  customGlobals?: Record<string, any>; // 自定义全局变量
  allowDOM?: boolean; // 是否允许 DOM 访问
  maxMemoryUsage?: number; // 最大内存使用（字节）
}
```

### SecurityContextConfig

```typescript
interface SecurityContextConfig extends SandboxConfig {
  permissions?: {
    network?: boolean; // 网络访问权限
    fileSystem?: boolean; // 文件系统权限
    media?: boolean; // 媒体设备权限
    geolocation?: boolean; // 地理位置权限
    notifications?: boolean; // 通知权限
  };
  limits?: {
    maxExecutionTime?: number; // 最大执行时间
    maxMemoryUsage?: number; // 最大内存使用
    maxCallStackDepth?: number; // 最大调用栈深度
    maxLoopIterations?: number; // 最大循环次数
  };
  monitoring?: {
    enablePerformanceMonitoring?: boolean; // 性能监控
    enableErrorTracking?: boolean; // 错误追踪
    enableResourceMonitoring?: boolean; // 资源监控
  };
}
```

## 🎯 最佳实践

### 1. 选择合适的配置级别

```typescript
// 对于用户输入的代码，使用严格模式
const userCodeSandbox = createConfiguredSandbox('restricted');

// 对于内部模板，可以使用基础模式
const templateSandbox = createConfiguredSandbox('basic');

// 对于数学计算，使用专门的函数
const mathResult = await safeMathEval('sin(PI/4) * sqrt(2)');
```

### 2. 合理设置超时时间

```typescript
// 简单计算 - 短超时
await runInSandbox('return a + b', { timeout: 100 });

// 复杂算法 - 长超时
await runInSandbox(complexAlgorithm, { timeout: 5000 });
```

### 3. 提供必要的上下文

```typescript
const sandbox = createSandbox({
  customGlobals: {
    // 提供安全的 API 接口
    api: {
      log: (msg: string) => console.log('[User]', msg),
      utils: {
        formatDate: (date: Date) => date.toISOString(),
        random: () => Math.random(),
      },
    },
  },
});
```

### 4. 错误处理

```typescript
try {
  const result = await runInSandbox(userCode);
  if (result.success) {
    console.log('执行成功:', result.result);
  } else {
    console.error('执行失败:', result.error?.message);
  }
} catch (error) {
  console.error('沙箱错误:', error);
}
```

## 🧪 测试

项目包含完整的测试套件：

```bash
# 运行沙箱测试
npm test tests/utils/sandbox/

# 运行特定测试文件
npm test tests/utils/sandbox/ProxySandbox.test.ts
npm test tests/utils/sandbox/SecurityContextManager.test.ts
npm test tests/utils/sandbox/integration.test.ts
```

## 🔍 调试

### 启用调试模式

```typescript
const sandbox = createSandbox({
  allowConsole: true, // 允许 console 输出
  debug: true, // 启用调试（如果支持）
});

await sandbox.execute(`
  console.log('调试信息: 开始执行');
  const result = complexCalculation();
  console.log('调试信息: 计算结果', result);
  return result;
`);
```

### 监控执行过程

```typescript
const manager = new SecurityContextManager({
  monitoring: {
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    enableResourceMonitoring: true,
  },
});

// 监控事件会自动记录到控制台
const result = await manager.executeInContext(contextId, code);
console.log('执行时间:', result.executionTime);
console.log('内存使用:', result.memoryUsage);
```

## ⚠️ 注意事项

1. **性能影响**: 沙箱机制会增加一定的执行开销，建议在生产环境中合理使用。

2. **浏览器兼容性**: 需要支持 ES6 Proxy 的现代浏览器。

3. **异步代码**: 当前版本对异步代码的支持有限，建议避免在沙箱中使用 async/await。

4. **内存管理**: 长期运行的沙箱实例需要定期清理，避免内存泄漏。

5. **外部依赖**: 沙箱内无法直接访问外部模块，需要通过 customGlobals 提供。

## 🔄 升级和维护

### 版本兼容性

沙箱模块遵循语义版本控制：

- 主版本号：不兼容的 API 变更
- 次版本号：向后兼容的功能新增
- 修订号：向后兼容的问题修正

### 安全更新

定期关注安全公告，及时更新依赖项和修复已知的安全漏洞。

## 📚 更多资源

- [Proxy MDN 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [Web Workers 安全最佳实践](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进沙箱功能！
