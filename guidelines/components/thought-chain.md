# ThoughtChainList

Visualizes the reasoning process, including tool calls, web searches, and deep thinking steps.

## Usage

```tsx
import { ThoughtChainList } from '@ant-design/agentic-ui';

<ThoughtChainList
  items={[
    {
      type: 'tool-call',
      content: 'Calling API...',
      status: 'success'
    },
    {
      type: 'reasoning',
      content: 'Thinking about the result...',
    }
  ]}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `ThoughtChainItem[]` | List of thought items to display. |
| `loading` | `boolean` | Whether the chain is active/loading. |
