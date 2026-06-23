---
title: TaskList 任务列表
atomId: TaskList
group:
  title: 对话流
  order: 3
---

# TaskList 任务列表

用于展示任务列表的组件，支持折叠/展开、加载状态和不同的任务状态。

## 代码演示

<code src="../demos/task-list.tsx">基础用法 - 多状态任务流</code>

<code src="../demos/task-list-simple.tsx">Simple 模式 - 紧凑摘要条</code>

<code src="../demos/task-list-task-complete-text.tsx">Simple 模式 - 自定义任务完成文案</code>

## API

### TaskList (TaskListProps)

> **类型名变更**：Props 类型已从 `ThoughtChainProps` 重命名为 `TaskListProps`。旧类型名仍可使用但已标记 deprecated。

| 属性                 | 说明                                                                                     | 类型                                                                            | 默认值      | 版本   |
| -------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------- | ------ |
| items                | 任务列表数据                                                                             | `TaskItem[]`                                                                    | `[]`        | -      |
| loading              | 外部加载状态；全部 item 为 `success` 时摘要显示完成态；流式结束后请置 `false`            | `boolean`                                                                       | `false`     | -      |
| className            | 自定义类名                                                                               | `string`                                                                        | -           | -      |
| expandedKeys         | 受控模式：当前展开的任务项 key 数组                                                      | `string[]`                                                                      | -           | -      |
| onExpandedKeysChange | 受控模式：展开状态变化时的回调函数                                                       | `(expandedKeys: string[]) => void`                                              | -           | -      |
| variant              | 组件变体，`simple` 模式将任务列表收起为紧凑的单行摘要条                                  | `'default' \| 'simple'`                                                         | `'default'` | 2.31.0 |
| open                 | `simple` 模式下摘要条是否展开（受控）                                                    | `boolean`                                                                       | -           | 2.31.0 |
| onOpenChange         | `simple` 模式下摘要条展开状态变化回调                                                    | `(open: boolean) => void`                                                       | -           | 2.31.0 |
| taskCompleteText     | 任务全部完成时摘要条的文案，未配置时回退到 i18n 默认值（仅在 `variant="simple"` 时渲染） | `` `React.ReactNode \| ((params: { items: TaskItem[] }) => React.ReactNode)` `` | -           | 2.31.0 |
| showProgress         | `simple` 模式下摘要条内是否展示「已完成/总数」进度计数                                   | `boolean`                                                                       | `false`     | 2.32.33 |
| scrollIntoViewOnExpand | `simple` 模式下展开摘要条时是否将组件滚动到视窗内；传 `true` 默认 `{ behavior: 'smooth', block: 'nearest' }`，也可传 `ScrollIntoViewOptions` 自定义；初次挂载不触发 | `boolean \| ScrollIntoViewOptions`                                              | `false`     | 2.32.33 |

### TaskItem

| 属性    | 说明                                                                                                                                                     | 类型                                             | 默认值 | 版本 |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------ | ---- |
| key     | 任务唯一标识                                                                                                                                             | `string`                                         | -      | -    |
| title   | 任务标题                                                                                                                                                 | `React.ReactNode`                                | -      | -    |
| content | 任务内容；支持字符串、React 节点；JSON/工具调用场景下的序列化元素（如 `{ type: 'pre', props: { children } }`）会在渲染前规范化；正文为空时回退为 `title` | `React.ReactNode \| React.ReactNode[]`           | -      | -    |
| status  | 任务状态；`pending` 与 `loading` 展示一致（主色 + Loading 图标），摘要「进行中」逻辑相同                                                                 | `'success' \| 'loading' \| 'pending' \| 'error'` | -      | -    |

### Simple 模式与摘要状态 {#simple-variant-summary}

`variant="simple"` 将列表收成摘要条 + 可展开详情：

- **收起（默认 `open=false`）**：详情区只展示**最后一项**任务（产品预期）；要看全部步骤请点击摘要条展开，或传入 `open={true}` / 使用 `variant="default"`。
- **展开**：展示全部 `items`（含 `error` 项；单步工具失败时仍可查看完整步骤）。
- **摘要文案优先级**（由高到低）：
  1. 全部 item 为 `success` → 「任务完成」（或 `taskCompleteText`）；**不因** `loading={true}` 滞留为进行中。
  2. 存在 `status: 'loading'` 或 `pending` 的 item → 「正在进行${title}任务」。
  3. `loading={true}` 或仅有 `pending` → 「正在进行任务」。

  存在 `error` 的 item 不参与摘要完成判定；当其余 item 均为 `success` 时摘要仍显示完成态，不在摘要条展示「任务已取消」。展开详情时仍可查看 `error` 步骤。

工具调用时间线若需逐步 API 展示，可优先考虑 [ToolUseBar](/components/tool-use-bar)；继续用 TaskList simple 时请接受收起时仅显示最后一步，并保证流式结束后 `loading={false}`、item `status` 与内容字段正确。

### 自定义任务完成文案示例

`taskCompleteText` 仅在 `variant="simple"` 摘要条上生效，未配置时回退到 i18n 默认值（如「任务完成」）。
支持直接传入 `React.ReactNode`（字符串 / JSX），也支持传入函数 `({ items }) => ReactNode` 基于当前任务列表动态生成。

```tsx
import { TaskList } from '@ant-design/agentic-ui';

export default () => {
  const items = [
    { key: '1', title: '任务 1', status: 'success', content: '内容 1' },
    { key: '2', title: '任务 2', status: 'success', content: '内容 2' },
  ];

  return (
    <>
      {/* 字符串 */}
      <TaskList items={items} variant="simple" taskCompleteText="报告已生成" />

      {/* 函数：基于 items 动态生成 */}
      <TaskList
        items={items}
        variant="simple"
        taskCompleteText={({ items }) => `共完成 ${items.length} 项任务`}
      />
    </>
  );
};
```

### 受控模式示例

```tsx
import { useState } from 'react';
import { TaskList } from '@ant-design/agentic-ui';

export default () => {
  const [expandedKeys, setExpandedKeys] = useState(['task-1']);

  const items = [
    {
      key: 'task-1',
      title: '任务 1',
      status: 'success',
      content: '任务内容 1',
    },
    {
      key: 'task-2',
      title: '任务 2',
      status: 'loading',
      content: '任务内容 2',
    },
  ];

  return (
    <TaskList
      items={items}
      expandedKeys={expandedKeys}
      onExpandedKeysChange={setExpandedKeys}
    />
  );
};
```

### 样式定制

组件使用了以下的样式变量，可以通过 CSS-in-JS 进行样式定制：

```ts
{
  // 任务项
  thoughtChainItem: {
    marginBottom: 4,
    display: 'flex'
  },
  // 左侧状态区域
  left: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '9px 0 0',
    gap: 4
  },
  // 右侧内容区域
  right: {
    padding: '8px 0'
  },
  // 状态图标
  status: {
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(0, 3, 9, 0.45)'
  },
  // 标题
  title: {
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '20px',
    color: 'rgba(0, 3, 9, 0.85)'
  }
}
```
