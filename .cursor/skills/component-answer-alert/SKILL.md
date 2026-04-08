---
name: component-answer-alert
description: Develop AnswerAlert for result or status alert (success, error, warning, info) in @ant-design/agentic-ui. Use when showing answer status, alert message, or closable banner. Triggers on AnswerAlert, alert, success error warning info, answer status.
---

# AnswerAlert 组件开发

结果/状态提示条：成功、错误、警告、信息等类型，可带图标与操作。

## 源码位置

- 主组件：`src/AnswerAlert/index.tsx`
- 图标：`CloseIcon`、`ErrorIcon`、`InfoIcon`、`LoaderIcon`、`SuccessIcon`、`WarningIcon`（见 `components/`）
- 类型：`AnswerAlertProps`
- 样式：`src/AnswerAlert/style.ts`

## 主要 Props

- `message`、`description`、`icon`、`showIcon`
- `type`: 'success' | 'error' | 'warning' | 'info' | 'gray'
- 自定义操作项、关闭等

## 开发规范

- 使用 token 与 createStyles；与 Bubble、TaskList 等结果展示保持一致。

修改 AnswerAlert 时，参考 `src/AnswerAlert/` 与 `AGENTS.md`。
