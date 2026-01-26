# ChatLayout

The `ChatLayout` component provides a standard structure for chat interfaces, including a header, a scrollable content area, and a fixed footer.

## Usage

```tsx
import { ChatLayout } from '@ant-design/agentic-ui';

<ChatLayout
  header={{
    title: "AI Assistant",
    onLeftCollapse: () => console.log('Toggle sidebar'),
    onShare: () => console.log('Share chat')
  }}
  footer={
    <div style={{ padding: 16 }}>
       {/* Input component goes here */}
    </div>
  }
>
  {/* Chat messages (Bubbles) go here */}
  <Bubble content="Hello!" />
</ChatLayout>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `header` | `LayoutHeaderProps` | Configuration for the top bar (title, buttons). |
| `children` | `ReactNode` | The main scrollable content (usually a list of bubbles). |
| `footer` | `ReactNode` | Content fixed to the bottom (input area). |
| `footerHeight` | `number` | Height of the footer to reserve space. Default `48`. |
| `scrollBehavior` | `'auto' \| 'smooth'` | Scroll behavior for auto-scrolling. |

## Layout Structure

1. **Header**: Fixed at the top.
2. **Content**: Takes up remaining space, scrollable.
3. **Footer**: Fixed at the bottom.

## Best Practices
- Use `Bubble` components inside the `children`.
- Place your input component (like `MarkdownEditor` or `Sender`) in the `footer`.
