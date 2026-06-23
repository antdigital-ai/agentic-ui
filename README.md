# Agentic UI

<div align="center">

[![NPM version](https://img.shields.io/npm/v/@ant-design/agentic-ui.svg?style=flat)](https://npmjs.org/package/@ant-design/agentic-ui)
[![NPM downloads](http://img.shields.io/npm/dm/@ant-design/agentic-ui.svg?style=flat)](https://npmjs.org/package/@ant-design/agentic-ui)
[![License](https://img.shields.io/npm/l/@ant-design/agentic-ui.svg)](https://npmjs.org/package/@ant-design/agentic-ui)

<p>面向智能体的 UI 组件库，提供多步推理可视化、工具调用展示、任务执行协同等 Agentic UI 能力。</p>
<p>从“回答一句话”到“完成一件事”——让智能体真正成为你的协作伙伴。</p>

</div>

## ✨ 特性

- **🤖 多步推理可视化** - 清晰展示智能体的“思考—行动—观察”完整链路
- **🔧 工具调用展示** - 可视化 API 调用、参数传递与执行结果
- **🧠 智能体协同** - 支持任务分解、进度跟踪与人在回路（Human-in-the-loop）交互
- **📝 流式 Markdown** - 支持打字机效果、数学公式、代码高亮与多模态输入
- **🎨 开箱即用** - 基于 Ant Design 体系，提供完整的 TypeScript 类型定义
- **🔌 插件化架构** - 灵活扩展图表、公式、代码格式化等能力

## 📦 安装

推荐使用 `npm` 或 `pnpm` 进行安装：

```bash
npm install @ant-design/agentic-ui
# 或
pnpm add @ant-design/agentic-ui
# 或
yarn add @ant-design/agentic-ui
```

## 🚀 快速开始

### 基础示例：AI 对话气泡

展示一个包含思维链（Thought Chain）的 AI 回复气泡：

```tsx
import { Bubble } from '@ant-design/agentic-ui';

export default () => (
  <Bubble.AIBubble
    content="我已经完成了数据分析，这是结果："
    thoughtChain={[
      { type: 'thought', content: '首先需要查询数据库' },
      { type: 'action', content: '执行 SQL 查询' },
      { type: 'observation', content: '获取到 1000 条记录' },
    ]}
  />
);
```

## 🧩 组件概览

### 🤖 核心智能体组件

| 组件 | 描述 |
| --- | --- |
| `Bubble` | 对话气泡，支持 AI（带思维链）和用户模式 |
| `ThoughtChainList` | 独立展示智能体的“思考—行动—观察”推理过程 |
| `TaskList` | 任务列表，展示多步骤任务的状态（进行中、完成、等待） |
| `ToolUseBar` | 工具调用状态栏，展示 API 调用详情 |
| `AgenticLayout` | 智能体应用的标准布局框架 |
| `Workspace` | 包含文件管理、浏览器预览的智能体工作台 |

### ✍️ 编辑与输入

| 组件 | 描述 |
| --- | --- |
| `MarkdownEditor` | 支持流式输出、插件扩展的 Markdown 编辑器 |
| `MarkdownInputField` | 支持多模态（语音、文件）的输入框 |
| `SchemaForm` | 基于 Schema 自动生成的表单组件 |

### 🎯 交互与反馈

| 组件 | 描述 |
| --- | --- |
| `SuggestionList` | 下一步操作或问题的建议列表 |
| `WelcomeMessage` | 应用启动时的欢迎语引导 |
| `History` | 会话历史记录管理 |
| `AnswerAlert` | 用于展示结果状态的提示组件 |

## 💡 设计理念

**Agentic UI** 旨在解决传统 Chat UI 在处理复杂任务时的局限性。

| 维度 | Chat UI (LUI) | Agentic UI |
| --- | --- | --- |
| **核心目标** | 回答一句话 | 完成一件事 |
| **交互深度** | 单轮问答 | 端到端任务协同 |
| **过程可见性** | 黑盒（只看结果） | 透明化（可见思考与工具调用） |
| **人机关系** | 被动响应 | 主动协作 |

我们不仅提供界面控件，更提供一种**面向过程**的交互范式，让用户理解 AI 的决策逻辑，从而建立信任并进行有效协作。

## ⌨️ 本地开发

克隆仓库并安装依赖：

```bash
git clone git@github.com:ant-design/agentic-ui.git
cd agentic-ui
corepack enable
pnpm install
```

> 若 `pnpm i` 报需要 Node.js v22.13，说明当前是 pnpm 10+；请执行 `corepack prepare pnpm@9.15.9 --activate` 后再安装（见 [AGENTS.md](./AGENTS.md) 故障排查）。

启动文档站点进行预览：

```bash
pnpm start
# 访问 http://localhost:8000
```

运行测试：

```bash
pnpm test
```

构建产物：

```bash
pnpm build
```

## 🤝 贡献

欢迎参与共建！请查阅 [贡献指南](./CONTRIBUTING.md) 了解如何提交 Pull Request 和报告 Issue。

## 🔗 相关资源

- [在线文档](https://ant-design.github.io/agentic-ui/)
- [Ant Design](https://ant.design/)

## 📄 许可证

[MIT](./LICENSE)
