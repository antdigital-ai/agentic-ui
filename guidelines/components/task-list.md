# TaskList

Displays a list of tasks with their status (pending, in-progress, completed).

## Usage

```tsx
import { TaskList } from '@ant-design/agentic-ui';

<TaskList
  tasks={[
    { id: '1', title: 'Step 1', status: 'completed' },
    { id: '2', title: 'Step 2', status: 'in-progress' }
  ]}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `tasks` | `TaskItem[]` | List of tasks. |
