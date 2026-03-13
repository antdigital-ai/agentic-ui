---
name: component-tool-use
description: Develop ToolUseBar and ToolUseBarThink for displaying tool/API calls in @ant-design/agentic-ui. Use when showing tool invocations, API call results, cost or duration. Triggers on tool use, tool call, API call, ToolUseBar, ToolUseBarThink.
---

# ToolUseBar / ToolUseBarThink 组件开发

工具调用与“思考中”状态展示条，用于在对话中呈现工具名称、参数、结果与耗时等。

## 源码位置

- 工具调用条：`src/ToolUseBar/index.tsx`、`src/ToolUseBar/BarItem.tsx`
- 思考条：`src/ToolUseBarThink/index.tsx`

## 主要能力

- **ToolUseBar**：工具名称、状态、参数、结果、耗时（costMillis）等展示。
- **ToolUseBarThink**：思考中/加载状态条，常与思维链或 Bubble 配合。

## 开发规范

- 样式使用 `createStyles` 与 token，支持 `classNames`/`styles`。
- 事件与回调使用 `on` 前缀。
- 与 Bubble、ThoughtChainList 等组件协同使用时，保持展示风格一致。

修改或扩展工具调用展示时，参考 `src/ToolUseBar/`、`src/ToolUseBarThink/` 及 `AGENTS.md`。
