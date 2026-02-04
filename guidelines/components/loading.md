# Loading

Displays a loading state with an optional spinner, tip, or progress indicator.

## Usage

```tsx
import { Loading } from '@ant-design/agentic-ui';

// Basic usage
<Loading tip="Loading..." />

// With progress
<Loading percent={75} />

// Nested mode (wrapping content)
<Loading spinning={isLoading}>
  <div className="content">
    Content to be covered by loading mask
  </div>
</Loading>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `spinning` | `boolean` | Whether to show the loading state. Default `true`. |
| `tip` | `ReactNode` | Text to display below the spinner. |
| `size` | `number \| string` | Size of the spinner. |
| `percent` | `number` | Progress percentage (0-100). If set, shows a progress ring. |
| `indicator` | `ReactNode` | Custom loading indicator. |
| `children` | `ReactNode` | Content to wrap. If provided, loading overlay covers this content. |
