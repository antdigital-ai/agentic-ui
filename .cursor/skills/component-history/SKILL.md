---
name: component-history
description: Develop History component for chat/conversation history list in @ant-design/agentic-ui. Use when building history sidebar, session list, search, delete, or load more. Triggers on History, history list, session list, conversation history, agentId, sessionId.
---

# History 组件开发

会话历史列表：按 agent/session 拉取、展示、搜索、删除、加载更多等。

## 源码位置

- 主组件：`src/History/index.tsx`
- 子组件与 hooks：`src/History/components/`、`src/History/hooks/useHistory.ts`、`src/History/menu`
- 类型：`src/History/types/`（HistoryProps、HistoryData、HistoryList 等）
- 样式：`src/History/style.ts`

## 主要 Props

- `agentId`、`sessionId`、`request` 用于数据拉取
- `onClick`、`onDeleteItem`、`onInit`、`onShow`
- `standalone`、`emptyRender`、`customDateFormatter` 等

## 开发规范

- 使用 token 与 createStyles；列表项结构见 `generateHistoryItems` 等。
- 与 ChatLayout 侧栏、MarkdownInputField 等组合时保持数据流清晰。

修改历史组件时，参考 `src/History/` 与 `AGENTS.md`。
