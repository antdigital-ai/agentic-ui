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

<code src="../demos/task-list.tsx">基础用法</code>

## API

### TaskList

| 参数                 | 说明                                | 类型                               | 默认值 |
| -------------------- | ----------------------------------- | ---------------------------------- | ------ |
| items                | 任务列表数据                        | `TaskItem[]`                       | `[]`   |
| className            | 自定义类名                          | `string`                           | -      |
| expandedKeys         | 受控模式：当前展开的任务项 key 数组 | `string[]`                         | -      |
| onExpandedKeysChange | 受控模式：展开状态变化时的回调函数  | `(expandedKeys: string[]) => void` | -      |

### TaskItem

| 参数    | 说明         | 类型                                             | 默认值 |
| ------- | ------------ | ------------------------------------------------ | ------ |
| key     | 任务唯一标识 | `string`                                         | -      |
| title   | 任务标题     | `React.ReactNode`                                | -      |
| content | 任务内容     | `React.ReactNode \| React.ReactNode[]`           | -      |
| status  | 任务状态     | `'success' \| 'loading' \| 'pending' \| 'error'` | -      |

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
