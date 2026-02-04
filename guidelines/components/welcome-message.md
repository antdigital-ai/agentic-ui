# WelcomeMessage

Displays a welcoming title and description, often used at the start of a new chat session.

## Usage

```tsx
import { WelcomeMessage } from '@ant-design/agentic-ui';

<WelcomeMessage
  title="Hello! I'm your AI Assistant."
  description="Ask me anything about code, design, or writing."
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `ReactNode` | The main heading text. |
| `description` | `ReactNode` | Subtitle or description text. |
| `classNames` | `{ title?: string, description?: string }` | Custom classes for styling. |
| `titleAnimateProps` | `object` | Animation config for the title. |
| `descriptionAnimateProps` | `object` | Animation config for the description. |

## Animation
The component includes built-in typing and fade-in animations for a polished entry effect.
