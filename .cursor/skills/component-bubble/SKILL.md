---
name: component-bubble
description: Develop and extend Bubble components (AIBubble, UserBubble, Bubble list) for AI chat messages in @ant-design/agentic-ui. Use when building chat bubbles, message content, streaming display, thought chain in bubble, or voice/copy actions. Triggers on bubble, chat message, AIBubble, UserBubble, message list.
---

# Bubble 组件开发

聊天气泡相关组件的开发与扩展，包括 AI 消息气泡、用户消息气泡和气泡列表。

## 源码位置

- 主入口与导出：`src/Bubble/index.tsx`
- AI 气泡：`src/Bubble/AIBubble`
- 用户气泡：`src/Bubble/UserBubble`
- 通用容器：`src/Bubble/Bubble.tsx`
- 列表：`src/Bubble/List`
- 类型：`src/Bubble/type.ts`、`src/Bubble/types/`

## 主要导出

```ts
AIBubble, UserBubble, Bubble, runRender
PureAIBubble, PureUserBubble, PureBubble, PureBubbleList
BubbleConfigProvide 及相关 context
```

## 开发规范

- 样式使用 `@ant-design/cssinjs` 的 `createStyles`，颜色/间距使用 token。
- 事件回调使用 `on` 前缀（如 `onClick`、`onCopy`）。
- 支持 `classNames`、`styles` 做 Semantic 样式扩展。
- 参考项目根目录 `AGENTS.md` 的命名与 API 规范。

## 常用能力

- **AIBubble**：流式内容、思维链折叠、状态（success/error/loading）、工具调用展示。
- **UserBubble**：用户头像、多模态内容、操作按钮。
- **List**：气泡列表、自动滚动、空状态。

开发或修改气泡相关功能时，优先查阅上述源码与 `AGENTS.md`，并保持与现有 API 兼容。
