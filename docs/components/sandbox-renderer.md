---
title: SandboxRenderer 沙箱渲染器
atomId: SandboxRenderer
group:
  title: 通用
  order: 6
---

# SandboxRenderer 沙箱渲染器 {#sandboxrenderer}

`SandboxRenderer` 用于安全地渲染 **coding agent 生成的 JavaScript 代码**。代码在 `ProxySandbox` 中执行：可以创建真实 DOM 节点并挂载到组件内置的 Shadow DOM 容器，但查询被限定在容器内部，无法触达宿主页面；同时继承超时中断、全局对象白名单、危险 API 拦截等安全能力。

## 何时使用 {#when-to-use}

- 需要渲染 coding agent 生成的自包含 DOM 脚本（数据可视化卡片、交互小部件等）
- 需要在文档/对话流中嵌入动态生成的内容，又要保证宿主页面安全
- 代码需要返回纯数据，由 `onExecute` 交给宿主处理

## 代码演示 {#demo}

<code src="../demos/sandbox-renderer-basic.tsx">基础用法 - 渲染 Agent 生成的交互卡片</code>

<code src="../demos/sandbox-renderer-dataviz.tsx">数据可视化 - 图表代码与执行结果回调</code>

## API

### SandboxRendererProps

| 属性       | 说明                                                       | 类型                     | 默认值 | 版本 |
| ---------- | ---------------------------------------------------------- | ------------------------ | ------ | ---- |
| className  | 自定义类名                                                 | `string`                 | -      | -    |
| code       | 要执行的 JavaScript 代码，可通过 `document` / `shadowRoot` 操作渲染容器 | `string` | -      | -    |
| globals    | 注入到沙箱的额外全局变量（代码内可直接访问）               | `Record<string, unknown>` | -      | -    |
| height     | 渲染容器高度                                               | `number \| string`       | `320`  | -    |
| onExecute  | 执行成功回调，参数为代码 `return` 的值                     | `(result: unknown) => void` | -   | -    |
| onError    | 执行失败回调                                               | `(error: Error) => void` | -      | -    |
| showStatus | 是否展示执行状态（加载中 / 错误提示）                      | `boolean`                | `true` | -    |
| style      | 自定义内联样式                                             | `React.CSSProperties`    | -      | -    |
| timeout    | 代码执行超时时间（毫秒）                                   | `number`                 | `3000` | -    |

## 安全边界 {#security}

- **作用域 DOM**：`document.createElement` 等创建真实节点；`querySelector` / `getElementById` 等查询限定在 Shadow DOM 容器内，`document.body` / `document.write` 等宿主入口被拦截。
- **白名单全局**：`fetch`、`XMLHttpRequest`、`localStorage`、`eval`、`Function` 等危险全局不可用。
- **超时与资源**：默认 3 秒超时，死循环会被指令计数器中断。
- **协议建议**：让 agent 输出自包含 DOM 脚本或纯数据；需要 npm 依赖 / React 工程级代码时，请使用服务端容器或独立 iframe，不要交给本组件。

## 注意事项 {#notes}

1. `code` / `globals` / `timeout` 变化会清空容器并重新执行。
2. 代码内 `console.log` 会以 `[Sandbox]` 前缀输出到宿主控制台。
3. 事件监听器随容器清空一并释放，无需手动清理。
