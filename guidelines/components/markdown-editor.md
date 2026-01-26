# MarkdownEditor

A rich text editor optimized for Markdown, suitable for chat inputs and editing code.

## Usage

```tsx
import { MarkdownEditor } from '@ant-design/agentic-ui';

<MarkdownEditor
  initValue="Type your message..."
  onChange={(val) => console.log(val)}
  readonly={false}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `initValue` | `string` | Initial markdown content. |
| `onChange` | `(value: string) => void` | Callback when content changes. |
| `readonly` | `boolean` | If true, the editor is read-only. |
| `editorRef` | `RefObject` | Ref to access editor instance. |
| `plugins` | `Plugin[]` | Custom plugins to extend functionality. |

## Features
- Standard Markdown support (bold, italic, lists, code blocks).
- Syntax highlighting.
- Extensible via plugins.
