---
title: AgentRunBar 任务运行状态
atomId: AgentRunBar
group:
  title: 对话流
  order: 3
---

# AgentRunBar 任务运行状态

用于展示智能体任务的运行状态，包括运行时长、当前状态和操作按钮。支持运行中、暂停、停止、完成、出错、取消等多种状态切换和交互操作。

> 历史名称为 `TaskRunning`，已重命名为 `AgentRunBar`，原 `TaskRunning` 仍以别名形式导出但已废弃，新代码请使用 `AgentRunBar`。

## 何时使用

- 智能体执行后台任务时，向用户展示运行进度与可控操作
- 需要呈现任务运行 / 暂停 / 停止 / 完成 / 错误 / 取消 等状态
- 需要在状态发生变化时提供「暂停 / 继续 / 停止 / 重试 / 新建任务 / 查看结果」入口

## 代码演示

<code src="../demos/task-running.tsx">AgentRunBar - 全状态演示</code>

## API

### AgentRunBarProps

| 属性              | 说明                                                | 类型                                  | 默认值      | 版本 |
| ----------------- | --------------------------------------------------- | ------------------------------------- | ----------- | ---- |
| taskStatus        | 任务宏观状态（终态或主流程态）                      | `TaskStatus`                          | -           | -    |
| taskRunningStatus | 任务运行过程态                                      | `TaskRunningStatus`                   | -           | -    |
| title             | 标题文案                                            | `string`                              | -           | -    |
| description       | 描述文案                                            | `string`                              | -           | -    |
| icon              | 自定义图标                                          | `React.ReactNode`                     | -           | -    |
| iconTooltip       | 图标提示文案                                        | `string`                              | -           | -    |
| variant           | 主题样式变体                                        | `'simple' \| 'default'`               | `'default'` | -    |
| actionsRender     | 自定义操作按钮（不影响 stop/pause/resume 控制按钮） | `AgentRunBarActionsRender \| false`   | -           | -    |
| onCreateNewTask   | 创建新任务的回调                                    | `() => void`                          | -           | -    |
| onPause           | 暂停任务的回调                                      | `() => void`                          | -           | -    |
| onResume          | 继续任务的回调                                      | `() => void`                          | -           | -    |
| onStop            | 停止任务的回调                                      | `() => void`                          | -           | -    |
| onReplay          | 重新执行任务的回调                                  | `() => void`                          | -           | -    |
| onViewResult      | 查看任务结果的回调                                  | `() => void`                          | -           | -    |
| locale            | 国际化配置（覆盖默认按钮文案）                      | `{ agentRunBar?: AgentRunBarLocale }` | -           | -    |
| className         | 自定义类名                                          | `string`                              | -           | -    |
| style             | 自定义样式                                          | `React.CSSProperties`                 | -           | -    |

> `actionsRender` 三态语义：
>
> - `undefined`：使用内置默认 `actionNode`（依据 `taskStatus` / `taskRunningStatus` 自动选择）
> - `false`：不渲染任何自定义 `actionNode`；停止 / 暂停 / 继续控制按钮仍按状态显示
> - 函数：调用并将其返回值作为 `actionNode` 渲染（返回 `false` / `null` 等同于不渲染）

### 类型定义

#### TaskStatus

任务宏观状态联合类型。

```typescript
type TaskStatus =
  | 'running' // 任务正在运行中
  | 'success' // 任务已成功完成
  | 'error' // 任务执行出错
  | 'pause' // 任务已暂停
  | 'stopped' // 任务已停止
  | 'cancelled'; // 任务已取消
```

> 同名常量对象 `TASK_STATUS`（如 `TASK_STATUS.RUNNING`）作为向后兼容保留；推荐直接使用字符串字面量以获得更好的 tree-shaking。

#### TaskRunningStatus

任务运行过程态联合类型，用于细粒度控制机器人动画与按钮显示。

```typescript
type TaskRunningStatus =
  | 'running' // 正在运行中
  | 'complete' // 已完成
  | 'pause'; // 已暂停
```

> 同名常量对象 `TASK_RUNNING_STATUS` 作为向后兼容保留。

#### AgentRunBarVariant

```typescript
type AgentRunBarVariant = 'simple' | 'default';
```

#### AgentRunBarActionsRender

自定义操作按钮渲染函数类型。

```typescript
type AgentRunBarActionsRender = (props: {
  status?: TaskStatus;
  runningStatus?: TaskRunningStatus;
}) => React.ReactNode;
```

#### locale.agentRunBar

| 字段          | 说明             | 默认值（中文） |
| ------------- | ---------------- | -------------- |
| play          | 继续按钮 tooltip | `继续`         |
| pause         | 暂停按钮 tooltip | `暂停`         |
| stop          | 停止按钮 tooltip | `停止`         |
| createNewTask | 新建任务按钮文案 | `新任务`       |
| replayTask    | 重新执行按钮文案 | `重新执行`     |
| newTask       | 新任务按钮文案   | `新任务`       |
| submitTask    | 提交任务按钮文案 | `提交任务`     |

## 别名（向后兼容）

| 历史名称                   | 新名称                     | 说明             |
| -------------------------- | -------------------------- | ---------------- |
| `TaskRunning`              | `AgentRunBar`              | 组件别名，已废弃 |
| `TaskRunningProps`         | `AgentRunBarProps`         | 类型别名，已废弃 |
| `TaskRunningVariant`       | `AgentRunBarVariant`       | 类型别名，已废弃 |
| `TaskRunningActionsRender` | `AgentRunBarActionsRender` | 类型别名，已废弃 |

> 旧名称仍可正常导入，但会在未来大版本移除，请优先使用 `AgentRunBar` 系列名称。
