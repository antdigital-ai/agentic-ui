---
name: component-agent-run-bar
description: Develop AgentRunBar for agent run control (play, pause, stop) in @ant-design/agentic-ui. Use when building run/pause/stop UI, task status bar, or agent control. Triggers on AgentRunBar, run bar, play pause stop, agent control, TASK_STATUS.
---

# AgentRunBar 组件开发

智能体运行控制条：播放、暂停、停止等，与任务状态（TASK_STATUS）联动。

## 源码位置

- 主组件：`src/AgentRunBar/index.tsx`
- 图标与子组件：`src/AgentRunBar/icons`、`Robot` 等
- 样式：`src/AgentRunBar/style.ts`
- 状态枚举：`TASK_STATUS`（RUNNING、SUCCESS、ERROR、PAUSE、STOPPED、CANCELLED）

## 主要能力

- 运行状态展示、播放/暂停/停止按钮
- 与 I18nContext、ConfigProvider 配合
- 可配合 TaskList、ThoughtChainList 使用

## 开发规范

- 使用 token 与 createStyles；事件使用 `on` 前缀。
- 新增状态或按钮时与 TASK_STATUS 及现有 API 保持一致。

修改运行控制条时，参考 `src/AgentRunBar/` 与 `AGENTS.md`。
