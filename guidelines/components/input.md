# MarkdownInputField

A powerful input component for chat interfaces, supporting Markdown, file attachments, and voice input.

## Usage

```tsx
import { MarkdownInputField } from '@ant-design/agentic-ui';

function ChatInput() {
  const [value, setValue] = useState('');

  return (
    <MarkdownInputField
      value={value}
      onChange={setValue}
      onSend={async (val) => {
        console.log('Send:', val);
        setValue('');
      }}
      placeholder="Type a message..."
      attachment={{
        enable: true,
        onUpload: async (file) => {
          // Upload logic
          return { url: '...' };
        }
      }}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Current text value. |
| `onChange` | `(val: string) => void` | Callback when text changes. |
| `onSend` | `(val: string) => Promise<void>` | Callback when sending message. |
| `placeholder` | `string` | Placeholder text. |
| `disabled` | `boolean` | Whether the input is disabled. |
| `loading` | `boolean` | Whether the input is in a loading state. |
| `attachment` | `object` | Configuration for file attachments. |
| `triggerSendKey` | `'Enter' \| 'Mod+Enter'` | Key to trigger send (default 'Enter'). |

## Features

- **Markdown Support**: Built-in markdown highlighting and preview.
- **Attachments**: Supports file uploads with preview.
- **Voice Input**: Extensible voice input support.
- **Auto-height**: Automatically expands as user types.
