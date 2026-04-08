---
name: agentic-ui-usage
description: Guides how to use @ant-design/agentic-ui in applications (install, import, layout, chat, editor, i18n). Use when integrating the library, building chat/agent UI, or asking about component API from consumer perspective. Triggers on 使用 agentic-ui, 集成, 引入, 安装, chat UI, 智能体界面, 接入, import from agentic-ui, ConfigProvider, locale.
---

# Agentic UI 组件库使用指南

面向在业务项目中**使用** `@ant-design/agentic-ui` 的开发者：安装、引入、常见场景与 API 查阅方式。

## 安装与依赖

```bash
pnpm add @ant-design/agentic-ui
# 或 npm / yarn
```

- **Peer**：`react`、`react-dom` >= 16.9.0（项目需已安装）。
- **运行时依赖**：包内已含 `antd`、`@ant-design/cssinjs` 等，无需单独安装。
- 使用前确保项目已正确引入 Ant Design 样式或 CSS-in-JS 方案（与 antd 5 一致）。

## 引入方式

```tsx
// 按需引入常用组件
import {
  AgenticLayout,
  ChatLayout,
  History,
  Workspace,
  Bubble,
  AIBubble,
  UserBubble,
  MarkdownInputField,
  MarkdownEditor,
  ThoughtChainList,
  ToolUseBar,
  TaskList,
  AgentRunBar,
  WelcomeMessage,
  ChatBootPage,
} from '@ant-design/agentic-ui';

// 类型
import type { HistoryItemProps, BubbleListProps } from '@ant-design/agentic-ui';
```

- 组件与类型均从 `@ant-design/agentic-ui` 单入口导出，无需从子路径导入。
- 若打包器支持 Tree Shaking，未用到的组件会被剔除。

## 典型使用场景

### 1. 智能体聊天整体布局

左栏历史 + 中间聊天 + 右侧工作区：

```tsx
<AgenticLayout
  left={<History dataSource={sessions} onSelect={...} />}
  center={
    <ChatLayout
      header={...}
      content={<Bubble.List messages={messages} />}
      footer={<MarkdownInputField onSubmit={...} />}
    />
  }
  right={<Workspace tabs={[...]} />}
  header={{ leftCollapsed, rightCollapsed, onLeftCollapse, onRightCollapse }}
/>
```

### 2. 仅聊天区域（无三栏）

```tsx
<ChatLayout
  content={<Bubble.List messages={messages} />}
  footer={<MarkdownInputField onSubmit={...} />}
/>
```

### 3. 消息列表与气泡

- 使用 `Bubble.List` + `AIBubble` / `UserBubble` 或直接传入 `messages` 与渲染约定。
- 流式、思维链、工具调用等由气泡与 ThoughtChainList、ToolUseBar 等配合展示。

### 4. 编辑器与输入

- **只读/展示**：`MarkdownEditor` 只读模式或直接渲染 Markdown。
- **可编辑**：`MarkdownEditor` 受控 + `value` / `onChange`。
- **输入框**：`MarkdownInputField` 支持附件、语音、发送等，通过 `onSubmit` 等回调与后端对接。

### 5. 国际化

- 通过 Ant Design 的 `ConfigProvider` 传入 `locale`，与 antd 一致。
- 组件库内置中英文等 locale，可合并或覆盖：`import { locale } from '@ant-design/agentic-ui'`（具体以文档为准），再传给 `ConfigProvider`。

## API 与文档查阅

- **组件 API**：仓库内 `docs/components/` 下各组件文档（如 `agentic-layout.md`、`bubble.md`），含 Props、受控/非受控说明。
- **Demo**：`docs/demos-pages/` 与站点 Demo 页（如 layout、chat、editor、markdown-input-field、workspace、history 等）对应实际用法。
- **类型**：从 `@ant-design/agentic-ui` 导出，用 TypeScript 时可查看 `.d.ts` 或 IDE 提示。

## 使用注意

- 布局类（如 `AgenticLayout`、`ChatLayout`）需保证外层有合适宽高（如 100vh/100%）。
- 列表类（History、Bubble.List）注意数据源格式与文档中的类型定义一致。
- 主题与 token 随 Ant Design ConfigProvider 与主题配置生效，与 antd 5 一致。

在业务项目中接入、写页面或查 API 时，可优先参考本文与官方文档 Demo，再按需查阅各组件文档。