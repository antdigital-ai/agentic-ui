# ToolUseBar

Displays tool execution status and results in a compact bar.

## Usage

```tsx
import { ToolUseBar } from '@ant-design/agentic-ui';

<ToolUseBar
  tools={[
    { name: 'Search', status: 'success' },
    { name: 'Calculator', status: 'processing' }
  ]}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `tools` | `ToolItem[]` | List of tools to display. |
