---
name: component-workspace
description: Develop Workspace and tabs (Browser, File, Task, Realtime) in @ant-design/agentic-ui. Use when building workspace panel, browser preview, file viewer, task list tab, or realtime follow. Triggers on workspace, Workspace, browser tab, file tab, task tab.
---

# Workspace 组件开发

多标签工作区：浏览器预览、文件查看、任务列表、实时跟进等标签页。

## 源码位置

- 主组件：`src/Workspace/index.tsx`
- 子面板：`src/Workspace/Browser.tsx`、`src/Workspace/File/`、`src/Workspace/RealtimeFollow/`、`TaskList` 等
- 类型：`src/Workspace/types.ts`（TabConfiguration、TabItem、WorkspaceProps 等）

## 主要能力

- 通过 `tabs`、`activeKey`、`onTabChange` 配置标签与切换
- 内置类型：browser、file、realtime、task 等，可扩展 `custom` 类型
- 与 AgenticLayout、ChatLayout 等布局配合使用

## 开发规范

- 样式使用 token 与 `useWorkspaceStyle`（或等价 createStyles）。
- 新增 tab 类型时在类型中声明并保持与现有 TabItem 结构一致。
- 参考 `AGENTS.md` 的 Props 命名与导出规范。

开发或修改工作区、浏览器/文件/任务标签时，参考 `src/Workspace/` 与 `AGENTS.md`。
