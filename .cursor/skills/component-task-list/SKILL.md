---
name: component-task-list
description: Develop TaskList for step or task status display in @ant-design/agentic-ui. Use when showing task items, expand/collapse, status icons, or thought chain in tasks. Triggers on TaskList, task list, task item, step list, TaskItem, TaskStatus.
---

# TaskList 组件开发

任务/步骤列表展示，支持展开折叠、状态图标与思维链等。

## 源码位置

- 导出：`src/TaskList/index.tsx`
- 主组件：`src/TaskList/TaskList.tsx`
- 子组件：`TaskListItem`、`StatusIcon` 等见 `src/TaskList/components/`
- 类型：`src/TaskList/types.ts`（TaskItem、TaskListProps、TaskStatus、TaskListVariant、ThoughtChainProps）

## 主要能力

- `items`、`expandedKeys`、`onExpandedKeysChange` 控制列表与展开
- `variant`、`open`/`onOpenChange` 等
- 与 ActionIconBox、I18nContext 配合

## 开发规范

- 样式使用 token 与 `useStyle(prefixCls)`，BEM 类名。
- 新增状态或变体时在 types 中补充，保持向后兼容。

修改任务列表时，参考 `src/TaskList/` 与 `AGENTS.md`。
