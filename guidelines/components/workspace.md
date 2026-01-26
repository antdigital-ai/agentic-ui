# Workspace

A multi-tab workspace environment that can display real-time updates, a browser view, tasks, and files.

## Usage

```tsx
import { Workspace } from '@ant-design/agentic-ui';

<Workspace
  title="Project Workspace"
  activeTabKey="browser"
  onTabChange={(key) => console.log(key)}
  onClose={() => console.log('Close')}
>
  <Workspace.Realtime
    tab={{ key: 'realtime', title: 'Live' }}
    data={[{ type: 'log', content: 'System started...' }]}
  />
  <Workspace.Browser
    tab={{ key: 'browser', title: 'Preview' }}
    url="https://example.com"
  />
  <Workspace.Task
    tab={{ key: 'tasks', title: 'Plan' }}
    data={[{ id: '1', title: 'Init', status: 'completed' }]}
  />
  <Workspace.File
    tab={{ key: 'files', title: 'Code' }}
    items={[{ name: 'index.ts', content: 'console.log("Hi")' }]}
  />
</Workspace>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `activeTabKey` | `string` | Controlled active tab key. |
| `onTabChange` | `(key: string) => void` | Callback when tab changes. |
| `title` | `ReactNode` | Workspace title. |
| `onClose` | `() => void` | Callback when close button is clicked. |
| `pure` | `boolean` | Minimalist mode (no shadows/borders). |
| `headerExtra` | `ReactNode` | Extra content in header right side. |

## Sub-components

### Workspace.Realtime
Displays a stream of real-time events or logs.

### Workspace.Browser
An iframe-based browser preview component.
- `url`: The URL to display.

### Workspace.Task
Displays a list of tasks (wraps `TaskList`).

### Workspace.File
A file explorer and viewer.
- `items`: List of file objects `{ name, content, language }`.

### Workspace.Custom
Wrapper for custom tab content.
