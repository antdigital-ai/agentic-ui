---
title: TaskRunning 任务运行状态
atomId: TaskRunning
group:
  title: 对话流
  order: 3
---

# TaskRunning 任务运行状态

用于展示任务的运行状态，包括运行时长、当前状态和操作按钮。支持多种状态切换和交互操作。

## 代码演示

<code src="../demos/task-running.tsx">基础用法</code>

## API

### TaskRunning

| 参数              | 说明                   | 类型                                  | 默认值      |
| ----------------- | ---------------------- | ------------------------------------- | ----------- |
| title             | 标题文案               | `string`                              | -           |
| description       | 描述文案               | `string`                              | -           |
| taskStatus        | 任务状态               | `TASK_STATUS`                         | -           |
| taskRunningStatus | 任务运行状态           | `TASK_RUNNING_STATUS`                 | -           |
| icon              | 自定义图标             | `React.ReactNode`                     | -           |
| iconTooltip       | 图标提示文案           | `string`                              | -           |
| actionsRender     | 自定义操作按钮         | `TaskRunningActionsRender` \| `false` | -           |
| variant           | 主题样式变体           | `'simple' \| 'default'`               | `'default'` |
| onCreateNewTask   | 创建新任务的回调函数   | `() => void`                          | -           |
| onPause           | 暂停任务的回调函数     | `() => void`                          | -           |
| onResume          | 继续任务的回调函数     | `() => void`                          | -           |
| onStop            | 停止任务的回调函数     | `() => void`                          | -           |
| onReplay          | 重新回放任务的回调函数 | `() => void`                          | -           |
| onViewResult      | 查看任务结果的回调函数 | `() => void`                          | -           |
| locale            | 国际化配置             | `object`                              | -           |
| className         | 自定义类名             | `string`                              | -           |
| style             | 自定义样式             | `React.CSSProperties`                 | -           |

### 类型定义

#### TASK_STATUS

任务状态枚举，用于控制任务的整体状态显示。

```typescript
enum TASK_STATUS {
  /** 任务正在运行中 */
  RUNNING = 'running',
  /** 任务已成功完成 */
  SUCCESS = 'success',
  /** 任务执行出错 */
  ERROR = 'error',
  /** 任务已暂停 */
  PAUSE = 'pause',
  /** 任务已停止 */
  STOPPED = 'stopped',
  /** 任务已取消 */
  CANCELLED = 'cancelled',
}
```

#### TASK_RUNNING_STATUS

任务运行状态枚举，用于细粒度控制机器人动画和按钮显示。

```typescript
enum TASK_RUNNING_STATUS {
  /** 正在运行中 */
  RUNNING = 'running',
  /** 已完成 */
  COMPLETE = 'complete',
  /** 已暂停 */
  PAUSE = 'pause',
}
```

#### TaskRunningActionsRender

自定义操作按钮渲染函数类型。

```typescript
type TaskRunningActionsRender = (props: {
  status?: TASK_STATUS;
  runningStatus?: TASK_RUNNING_STATUS;
}) => React.ReactNode;
```
