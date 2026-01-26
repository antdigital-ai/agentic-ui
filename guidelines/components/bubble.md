# Bubble

Bubbles are the core building blocks of a chat interface. They display messages from users or the AI agent.

## Usage

```tsx
import { Bubble } from '@ant-design/agentic-ui';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

// AI Bubble
<Bubble
  placement="start"
  content="Hello, how can I help you?"
  avatar={{ icon: <RobotOutlined /> }}
/>

// User Bubble
<Bubble
  placement="end"
  content="I need help with design."
  avatar={{ icon: <UserOutlined /> }}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `content` | `ReactNode` | The message content. |
| `placement` | `'start' \| 'end'` | Position of the bubble. `start` for AI, `end` for User. |
| `avatar` | `BubbleMetaData` | Avatar configuration (icon, title, etc.). |
| `loading` | `boolean` | Whether the bubble is in a loading state. |
| `typing` | `boolean` | Whether to show typing effect. |
| `timestamp` | `string` | Time to display. |

## Variants

- **AI Bubble**: Left-aligned (`placement="start"`), usually with a robot avatar.
- **User Bubble**: Right-aligned (`placement="end"`), usually with a user avatar.
- **System Bubble**: Centered or distinct style for system notifications.
