# Robot

Displays a robot avatar that can change state (e.g., thinking vs. idle).

## Usage

```tsx
import { Robot } from '@ant-design/agentic-ui';

// Default state (Dazing/Idle)
<Robot size={40} />

// Running state (Thinking)
<Robot status="running" size={40} />

// Custom Icon
<Robot icon={<MyCustomIcon />} />
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `status` | `'default' \| 'running'` | State of the robot. `running` shows thinking animation. |
| `size` | `number` | Size in pixels. Default `42`. |
| `icon` | `ReactNode \| string` | Custom icon component or image URL. Overrides default robot animations. |
