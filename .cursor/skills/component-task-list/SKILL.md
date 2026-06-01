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
- `variant="simple"`：收起时 `visibleItems` 仅为最后一项；摘要状态见 `TaskList.tsx` useMemo
- `loading`：外部流式标记；全部 item 为 `success` 时摘要为完成态
- `pending` 与 `loading` UI 合并：`isTaskInProgress` / `getTaskStatusStyleKey`（`constants.ts`），摘要与图标统一按进行中处理
- 与 ActionIconBox、I18nContext 配合

## 内容规范化

- `src/TaskList/normalizeTaskContent.ts`：`normalizeTaskContent(content, fallbackTitle?)` 提取字符串/序列化 React 描述；空正文回退 `title`
- `TaskListItem` 渲染前规范化；`hasNormalizedTaskContent` 控制展开箭头
- Markdown 嵌入：`normalizeTaskListPropsFromJson`（`agenticUiEmbedUtils.ts`）对每项 `content` 调用同一工具

## 开发规范

- 样式使用 token 与 `useStyle(prefixCls)`，BEM 类名。
- 新增状态或变体时在 types 中补充，保持向后兼容。
- 勿改 simple 收起时 `visibleItems = [lastItem]` 逻辑；展开时展示全部 `items`（含 `error` 项，不因工具失败只保留最后一项）。

修改任务列表时，参考 `src/TaskList/`、`docs/components/task-list.md` 与 `AGENTS.md`。
